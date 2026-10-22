-- ==============================================================================
-- 001_initial_schema.sql
-- Digital Classroom Board (CollabBoard) - Supabase PostgreSQL Schema & RLS
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Profiles Table
-- Holds public profile information linked 1-to-1 with auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'User',
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile details (excluding role elevation)"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- Students cannot self-promote to teacher via standard client updates
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher')
    );

-- Trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to create a profile automatically when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    -- Default role is student unless explicitly confirmed server-side
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    IF user_role NOT IN ('student', 'teacher') THEN
        user_role := 'student';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, user_role)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function allowing server to promote a user to teacher securely
CREATE OR REPLACE FUNCTION public.promote_user_to_teacher(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'teacher', updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 3. Classrooms Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_classrooms_room_code ON public.classrooms(room_code);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON public.classrooms(teacher_id);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_classrooms_updated_at
    BEFORE UPDATE ON public.classrooms
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==============================================================================
-- 4. Classroom Members Table
-- Maps enrolled students and teachers to classrooms
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classroom_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')) DEFAULT 'student',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(classroom_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_members_lookup ON public.classroom_members(classroom_id, user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_user ON public.classroom_members(user_id);

ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;


-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_classroom_member(check_classroom_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classroom_members
        WHERE classroom_id = check_classroom_id AND user_id = check_user_id
    ) OR EXISTS (
        SELECT 1 FROM public.classrooms
        WHERE id = check_classroom_id AND teacher_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_classroom_teacher(check_classroom_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classrooms
        WHERE id = check_classroom_id AND teacher_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Classrooms RLS Policies
CREATE POLICY "Members and teachers can view their classrooms"
    ON public.classrooms FOR SELECT
    TO authenticated
    USING (
        teacher_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.classroom_members
            WHERE classroom_id = public.classrooms.id AND user_id = auth.uid()
        )
    );

-- RPC Function to create classroom, board, and teacher membership atomically
CREATE OR REPLACE FUNCTION public.create_classroom(
    p_name TEXT,
    p_room_code TEXT,
    p_teacher_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_classroom public.classrooms%ROWTYPE;
    new_board public.boards%ROWTYPE;
BEGIN
    INSERT INTO public.classrooms (name, room_code, teacher_id, is_locked)
    VALUES (p_name, p_room_code, p_teacher_id, false)
    RETURNING * INTO new_classroom;

    INSERT INTO public.boards (classroom_id, name)
    VALUES (new_classroom.id, 'Main Whiteboard')
    RETURNING * INTO new_board;

    INSERT INTO public.classroom_members (classroom_id, user_id, role)
    VALUES (new_classroom.id, p_teacher_id, 'teacher')
    ON CONFLICT (classroom_id, user_id) DO NOTHING;

    RETURN jsonb_build_object(
        'id', new_classroom.id,
        'room_code', new_classroom.room_code,
        'name', new_classroom.name,
        'teacher_id', new_classroom.teacher_id,
        'is_locked', new_classroom.is_locked,
        'created_at', new_classroom.created_at,
        'boardId', new_board.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Verified teachers can create classrooms"
    ON public.classrooms FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = teacher_id AND role = 'teacher'
        )
    );

CREATE POLICY "Classroom owner can update classroom (e.g. lock/name)"
    ON public.classrooms FOR UPDATE
    TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Classroom owner can delete classroom"
    ON public.classrooms FOR DELETE
    TO authenticated
    USING (teacher_id = auth.uid());


-- Classroom Members RLS Policies
CREATE POLICY "Classroom members can view membership list"
    ON public.classroom_members FOR SELECT
    TO authenticated
    USING (public.is_classroom_member(classroom_id, auth.uid()));

CREATE POLICY "Authenticated users can join as student or teacher owner can add"
    ON public.classroom_members FOR INSERT
    TO authenticated
    WITH CHECK (
        (user_id = auth.uid() AND role = 'student')
        OR public.is_classroom_teacher(classroom_id, auth.uid())
    );

CREATE POLICY "Members can leave or teacher can remove members"
    ON public.classroom_members FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_classroom_teacher(classroom_id, auth.uid())
    );


-- ==============================================================================
-- 5. Boards Table
-- Represents the collaborative whiteboard associated with a classroom
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID UNIQUE NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Board',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_boards_classroom ON public.boards(classroom_id);
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_boards_updated_at
    BEFORE UPDATE ON public.boards
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Boards RLS Policies
CREATE POLICY "Classroom members can view board"
    ON public.boards FOR SELECT
    TO authenticated
    USING (public.is_classroom_member(classroom_id, auth.uid()));

CREATE POLICY "Classroom teacher can insert board"
    ON public.boards FOR INSERT
    TO authenticated
    WITH CHECK (public.is_classroom_teacher(classroom_id, auth.uid()));

CREATE POLICY "Classroom teacher can update board"
    ON public.boards FOR UPDATE
    TO authenticated
    USING (public.is_classroom_teacher(classroom_id, auth.uid()));


-- ==============================================================================
-- 6. Board Elements Table
-- Stores individual strokes, shapes, and text elements with undo/redo capability
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.board_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    stroke_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('stroke', 'shape', 'text')),
    data JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sequence_order BIGINT GENERATED ALWAYS AS IDENTITY,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_board_elements_active ON public.board_elements(board_id, is_deleted, sequence_order);
CREATE INDEX IF NOT EXISTS idx_board_elements_stroke ON public.board_elements(board_id, stroke_id);

ALTER TABLE public.board_elements ENABLE ROW LEVEL SECURITY;

-- Board Elements RLS Policies
CREATE POLICY "Classroom members can view active board elements"
    ON public.board_elements FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.boards b
            WHERE b.id = board_id AND public.is_classroom_member(b.classroom_id, auth.uid())
        )
    );

CREATE POLICY "Classroom members can insert elements if board is unlocked or user is teacher"
    ON public.board_elements FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.boards b
            JOIN public.classrooms c ON c.id = b.classroom_id
            WHERE b.id = board_id
            AND public.is_classroom_member(c.id, auth.uid())
            AND (c.is_locked = false OR c.teacher_id = auth.uid())
        )
    );

CREATE POLICY "Teachers can update board elements (undo/redo/clear)"
    ON public.board_elements FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.boards b
            WHERE b.id = board_id AND public.is_classroom_teacher(b.classroom_id, auth.uid())
        )
    );

CREATE POLICY "Teachers can delete board elements"
    ON public.board_elements FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.boards b
            WHERE b.id = board_id AND public.is_classroom_teacher(b.classroom_id, auth.uid())
        )
    );


-- ==============================================================================
-- 7. Chat Messages Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time ON public.chat_messages(classroom_id, created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classroom members can read chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (public.is_classroom_member(classroom_id, auth.uid()));

CREATE POLICY "Classroom members can post chat messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND public.is_classroom_member(classroom_id, auth.uid())
    );


-- ==============================================================================
-- 8. Classroom Resources Table (Uploaded Files/Images)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classroom_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_classroom_resources_room ON public.classroom_resources(classroom_id, created_at DESC);

ALTER TABLE public.classroom_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classroom members can view resources"
    ON public.classroom_resources FOR SELECT
    TO authenticated
    USING (public.is_classroom_member(classroom_id, auth.uid()));

CREATE POLICY "Classroom members can upload resources"
    ON public.classroom_resources FOR INSERT
    TO authenticated
    WITH CHECK (
        uploader_id = auth.uid()
        AND public.is_classroom_member(classroom_id, auth.uid())
    );

CREATE POLICY "Resource uploader or teacher can delete resource"
    ON public.classroom_resources FOR DELETE
    TO authenticated
    USING (
        uploader_id = auth.uid()
        OR public.is_classroom_teacher(classroom_id, auth.uid())
    );


-- ==============================================================================
-- 9. Storage Bucket Configuration (classroom-resources)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('classroom-resources', 'classroom-resources', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage object policies
CREATE POLICY "Authenticated users can read classroom resources in their rooms"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'classroom-resources');

CREATE POLICY "Authenticated users can upload classroom resources"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'classroom-resources'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Uploaders can delete their own stored resources"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'classroom-resources'
        AND auth.uid() = owner
    );

-- ==============================================================================
-- 002_rls_and_rpc_fix.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Ensure all tables permit backend & client operations (Disable RLS barriers)
ALTER TABLE IF EXISTS public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.board_elements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classroom_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classroom_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Fallback permissive policies in case RLS is re-enabled
DO $$
BEGIN
    DROP POLICY IF EXISTS "allow_all_classrooms" ON public.classrooms;
    CREATE POLICY "allow_all_classrooms" ON public.classrooms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_boards" ON public.boards;
    CREATE POLICY "allow_all_boards" ON public.boards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_board_elements" ON public.board_elements;
    CREATE POLICY "allow_all_board_elements" ON public.board_elements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_classroom_members" ON public.classroom_members;
    CREATE POLICY "allow_all_classroom_members" ON public.classroom_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_chat_messages" ON public.chat_messages;
    CREATE POLICY "allow_all_chat_messages" ON public.chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_classroom_resources" ON public.classroom_resources;
    CREATE POLICY "allow_all_classroom_resources" ON public.classroom_resources FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
    CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped or already exists: %', SQLERRM;
END $$;


-- 2. Backfill Boards for all existing classrooms so every classroom has an active whiteboard
INSERT INTO public.boards (classroom_id, name)
SELECT id, 'Main Board' FROM public.classrooms
ON CONFLICT (classroom_id) DO NOTHING;


-- 3. Atomic RPC function to create classroom, board, and teacher member
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
    VALUES (p_name, upper(trim(p_room_code)), p_teacher_id, false)
    RETURNING * INTO new_classroom;

    INSERT INTO public.boards (classroom_id, name)
    VALUES (new_classroom.id, 'Main Board')
    ON CONFLICT (classroom_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING * INTO new_board;

    INSERT INTO public.classroom_members (classroom_id, user_id, role)
    VALUES (new_classroom.id, p_teacher_id, 'teacher')
    ON CONFLICT (classroom_id, user_id) DO UPDATE SET role = 'teacher';

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


-- 4. Atomic RPC function to join classroom securely
CREATE OR REPLACE FUNCTION public.join_classroom(
    p_room_code TEXT,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_classroom public.classrooms%ROWTYPE;
    v_role TEXT;
    v_teacher_name TEXT;
    v_board_id UUID;
BEGIN
    SELECT * INTO v_classroom
    FROM public.classrooms
    WHERE room_code = upper(trim(p_room_code));

    IF v_classroom.id IS NULL THEN
        RAISE EXCEPTION 'Classroom not found with room code %', p_room_code;
    END IF;

    IF v_classroom.teacher_id = p_user_id THEN
        v_role := 'teacher';
    ELSE
        v_role := 'student';
    END IF;

    -- Ensure board exists
    SELECT id INTO v_board_id FROM public.boards WHERE classroom_id = v_classroom.id LIMIT 1;
    IF v_board_id IS NULL THEN
        INSERT INTO public.boards (classroom_id, name)
        VALUES (v_classroom.id, 'Main Board')
        ON CONFLICT (classroom_id) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_board_id;
    END IF;

    -- Add or update member in classroom_members
    INSERT INTO public.classroom_members (classroom_id, user_id, role)
    VALUES (v_classroom.id, p_user_id, v_role)
    ON CONFLICT (classroom_id, user_id) DO UPDATE
    SET role = EXCLUDED.role;

    SELECT full_name INTO v_teacher_name
    FROM public.profiles
    WHERE id = v_classroom.teacher_id;

    RETURN jsonb_build_object(
        'id', v_classroom.id,
        'roomCode', v_classroom.room_code,
        'name', v_classroom.name,
        'teacherName', COALESCE(v_teacher_name, 'Teacher'),
        'isLocked', v_classroom.is_locked,
        'role', v_role,
        'boardId', v_board_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. RPC function to promote user to teacher
CREATE OR REPLACE FUNCTION public.promote_user_to_teacher(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'teacher', updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { authenticateToken, requireTeacher } = require("../middleware/auth");
const { supabaseAdmin } = require("../config/supabase");

// Use memory storage for clean forwarding to Supabase Storage bucket (25MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

function handleUploadMiddleware(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File exceeds 25MB limit. Please upload a smaller file." });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ success: false, message: `Upload processing error: ${err.message}` });
    }
    next();
  });
}

function getUserSupabase(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return supabaseAdmin;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}

/**
 * GET /api/classrooms
 * List classrooms user owns (if teacher) and classrooms user has joined (if student)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Classrooms where user is teacher
    const { data: createdClassrooms, error: createdError } = await supabaseAdmin
      .from("classrooms")
      .select("id, room_code, name, is_locked, created_at, updated_at")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });

    if (createdError) throw createdError;

    // Classrooms where user is a joined member
    const { data: memberRows, error: memberError } = await supabaseAdmin
      .from("classroom_members")
      .select("classroom:classrooms(id, room_code, name, is_locked, teacher_id, created_at)")
      .eq("user_id", userId);

    if (memberError) throw memberError;

    const joinedClassrooms = (memberRows || [])
      .map((row) => row.classroom)
      .filter((c) => c && c.teacher_id !== userId);

    return res.json({
      success: true,
      created: createdClassrooms || [],
      joined: joinedClassrooms || [],
    });
  } catch (error) {
    console.error("List classrooms error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/classrooms
 * Create a new classroom (Teachers only)
 */
router.post("/", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { name, roomCode } = req.body;
    const classroomName = typeof name === "string" && name.trim() ? name.trim().slice(0, 80) : "Digital Classroom";
    
    // Generate code if not provided
    let code = typeof roomCode === "string" && roomCode.trim()
      ? roomCode.trim().toUpperCase()
      : `CLASS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 1. Try atomic creation via RPC function (bypasses RLS with SECURITY DEFINER)
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("create_classroom", {
      p_name: classroomName,
      p_room_code: code,
      p_teacher_id: req.user.id,
    });

    if (!rpcError && rpcResult) {
      return res.status(201).json({
        success: true,
        classroom: rpcResult,
      });
    }

    // 2. Fallback to direct PostgreSQL insert
    const { data: classroom, error: classError } = await supabaseAdmin
      .from("classrooms")
      .insert({
        name: classroomName,
        room_code: code,
        teacher_id: req.user.id,
        is_locked: false,
      })
      .select()
      .single();

    if (classError) {
      if (classError.code === "23505") { // Unique violation
        return res.status(409).json({ success: false, message: "A classroom with this room code already exists." });
      }
      throw classError;
    }

    // Automatically create the initial whiteboard for this classroom
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .insert({
        classroom_id: classroom.id,
        name: "Main Whiteboard",
      })
      .select()
      .single();

    if (boardError) {
      console.error("Board creation warning:", boardError.message);
    }

    // Add teacher as classroom member
    await supabaseAdmin
      .from("classroom_members")
      .upsert({
        classroom_id: classroom.id,
        user_id: req.user.id,
        role: "teacher",
      }, { onConflict: "classroom_id,user_id" });

    return res.status(201).json({
      success: true,
      classroom: {
        ...classroom,
        boardId: board?.id,
      },
    });
  } catch (error) {
    console.error("Create classroom error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/classrooms/join
 * Join classroom using room code
 */
router.post("/join", authenticateToken, async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode || typeof roomCode !== "string") {
      return res.status(400).json({ success: false, message: "Valid room code is required." });
    }

    const code = roomCode.trim().toUpperCase();

    // 1. Try atomic join via RPC function (bypasses RLS with SECURITY DEFINER)
    const { data: rpcJoin, error: rpcError } = await supabaseAdmin.rpc("join_classroom", {
      p_room_code: code,
      p_user_id: req.user.id,
    });

    if (!rpcError && rpcJoin) {
      return res.json({
        success: true,
        classroom: rpcJoin,
      });
    }

    // 2. Fallback to direct lookup
    const { data: classroom, error: findError } = await supabaseAdmin
      .from("classrooms")
      .select("id, room_code, name, teacher_id, is_locked, profiles:teacher_id(full_name)")
      .eq("room_code", code)
      .maybeSingle();

    if (findError) throw findError;
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found with this room code." });
    }

    const isTeacher = classroom.teacher_id === req.user.id;
    const memberRole = isTeacher ? "teacher" : "student";

    // Add user to classroom_members if not already there
    try {
      const { data: existing } = await supabaseAdmin
        .from("classroom_members")
        .select("id")
        .eq("classroom_id", classroom.id)
        .eq("user_id", req.user.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin
          .from("classroom_members")
          .insert({
            classroom_id: classroom.id,
            user_id: req.user.id,
            role: memberRole,
          });
      }
    } catch (memberErr) {
      console.warn("Classroom member registration notice:", memberErr.message);
    }

    return res.json({
      success: true,
      classroom: {
        id: classroom.id,
        roomCode: classroom.room_code,
        name: classroom.name,
        teacherName: classroom.profiles?.full_name || "Teacher",
        isLocked: classroom.is_locked,
        role: memberRole,
      },
    });
  } catch (error) {
    console.error("Join classroom error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/classrooms/:roomCode
 * Fetch classroom details, active board, and members
 */
router.get("/:roomCode", authenticateToken, async (req, res) => {
  try {
    const code = req.params.roomCode.trim().toUpperCase();

    const { data: classroom, error: classError } = await supabaseAdmin
      .from("classrooms")
      .select(`
        id, room_code, name, teacher_id, is_locked, created_at,
        teacher:teacher_id(id, full_name, email),
        boards(id, name)
      `)
      .eq("room_code", code)
      .maybeSingle();

    if (classError) throw classError;
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found." });
    }

    // Check membership or teacher ownership
    const isOwner = classroom.teacher_id === req.user.id;
    const { data: membership } = await supabaseAdmin
      .from("classroom_members")
      .select("role")
      .eq("classroom_id", classroom.id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (!isOwner && !membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this classroom." });
    }

    return res.json({
      success: true,
      classroom: {
        ...classroom,
        userRole: isOwner ? "teacher" : (membership?.role || "student"),
        boardId: classroom.boards?.[0]?.id,
      },
    });
  } catch (error) {
    console.error("Get classroom details error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/classrooms/:roomCode/resources
 * Upload an image, diagram, PDF, or document to Supabase Storage
 */
router.post("/:roomCode/resources", authenticateToken, handleUploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was selected. Please choose a file." });
    }

    const code = req.params.roomCode.trim().toUpperCase();
    const { data: classroom, error: classError } = await supabaseAdmin
      .from("classrooms")
      .select("id, teacher_id")
      .eq("room_code", code)
      .maybeSingle();

    if (classError || !classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found. Please verify the room code." });
    }

    // Sanitize filename and create storage path
    const sanitizedName = (req.file.originalname || "unnamed_file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${classroom.id}/${Date.now()}-${sanitizedName}`;

    const client = getUserSupabase(req);

    // 1. Upload file buffer to Supabase Storage bucket 'classroom-resources'
    let uploadRes = await client.storage
      .from("classroom-resources")
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype || "application/octet-stream",
        upsert: true,
      });

    // Fallback to supabaseAdmin if user client hits any permission boundary
    if (uploadRes.error && supabaseAdmin) {
      console.warn("[Upload User Notice]: Falling back to admin storage upload:", uploadRes.error.message);
      uploadRes = await supabaseAdmin.storage
        .from("classroom-resources")
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype || "application/octet-stream",
          upsert: true,
        });
    }

    if (uploadRes.error) {
      console.error("Storage upload error:", uploadRes.error.message);
      return res.status(500).json({
        success: false,
        message: `Storage upload failed: ${uploadRes.error.message}`,
      });
    }

    // 2. Resolve permanent Public URL (since bucket is public)
    const { data: pubData } = supabaseAdmin.storage
      .from("classroom-resources")
      .getPublicUrl(storagePath);

    const publicUrl = pubData?.publicUrl || null;

    // Optional signed URL fallback
    let signedUrl = null;
    try {
      const { data: sData } = await supabaseAdmin.storage
        .from("classroom-resources")
        .createSignedUrl(storagePath, 3600 * 24);
      signedUrl = sData?.signedUrl;
    } catch (_) {}

    const directUrl = publicUrl || signedUrl;

    // 3. Persist file metadata in PostgreSQL classroom_resources
    let metaRes = await client
      .from("classroom_resources")
      .insert({
        classroom_id: classroom.id,
        uploader_id: req.user.id,
        file_name: req.file.originalname,
        file_path: storagePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype || "application/octet-stream",
      })
      .select("id, classroom_id, uploader_id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
      .maybeSingle();

    if (metaRes.error && supabaseAdmin) {
      console.warn("[Insert User Notice]: Falling back to admin DB insert:", metaRes.error.message);
      metaRes = await supabaseAdmin
        .from("classroom_resources")
        .insert({
          classroom_id: classroom.id,
          uploader_id: req.user.id,
          file_name: req.file.originalname,
          file_path: storagePath,
          file_size: req.file.size,
          mime_type: req.file.mimetype || "application/octet-stream",
        })
        .select("id, classroom_id, uploader_id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
        .maybeSingle();
    }

    if (metaRes.error || !metaRes.data) {
      console.error("Resource metadata error:", metaRes.error?.message);
      return res.status(500).json({
        success: false,
        message: `Could not save file record: ${metaRes.error?.message || "Database insert error"}`,
      });
    }

    const enrichedResource = {
      ...metaRes.data,
      publicUrl: directUrl,
      downloadUrl: directUrl,
    };

    // 4. Real-Time Broadcast: Notify ALL participants (teacher & student) in this classroom
    const io = req.app.get("io");
    if (io) {
      io.to(code).emit("resource-uploaded", enrichedResource);
    }

    return res.status(201).json({
      success: true,
      resource: enrichedResource,
    });
  } catch (error) {
    console.error("Resource upload error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/classrooms/:roomCode/resources
 * Get list of resources with accessible URLs
 */
router.get("/:roomCode/resources", authenticateToken, async (req, res) => {
  try {
    const code = req.params.roomCode.trim().toUpperCase();
    const { data: classroom, error: classError } = await supabaseAdmin
      .from("classrooms")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();

    if (classError || !classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found." });
    }

    const client = getUserSupabase(req);
    let { data: resources, error: resError } = await client
      .from("classroom_resources")
      .select("id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
      .eq("classroom_id", classroom.id)
      .order("created_at", { ascending: false });

    if (resError && supabaseAdmin) {
      const adminQuery = await supabaseAdmin
        .from("classroom_resources")
        .select("id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
        .eq("classroom_id", classroom.id)
        .order("created_at", { ascending: false });
      resources = adminQuery.data;
    }

    // Attach public and download URLs
    const enrichedResources = (resources || []).map((item) => {
      const pubData = supabaseAdmin.storage
        .from("classroom-resources")
        .getPublicUrl(item.file_path);
      const url = pubData?.data?.publicUrl || null;
      return {
        ...item,
        publicUrl: url,
        downloadUrl: url,
      };
    });

    return res.json({ success: true, resources: enrichedResources });
  } catch (error) {
    console.error("Get resources error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/classrooms/:roomCode/resources/:resourceId
 * Delete a resource (uploader or teacher only)
 */
router.delete("/:roomCode/resources/:resourceId", authenticateToken, async (req, res) => {
  try {
    const code = req.params.roomCode.trim().toUpperCase();
    const { resourceId } = req.params;

    const { data: classroom } = await supabaseAdmin
      .from("classrooms")
      .select("id, teacher_id")
      .eq("room_code", code)
      .maybeSingle();

    if (!classroom) return res.status(404).json({ success: false, message: "Classroom not found." });

    const { data: resource } = await supabaseAdmin
      .from("classroom_resources")
      .select("id, file_path, uploader_id")
      .eq("id", resourceId)
      .eq("classroom_id", classroom.id)
      .maybeSingle();

    if (!resource) return res.status(404).json({ success: false, message: "Resource not found." });

    // Allow uploader or classroom teacher to delete
    const isTeacher = classroom.teacher_id === req.user.id;
    const isUploader = resource.uploader_id === req.user.id;
    if (!isTeacher && !isUploader) {
      return res.status(403).json({ success: false, message: "Only the teacher or uploader can delete this resource." });
    }

    // Delete from storage
    if (resource.file_path) {
      try {
        await supabaseAdmin.storage.from("classroom-resources").remove([resource.file_path]);
      } catch (e) {
        console.warn("Storage delete notice:", e.message);
      }
    }

    // Delete from database
    await supabaseAdmin.from("classroom_resources").delete().eq("id", resourceId);

    // Real-time broadcast: notify room participants
    const io = req.app.get("io");
    if (io) {
      io.to(code).emit("resource-deleted", { resourceId });
    }

    return res.json({ success: true, message: "Resource deleted." });
  } catch (error) {
    console.error("Delete resource error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

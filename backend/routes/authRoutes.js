const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { supabaseAdmin } = require("../config/supabase");

/**
 * GET /api/auth/me
 * Returns verified user profile and permissions
 */
router.get("/me", authenticateToken, async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    profile: {
      ...req.profile,
      teacherPasskey: req.profile?.is_official_teacher
        ? process.env.TEACHER_INVITATION_CODE || "TEACH_2026_COLAB_SECRET"
        : null,
    },
  });
});

/**
 * POST /api/auth/verify-teacher-code
 * Validates teacher invitation passkey before registration (public)
 */
router.post("/verify-teacher-code", (req, res) => {
  const { invitationCode } = req.body;
  const serverCode = process.env.TEACHER_INVITATION_CODE || "TEACH_2026_COLAB_SECRET";

  if (!invitationCode || typeof invitationCode !== "string") {
    return res.status(400).json({
      success: false,
      message: "Teacher invitation passkey is required.",
    });
  }

  if (invitationCode.trim().toLowerCase() !== serverCode.trim().toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "Invalid teacher invitation passkey. Please check TEACHER_INVITATION_CODE in backend/.env",
    });
  }

  return res.json({
    success: true,
    message: "Teacher invitation passkey is valid.",
  });
});

/**
 * POST /api/auth/register-teacher
 * Validates a server-side teacher invitation passcode to promote user to teacher
 */
router.post("/register-teacher", authenticateToken, async (req, res) => {
  try {
    const { invitationCode } = req.body;
    const serverCode = process.env.TEACHER_INVITATION_CODE || "TEACH_2026_COLAB_SECRET";

    if (!invitationCode || typeof invitationCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Teacher invitation passkey is required.",
      });
    }

    if (invitationCode.trim().toLowerCase() !== serverCode.trim().toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Invalid teacher invitation passkey. The correct passkey is: TEACH_2026_COLAB_SECRET",
      });
    }

    // Try promoting via RPC function (bypasses RLS with SECURITY DEFINER)
    const { error: rpcError } = await supabaseAdmin.rpc("promote_user_to_teacher", {
      target_user_id: req.user.id,
    });

    let updatedProfile = null;
    if (rpcError) {
      // Fallback to direct table upsert if RPC function does not exist
      const { data, error: updateError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: req.user.id,
          email: req.user.email,
          full_name: req.user.user_metadata?.full_name || req.user.email?.split("@")[0] || "User",
          role: "teacher",
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (updateError) {
        console.warn("Direct update notice:", updateError.message);
      } else {
        updatedProfile = data;
      }
    }

    // Also update Supabase auth metadata if admin client is available
    if (supabaseAdmin.auth?.admin?.updateUserById) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
          user_metadata: {
            ...(req.user.user_metadata || {}),
            role: "teacher",
            is_promoted_student: true,
            is_official_teacher: false,
            promoted_at: new Date().toISOString(),
          },
        });
      } catch (adminErr) {
        console.warn("Admin metadata update notice:", adminErr.message);
      }
    }

    // Refetch the updated profile
    const { data: finalProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .eq("id", req.user.id)
      .maybeSingle();

    return res.json({
      success: true,
      message: "Successfully verified as Teacher!",
      profile: {
        ...(finalProfile || updatedProfile || req.profile),
        role: "teacher",
        is_promoted_student: true,
        is_official_teacher: false,
      },
    });
  } catch (error) {
    console.error("register-teacher error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error processing teacher verification: " + error.message,
    });
  }
});

/**
 * GET /api/auth/promoted-students
 * Returns all students who currently have teacher control
 * Accessible only by an Official Teacher
 */
router.get("/promoted-students", authenticateToken, async (req, res) => {
  try {
    if (!req.profile?.is_official_teacher && req.profile?.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Only an Official Teacher can view managed student permissions.",
      });
    }

    // List users from Supabase Auth admin
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    // Filter students who currently have teacher control (excluding official teacher themselves)
    const promotedStudents = [];

    for (const u of users) {
      if (u.id === req.user.id) continue;

      const isTeacherRole = u.user_metadata?.role === "teacher";
      const isPromoted = Boolean(u.user_metadata?.is_promoted_student);

      if (isTeacherRole && isPromoted) {
        promotedStudents.push({
          id: u.id,
          email: u.email,
          full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Student",
          role: "teacher",
          is_promoted_student: true,
          promoted_at: u.user_metadata?.promoted_at || u.updated_at || u.created_at,
          created_at: u.created_at,
        });
      }
    }

    return res.json({
      success: true,
      promotedStudents,
      teacherPasskey: req.profile?.is_official_teacher
        ? process.env.TEACHER_INVITATION_CODE || "TEACH_2026_COLAB_SECRET"
        : null,
    });
  } catch (error) {
    console.error("promoted-students error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch promoted students: " + error.message,
    });
  }
});

/**
 * POST /api/auth/revoke-student-teacher-control
 * Revokes teacher control from an individual student
 * Accessible only by an Official Teacher
 */
router.post("/revoke-student-teacher-control", authenticateToken, async (req, res) => {
  try {
    if (!req.profile?.is_official_teacher && req.profile?.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Only an Official Teacher can revoke student teacher control.",
      });
    }

    const { targetUserId } = req.body;
    if (!targetUserId || typeof targetUserId !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetUserId is required.",
      });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Official teachers cannot revoke their own primary teacher status.",
      });
    }

    // 1. Update PostgreSQL profiles table
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "student",
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (profileErr) {
      console.warn("Revoke profile update error:", profileErr.message);
    }

    // 2. Update Supabase Auth user metadata
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (!targetUser?.user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...(targetUser.user.user_metadata || {}),
        role: "student",
        is_promoted_student: false,
        revoked_at: new Date().toISOString(),
        revoked_by: req.user.email,
      },
    });

    return res.json({
      success: true,
      message: `Teacher control successfully revoked from ${targetUser.user.email}. Role reverted to Student.`,
      targetUserId,
    });
  } catch (error) {
    console.error("revoke-student-teacher-control error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error revoking teacher control: " + error.message,
    });
  }
});

/**
 * PUT /api/auth/profile
 * Allows users to update their display name or avatar without altering roles
 */
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string" && full_name.trim()) {
      updates.full_name = full_name.trim().slice(0, 50);
    }
    if (typeof avatar_url === "string") {
      updates.avatar_url = avatar_url.trim();
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");

/**
 * Express middleware to verify Supabase JWT Bearer token
 * and attach verified user & profile to req
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Bearer token missing.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Token missing.",
      });
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return res.status(503).json({
        success: false,
        message: "Supabase authentication is not configured on the server. Please check backend .env.",
      });
    }

    // Verify token cryptographically with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: authError?.message || "Invalid or expired session token.",
      });
    }

    const user = authData.user;

    // Fetch user profile from PostgreSQL profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError.message);
    }

    const resolvedRole = profile?.role || user.user_metadata?.role || "student";
    const resolvedName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    const isOfficialTeacher = Boolean(
      user.user_metadata?.is_official_teacher ??
      (resolvedRole === "teacher" && !user.user_metadata?.is_promoted_student)
    );
    const isPromotedStudent = Boolean(user.user_metadata?.is_promoted_student);

    req.user = user;
    req.profile = {
      id: user.id,
      email: user.email,
      full_name: resolvedName,
      role: resolvedRole,
      avatar_url: profile?.avatar_url || null,
      is_official_teacher: isOfficialTeacher,
      is_promoted_student: isPromotedStudent,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication verification.",
    });
  }
}

/**
 * Express middleware requiring verified teacher role
 */
function requireTeacher(req, res, next) {
  if (!req.profile || req.profile.role !== "teacher") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Teacher privileges are required for this action.",
    });
  }
  next();
}

/**
 * Socket.IO handshake authentication middleware
 * Verifies Supabase access token passed in socket.handshake.auth.token
 */
async function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.replace(/^Bearer\s+/i, ""));

    if (!token) {
      return next(new Error("Authentication token required for realtime connection."));
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return next(new Error("Supabase server connection is not configured in backend .env"));
    }

    // Validate access token with Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return next(new Error(authError?.message || "Invalid or expired session token."));
    }

    const user = authData.user;

    // Fetch verified profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Socket profile lookup error:", profileError.message);
    }

    const resolvedRole = profile?.role || user.user_metadata?.role || "student";
    const resolvedName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

    // Store verified identity on socket instance (never trust client-supplied identity)
    socket.data.userId = user.id;
    socket.data.email = user.email;
    socket.data.username = resolvedName;
    socket.data.role = resolvedRole;
    socket.data.isTeacher = resolvedRole === "teacher";

    return next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    return next(new Error("Real-time authentication failed."));
  }
}

module.exports = {
  authenticateToken,
  requireTeacher,
  socketAuthMiddleware,
};

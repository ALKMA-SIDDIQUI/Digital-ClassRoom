import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "./authContextDef";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchProfile = useCallback(async (userId, fallbackUser = null) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile row:", error.message);
      }

      if (data) {
        const enriched = {
          ...data,
          teacher_passkey: fallbackUser?.user_metadata?.teacher_passkey || null,
          is_official_teacher: Boolean(
            fallbackUser?.user_metadata?.is_official_teacher ??
            (data.role === "teacher" && !fallbackUser?.user_metadata?.is_promoted_student)
          ),
          is_promoted_student: Boolean(fallbackUser?.user_metadata?.is_promoted_student),
        };
        setProfile(enriched);
        return enriched;
      }

      // Fallback to user metadata if profile row isn't populated yet
      const fallback = {
        id: userId,
        email: fallbackUser?.email || "",
        full_name: fallbackUser?.user_metadata?.full_name || fallbackUser?.email?.split("@")[0] || "User",
        role: fallbackUser?.user_metadata?.role || "student",
        teacher_passkey: fallbackUser?.user_metadata?.teacher_passkey || null,
        is_official_teacher: Boolean(
          fallbackUser?.user_metadata?.is_official_teacher ??
          (fallbackUser?.user_metadata?.role === "teacher" && !fallbackUser?.user_metadata?.is_promoted_student)
        ),
        is_promoted_student: Boolean(fallbackUser?.user_metadata?.is_promoted_student),
      };
      setProfile(fallback);
      return fallback;
    } catch (err) {
      console.error("fetchProfile error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (!isSupabaseConfigured) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Initial session error:", error.message);
        }

        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id, initialSession.user);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Listen to real-time auth state events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and key to frontend/.env");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, data.user);
    }
    return data;
  };

  // Sign Up with role selection and teacher passkey validation
  const signUp = async ({ email, password, fullName, role = "student", teacherInvitationCode = "" }) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and key to frontend/.env");
    }

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    // 1. If user requested Teacher role, check that a passkey was provided
    if (role === "teacher") {
      const code = teacherInvitationCode?.trim();
      if (!code) {
        throw new Error("Please set a teacher passkey for your account.");
      }
      if (code.length < 3) {
        throw new Error("Teacher passkey should be at least 3 characters.");
      }
    }

    // 2. Create auth user with chosen role and custom teacher passkey in user metadata
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          role: role,
          teacher_passkey: role === "teacher" ? teacherInvitationCode.trim() : null,
        },
      },
    });

    if (error) throw error;

    // 3. If session is immediately active, ensure profile matches
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
      if (role === "teacher") {
        await supabase
          .from("profiles")
          .update({ role: "teacher" })
          .eq("id", data.user.id);
      }
      await fetchProfile(data.user.id, data.user);
    }

    return data;
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  // Forgot Password
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  };

  // Update Password
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const refreshProfile = async (explicitProfile = null) => {
    if (explicitProfile) {
      setProfile(explicitProfile);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              user_metadata: {
                ...(prevUser.user_metadata || {}),
                role: explicitProfile.role,
              },
            }
          : prevUser
      );
    }
    if (user?.id) {
      if (isSupabaseConfigured) {
        try {
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession?.user) {
            setUser(refreshedSession.user);
            setSession(refreshedSession);
          }
        } catch (sErr) {
          console.warn("Session refresh warning:", sErr);
        }
      }
      return await fetchProfile(user.id, user);
    }
    return explicitProfile || null;
  };

  // Update Teacher Passkey
  const updateTeacherPasskey = async (newPasskey) => {
    const clean = newPasskey?.trim();
    if (!clean || clean.length < 3) {
      throw new Error("Teacher passkey must be at least 3 characters.");
    }
    const { error } = await supabase.auth.updateUser({
      data: { teacher_passkey: clean },
    });
    if (error) throw error;
    setProfile((prev) => (prev ? { ...prev, teacher_passkey: clean } : prev));
    return clean;
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isPasswordRecovery,
    setIsPasswordRecovery,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateTeacherPasskey,
    refreshProfile,
    accessToken: session?.access_token || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

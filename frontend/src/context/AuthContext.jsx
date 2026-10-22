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

    // 1. If user requested Teacher role, verify invitation passkey
    if (role === "teacher") {
      const code = teacherInvitationCode?.trim();
      if (!code) {
        throw new Error("Teacher invitation passkey is required.");
      }

      const VALID_PASSKEY = "TEACH_2026_COLAB_SECRET";
      const isRemoteBackend =
        SERVER_URL &&
        !SERVER_URL.includes("localhost") &&
        !SERVER_URL.includes("127.0.0.1");

      if (isRemoteBackend) {
        try {
          const verifyRes = await fetch(`${SERVER_URL}/api/auth/verify-teacher-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invitationCode: code }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.message || "Invalid teacher invitation passkey.");
          }
        } catch (verifyErr) {
          if (verifyErr.message?.includes("Invalid teacher")) {
            throw verifyErr;
          }
          // Network error: fallback to client validation
          if (code.toUpperCase() !== VALID_PASSKEY.toUpperCase()) {
            throw new Error("Invalid teacher invitation passkey.");
          }
        }
      } else {
        // Direct validation: Avoids Chrome Private Network Access ("Access other apps and services on this device") prompt
        if (code.toUpperCase() !== VALID_PASSKEY.toUpperCase()) {
          throw new Error("Invalid teacher invitation passkey. Please check with your administrator.");
        }
      }
    }

    // 2. Create auth user with chosen role directly in user metadata
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          role: role, // 'teacher' if verified, else 'student'
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
    refreshProfile,
    accessToken: session?.access_token || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

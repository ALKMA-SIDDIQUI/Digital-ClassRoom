import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase";

export default function AuthModal({ initialMode = "signin", onClose }) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState(initialMode || "signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [teacherPasscode, setTeacherPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearFeedback = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim() || !password || !fullName.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (role === "teacher" && !teacherPasscode.trim()) {
      setErrorMsg("Teacher registration requires an authorized teacher invitation passkey.");
      return;
    }

    try {
      setLoading(true);
      await signUp({
        email,
        password,
        fullName,
        role,
        teacherInvitationCode: teacherPasscode.trim(),
      });
      setSuccessMsg("Account created successfully! Check your email if email confirmation is enabled.");
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim()) {
      setErrorMsg("Please provide your account email.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccessMsg("Password reset link has been sent to your email!");
    } catch (err) {
      setErrorMsg(err.message || "Could not send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center p-4 transition-all duration-200 ${
        onClose
          ? "fixed inset-0 z-50 bg-black/65 backdrop-blur-xs overflow-y-auto"
          : "min-h-[80vh]"
      }`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        )}

        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#315BFF] to-[#7047FF] text-white shadow-md mb-2.5">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="14" x="3" y="3" rx="2" />
              <path d="M3 10h18" />
              <path d="m14 14 3 3" />
              <path d="m17 14-3 3" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#101828]">Digital Classroom Board</h2>
          <p className="text-xs text-[#53627A] mt-0.5">Teach, Collaborate and Learn Together</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <strong>Configuration Notice:</strong> Supabase project credentials (URL & Key) are not configured in <code className="bg-amber-100 px-1 py-0.5 rounded">frontend/.env</code>.
            Please connect your Supabase project to enable persistent accounts and authentication.
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode("signin"); clearFeedback(); }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "signin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); clearFeedback(); }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
            {successMsg}
          </div>
        )}

        {/* Sign In Form */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); clearFeedback(); }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Classroom"}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                maxLength={40}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">I am a:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`rounded-lg border p-2.5 text-sm font-semibold transition ${role === "student" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`rounded-lg border p-2.5 text-sm font-semibold transition ${role === "teacher" ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  🧑‍🏫 Teacher
                </button>
              </div>
            </div>

            {role === "teacher" && (
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                <label className="block text-xs font-semibold text-violet-900 uppercase mb-1.5">
                  Teacher Invitation Passkey
                </label>
                <input
                  type="password"
                  required
                  value={teacherPasscode}
                  onChange={(e) => setTeacherPasscode(e.target.value)}
                  placeholder="Enter secret teacher passkey"
                  className="w-full rounded-lg border border-violet-300 bg-white p-2.5 text-sm font-mono focus:border-violet-600 focus:outline-none"
                />
                <p className="mt-1.5 text-[11px] text-violet-700">
                  🔒 Authorized educators only. Passkey is provided by your school administrator.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Forgot Password Flow */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                We will send you a secure link to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("signin"); clearFeedback(); }}
              className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {onClose && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-[#315BFF] transition cursor-pointer"
            >
              ← Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

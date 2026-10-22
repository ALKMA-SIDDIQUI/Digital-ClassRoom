import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import LandingPage from "./components/landing/LandingPage";
import AuthModal from "./components/auth/AuthModal";
import ResetPasswordModal from "./components/auth/ResetPasswordModal";
import Dashboard from "./components/dashboard/Dashboard";
import Whiteboard from "./components/classroom/Whiteboard";
import ErrorBoundary from "./components/common/ErrorBoundary";

function ClassroomApp() {
  const { session, profile, loading, isPasswordRecovery } = useAuth();

  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");
  const [activeRole, setActiveRole] = useState("student");
  const [activeRoomName, setActiveRoomName] = useState("");

  // Sync with browser Back and Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If logged in and visiting /login or /signup, render dashboard directly
  const effectivePath = session && (currentPath === "/login" || currentPath === "/signup") ? "/dashboard" : currentPath;

  // Sync browser URL if redirected to dashboard
  useEffect(() => {
    if (session && (currentPath === "/login" || currentPath === "/signup")) {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [session, currentPath]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FF]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#315BFF] border-r-transparent mb-3" />
          <p className="text-sm font-semibold text-[#53627A]">Loading Digital Classroom Board...</p>
        </div>
      </div>
    );
  }

  // Parse dynamic classroom route: /classroom/:roomId
  const classroomMatch = currentPath.match(/^\/classroom\/([^/?#]+)/i);
  const routeRoomId = classroomMatch ? decodeURIComponent(classroomMatch[1]).toUpperCase() : null;

  return (
    <>
      {isPasswordRecovery && <ResetPasswordModal />}

      {/* Route 1: Live Classroom Whiteboard (/classroom/:roomId) */}
      {routeRoomId ? (
        !session ? (
          <>
            <LandingPage
              onOpenAuth={(mode) => navigate(mode === "signup" ? "/signup" : "/login")}
              onNavigate={navigate}
            />
            <AuthModal
              initialMode="signin"
              onClose={() => navigate("/")}
            />
          </>
        ) : (
          <ErrorBoundary>
            <Whiteboard
              roomId={routeRoomId}
              initialRole={activeRole || (profile?.role === "teacher" ? "teacher" : "student")}
              classroomName={activeRoomName || `Classroom ${routeRoomId}`}
              onLeaveRoom={() => navigate("/dashboard")}
            />
          </ErrorBoundary>
        )
      ) : effectivePath === "/dashboard" ? (
        /* Route 2: Authenticated Dashboard (/dashboard) */
        !session ? (
          <>
            <LandingPage
              onOpenAuth={(mode) => navigate(mode === "signup" ? "/signup" : "/login")}
              onNavigate={navigate}
            />
            <AuthModal
              key="dashboard-auth"
              initialMode="signin"
              onClose={() => navigate("/")}
            />
          </>
        ) : (
          <Dashboard
            onEnterRoom={(code, role, name) => {
              setActiveRole(role);
              setActiveRoomName(name);
              navigate(`/classroom/${code}`);
            }}
            onNavigate={navigate}
          />
        )
      ) : (
        /* Route 3: Public Landing Page (/), Login (/login), Signup (/signup) */
        <>
          <LandingPage
            onOpenAuth={(mode) => navigate(mode === "signup" ? "/signup" : "/login")}
            onNavigate={navigate}
          />

          {/* Modal overlay if visiting /login or /signup while unauthenticated */}
          {(effectivePath === "/login" || effectivePath === "/signup") && !session && (
            <AuthModal
              key={effectivePath}
              initialMode={effectivePath === "/signup" ? "signup" : "signin"}
              onClose={() => navigate("/")}
            />
          )}

          {/* Fallback for unrecognized routes */}
          {effectivePath !== "/" && effectivePath !== "/login" && effectivePath !== "/signup" && !routeRoomId && (
            <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 text-xs flex items-center gap-3 animate-in fade-in">
              <span className="text-slate-700 font-medium">Page not found ({effectivePath})</span>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg bg-[#315BFF] px-3 py-1 font-bold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                Go Home
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ClassroomApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

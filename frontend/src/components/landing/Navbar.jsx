import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Navbar({ onNavigate, onOpenAuth }) {
  const { session, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isTeacher = profile?.role === "teacher";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-transparent py-4 md:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#315BFF] to-[#7047FF] text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <svg
              className="h-5 w-5"
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
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#101828] block leading-tight">
              Digital Classroom Board
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#53627A] hidden sm:block">
              Interactive • Real-time • Collaborative
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            Home
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            Features
          </a>
          <a
            href="#preview"
            onClick={(e) => handleNavClick(e, "preview")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            Product Preview
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, "how-it-works")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            How It Works
          </a>
          <a
            href="#for-teachers"
            onClick={(e) => handleNavClick(e, "for-teachers")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            For Teachers
          </a>
          <a
            href="#for-students"
            onClick={(e) => handleNavClick(e, "for-students")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            For Students
          </a>
          <a
            href="#faq"
            onClick={(e) => handleNavClick(e, "faq")}
            className="text-xs font-semibold text-[#53627A] hover:text-[#315BFF] transition"
          >
            FAQ
          </a>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#53627A] font-medium hidden xl:inline">
                Hi, <strong className="text-[#101828]">{profile?.full_name || "User"}</strong>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isTeacher ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {isTeacher ? "Teacher" : "Student"}
              </span>
              <button
                type="button"
                onClick={() => onNavigate("/dashboard")}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#315BFF] to-[#7047FF] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenAuth("signin")}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#101828] hover:text-[#315BFF] hover:bg-slate-50 transition cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="flex items-center gap-1.5 rounded-xl bg-[#315BFF] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#2548DE] transition cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {session && (
            <button
              type="button"
              onClick={() => onNavigate("/dashboard")}
              className="rounded-lg bg-[#315BFF] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm"
            >
              Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top">
          <nav className="flex flex-col space-y-2.5 pb-4 border-b border-slate-100">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={(e) => handleNavClick(e, "preview")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              Product Preview
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="#for-teachers"
              onClick={(e) => handleNavClick(e, "for-teachers")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              For Teachers
            </a>
            <a
              href="#for-students"
              onClick={(e) => handleNavClick(e, "for-students")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              For Students
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="rounded-lg p-2 text-xs font-semibold text-[#53627A] hover:bg-slate-50"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-4 space-y-2">
            {session ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate("/dashboard");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#315BFF] to-[#7047FF] py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signin");
                  }}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signup");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#315BFF] py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, Cpu } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/50 py-3"
          : "bg-transparent py-4 md:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo: Optimus */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "home")}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#315BFF] via-[#5442FF] to-[#06B6D4] text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition duration-300">
            <Cpu className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-300 transition">
                Optimus
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                AI Infra
              </span>
            </div>
            <span className="text-[10px] text-slate-400 -mt-0.5 tracking-wide hidden sm:block">
              Intelligent Collaborative Platform
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#platform"
            onClick={(e) => handleNavClick(e, "platform")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Platform
          </a>
          <a
            href="#solutions"
            onClick={(e) => handleNavClick(e, "solutions")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Solutions
          </a>
          <a
            href="#developers"
            onClick={(e) => handleNavClick(e, "developers")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Developers
          </a>
          <a
            href="#infrastructure"
            onClick={(e) => handleNavClick(e, "infrastructure")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Infrastructure
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleNavClick(e, "pricing")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Pricing
          </a>
          <a
            href="#resources"
            onClick={(e) => handleNavClick(e, "resources")}
            className="hover:text-cyan-400 transition cursor-pointer"
          >
            Resources
          </a>
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {session ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate?.("dashboard")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Go to Dashboard</span>
                <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px]">
                  {isTeacher ? "Teacher" : "Student"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => signOut?.()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth?.("signin")}
                className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#315BFF] via-[#5442FF] to-[#7047FF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition cursor-pointer"
              >
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/10 transition cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-4 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl shadow-black/80 space-y-4 animate-in fade-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <a
              href="#platform"
              onClick={(e) => handleNavClick(e, "platform")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Platform
            </a>
            <a
              href="#solutions"
              onClick={(e) => handleNavClick(e, "solutions")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Solutions
            </a>
            <a
              href="#developers"
              onClick={(e) => handleNavClick(e, "developers")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Developers
            </a>
            <a
              href="#infrastructure"
              onClick={(e) => handleNavClick(e, "infrastructure")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Infrastructure
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleNavClick(e, "pricing")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Pricing
            </a>
            <a
              href="#resources"
              onClick={(e) => handleNavClick(e, "resources")}
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-cyan-400 transition"
            >
              Resources
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {session ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate?.("dashboard");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-2.5 text-xs font-bold text-white shadow-lg"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard ({isTeacher ? "Teacher" : "Student"})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut?.();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-slate-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth?.("signin");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-white"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth?.("signup");
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#315BFF] via-[#5442FF] to-[#7047FF] py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

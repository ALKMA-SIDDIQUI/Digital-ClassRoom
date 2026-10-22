const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ onOpenAuth }) {

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#315BFF] to-[#7047FF] text-white shadow-md">
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
              <span className="text-lg font-bold text-white tracking-tight">
                Digital Classroom Board
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern, real-time digital classroom board for teachers and students. Write, draw, explain, and collaborate — all in one powerful platform.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Real-Time Engine: Active (Socket.IO + PostgreSQL)</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" onClick={(e) => handleScrollTo(e, "home")} className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleScrollTo(e, "features")} className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#preview" onClick={(e) => handleScrollTo(e, "preview")} className="hover:text-white transition">
                  Product Preview
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleScrollTo(e, "how-it-works")} className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleScrollTo(e, "faq")} className="hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* User Roles */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Audience</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#for-teachers" onClick={(e) => handleScrollTo(e, "for-teachers")} className="hover:text-white transition">
                  For Teachers
                </a>
              </li>
              <li>
                <a href="#for-students" onClick={(e) => handleScrollTo(e, "for-students")} className="hover:text-white transition">
                  For Students
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Educator Access
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signin")}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Student Login
                </button>
              </li>
            </ul>
          </div>

          {/* Access & Security */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Authentication & Access</h4>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="w-full text-left rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                Get Started Free
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("signin")}
                className="w-full text-left rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                Account Sign In
              </button>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Protected by Supabase Auth with Row-Level Security.
            </p>
          </div>

        </div>

        {/* Bottom Copyright & Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} Digital Classroom Board. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Security by Supabase</span>
            <span>•</span>
            <span>Real-time by Socket.IO</span>
            <span>•</span>
            <span>Built for Modern Education</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

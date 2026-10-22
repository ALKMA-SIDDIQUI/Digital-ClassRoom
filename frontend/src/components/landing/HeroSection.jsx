import { ArrowRight, Zap, Globe, Smartphone, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";

export default function HeroSection({ onOpenAuth, onNavigate }) {
  const { session } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("MATH-101");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleExplore = (e) => {
    e.preventDefault();
    const elem = document.getElementById("preview");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F6F8FF] via-white to-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-[480px] w-full max-w-7xl blur-3xl opacity-40 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-tr from-[#315BFF]/30 to-[#7047FF]/30 rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#315BFF]">
              Interactive • Real-time • Secure
            </p>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#101828] leading-[1.12]">
              Teach,{" "}
              <span className="bg-gradient-to-r from-[#315BFF] via-[#5442FF] to-[#7047FF] bg-clip-text text-transparent">
                Collaborate
              </span>{" "}
              and Learn Together
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-sm sm:text-base md:text-lg text-[#53627A] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              A modern, real-time digital classroom board for teachers and students. Write, draw, explain, and collaborate — all in one powerful platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (session) {
                    onNavigate("/dashboard");
                  } else {
                    onOpenAuth("signup");
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#315BFF] to-[#7047FF] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.02] transition cursor-pointer"
              >
                {session ? "Enter Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleExplore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#101828] hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Explore the Classroom
              </button>
            </div>

            {/* Small Benefits Row */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#315BFF]">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Easy to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[#7047FF]">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Any Device</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Secure Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: Classroom Whiteboard Preview Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl md:rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-blue-500/10 overflow-hidden">
              
              {/* macOS Window Titlebar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 font-mono text-[11px] font-bold text-slate-700 hidden sm:inline">
                    Digital Classroom Board
                  </span>
                </div>

                {/* Room Pill */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#315BFF] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    MATH-101
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                    title="Copy room code"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700">
                    🧑‍🏫 Teacher Live
                  </span>
                </div>
              </div>

              {/* Whiteboard Interactive Canvas Preview */}
              <div className="relative h-[340px] sm:h-[400px] w-full bg-slate-50/50 p-4 overflow-hidden select-none">
                
                {/* SVG Coordinate Grid Background & Educational Geometry Diagram */}
                <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Subtle Grid Lines */}
                  <defs>
                    <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-grid)" />

                  {/* Geometric Right Triangle (Pythagorean Theorem) */}
                  <g transform="translate(60, 45)">
                    {/* Triangle Polygon with Gradient Fill */}
                    <polygon
                      points="40,220 220,220 40,60"
                      fill="#315BFF"
                      fillOpacity="0.08"
                      stroke="#315BFF"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />

                    {/* Right Angle Square */}
                    <path d="M 40 200 L 60 200 L 60 220" fill="none" stroke="#315BFF" strokeWidth="2" />

                    {/* Angle Arc at Top */}
                    <path d="M 40 90 A 30 30 0 0 0 58 80" fill="none" stroke="#7047FF" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="50" y="110" fill="#7047FF" fontSize="13" fontWeight="bold">θ</text>

                    {/* Dimension Labels */}
                    <text x="120" y="242" fill="#101828" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Base (a = 3 cm)
                    </text>
                    <text x="18" y="145" fill="#101828" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90 18 145)">
                      Height (b = 4 cm)
                    </text>
                    <text x="155" y="125" fill="#315BFF" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(-42 155 125)">
                      Hypotenuse (c = 5 cm)
                    </text>
                  </g>
                </svg>

                {/* Floating Handwritten Sticky Note */}
                <div className="absolute top-5 right-5 w-48 sm:w-56 rounded-xl bg-amber-50 p-3 shadow-md border border-amber-200/90 rotate-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Teacher Note 📌</span>
                    <span className="text-[9px] text-amber-600 font-semibold">10:30 AM</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-950">
                    Pythagoras Theorem:
                  </p>
                  <p className="mt-1 text-xs text-amber-900 font-semibold bg-white/70 rounded p-1 text-center border border-amber-200">
                    a² + b² = c²
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    3² + 4² = 9 + 16 = 25 = 5²
                  </p>
                </div>

                {/* Teacher Cursor Indicator */}
                <div className="absolute top-[180px] left-[150px] flex items-start gap-1 pointer-events-none drop-shadow-md">
                  <svg className="h-5 w-5 text-violet-600 fill-violet-600" viewBox="0 0 24 24">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    Mr. Sharma (Teacher)
                  </span>
                </div>

                {/* Student Cursor Indicator */}
                <div className="absolute bottom-[60px] right-[130px] flex items-start gap-1 pointer-events-none drop-shadow-md hidden sm:flex">
                  <svg className="h-4 w-4 text-emerald-500 fill-emerald-500" viewBox="0 0 24 24">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    Aarav (Student)
                  </span>
                </div>

                {/* Whiteboard Floating Toolbar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-xl border border-slate-200 backdrop-blur-md">
                  <button className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    ✏️
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
                    🧹
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
                    📐
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
                    T
                  </button>
                  <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
                  <div className="flex items-center gap-1 px-1">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#315BFF] border-2 border-white ring-1 ring-blue-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-[#7047FF]" />
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                  </div>
                </div>

                {/* Floating Chat Message Bubble */}
                <div className="absolute bottom-16 left-4 max-w-[210px] rounded-xl bg-white p-2.5 shadow-lg border border-slate-200/90 text-left animate-in fade-in hidden sm:block">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-blue-600">Faisal (Student)</span>
                    <span className="text-[9px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 leading-tight">
                    Sir, theorem is totally clear now! Can we solve #4 next? 👍
                  </p>
                </div>
              </div>

              {/* Bottom Preview Meta Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  18 Students Active
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Real-time Vector Sync Active (0ms)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

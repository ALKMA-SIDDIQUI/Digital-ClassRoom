import { ArrowRight, Zap, Globe, Smartphone, ShieldCheck, Copy, Check, Sparkles } from "lucide-react";
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
    const elem = document.getElementById("platform");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#07090E]">
      {/* Background Radial & Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[550px] w-full max-w-7xl blur-[120px] opacity-35 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-tr from-[#315BFF] via-[#7047FF] to-[#06B6D4] rounded-full" />
      </div>

      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span>The intelligent infrastructure for the AI era</span>
              <Sparkles className="h-3 w-3 text-cyan-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Build, deploy, and scale{" "}
              <span className="bg-gradient-to-r from-[#00E5FF] via-[#315BFF] to-[#9D4EDD] bg-clip-text text-transparent drop-shadow-sm">
                intelligence.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Optimus helps modern teams build reliable AI applications, conduct ultra-low-latency real-time collaboration, automate pedagogical workflows, and deploy intelligent systems faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (session) {
                    onNavigate?.("dashboard");
                  } else {
                    onOpenAuth?.("signup");
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#315BFF] to-[#7047FF] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                <span>{session ? "Open Dashboard" : "Start building"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleExplore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                <span>Explore the platform</span>
              </button>
            </div>

            {/* Trust Statement */}
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Built for teams shipping the future of AI & interactive learning</span>
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">0ms Latency</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">Global Edge</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">Any Device</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-slate-300">Zero-Trust</span>
              </div>
            </div>
          </div>

          {/* Right Column: Classroom Whiteboard Preview Mockup (Dark-Mode Futuristic) */}
          <div className="lg:col-span-6 relative">
            
            {/* Outer Ambient Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl opacity-50" />

            <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-[#0B0F19]/90 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
              
              {/* macOS Window Titlebar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#07090E]/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-[11px] font-semibold text-slate-300 hidden sm:inline">
                    Digital Classroom Board
                  </span>
                </div>

                {/* Room Pill */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    MATH-101
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Copy room code"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    🧑‍🏫 Teacher Live
                  </span>
                </div>
              </div>

              {/* Whiteboard Interactive Canvas Preview */}
              <div className="relative h-[340px] sm:h-[400px] w-full bg-[#070A12] p-4 overflow-hidden select-none">
                
                {/* SVG Coordinate Grid Background & Educational Geometry Diagram */}
                <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Subtle Futuristic Grid Lines */}
                  <defs>
                    <pattern id="hero-grid-dark" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-grid-dark)" />

                  {/* Geometric Right Triangle (Pythagorean Theorem) with Neon Glow */}
                  <g transform="translate(60, 45)">
                    {/* Triangle Polygon with Gradient Fill & Glow */}
                    <polygon
                      points="40,220 220,220 40,60"
                      fill="#00E5FF"
                      fillOpacity="0.08"
                      stroke="#00E5FF"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />

                    {/* Right Angle Square */}
                    <path d="M 40 200 L 60 200 L 60 220" fill="none" stroke="#00E5FF" strokeWidth="2" />

                    {/* Angle Arc at Top */}
                    <path d="M 40 90 A 30 30 0 0 0 58 80" fill="none" stroke="#A78BFA" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="50" y="110" fill="#C4B5FD" fontSize="13" fontWeight="bold">θ</text>

                    {/* Dimension Labels in Clean White/Cyan */}
                    <text x="120" y="242" fill="#E2E8F0" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Base (a = 3 cm)
                    </text>
                    <text x="18" y="145" fill="#E2E8F0" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90 18 145)">
                      Height (b = 4 cm)
                    </text>
                    <text x="155" y="125" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(-42 155 125)">
                      Hypotenuse (c = 5 cm)
                    </text>
                  </g>
                </svg>

                {/* Floating Teacher Note in Dark Amber Glass */}
                <div className="absolute top-5 right-5 w-48 sm:w-56 rounded-xl bg-amber-950/40 p-3 shadow-xl border border-amber-500/30 backdrop-blur-md rotate-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">TEACHER NOTE 📌</span>
                    <span className="text-[9px] text-amber-400 font-semibold">10:30 AM</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-100">
                    Pythagoras Theorem:
                  </p>
                  <p className="mt-1 text-xs text-amber-200 font-semibold bg-black/40 rounded p-1 text-center border border-amber-500/20 font-mono">
                    a² + b² = c²
                  </p>
                  <p className="text-[11px] text-amber-300 mt-1 font-mono">
                    3² + 4² = 9 + 16 = 25 = 5²
                  </p>
                </div>

                {/* Teacher Cursor Indicator */}
                <div className="absolute top-[180px] left-[150px] flex items-start gap-1 pointer-events-none drop-shadow-lg">
                  <svg className="h-5 w-5 text-violet-400 fill-violet-400" viewBox="0 0 24 24">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md shadow-violet-500/50 border border-violet-400/30">
                    Mr. Sharma (Teacher)
                  </span>
                </div>

                {/* Student Cursor Indicator */}
                <div className="absolute bottom-[60px] right-[130px] flex items-start gap-1 pointer-events-none drop-shadow-lg hidden sm:flex">
                  <svg className="h-4 w-4 text-emerald-400 fill-emerald-400" viewBox="0 0 24 24">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md shadow-emerald-500/40 border border-emerald-400/30">
                    Aarav (Student)
                  </span>
                </div>

                {/* Whiteboard Floating Toolbar in Dark Glass */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl bg-[#0D111A]/90 p-1.5 shadow-2xl border border-white/10 backdrop-blur-md">
                  <button className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/30">
                    ✏️
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-white/[0.05] text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-white/[0.1] hover:text-white transition">
                    🧹
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-white/[0.05] text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-white/[0.1] hover:text-white transition">
                    📐
                  </button>
                  <button className="h-7 w-7 rounded-lg bg-white/[0.05] text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-white/[0.1] hover:text-white transition">
                    T
                  </button>
                  <div className="h-4 w-[1px] bg-white/10 mx-0.5" />
                  <div className="flex items-center gap-1 px-1">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#00E5FF] border-2 border-white/80 ring-1 ring-cyan-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-[#7047FF]" />
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                  </div>
                </div>

                {/* Live Student Chat Bubble (Dark Glass) */}
                <div className="absolute bottom-3 left-3 hidden sm:block max-w-[210px] rounded-xl bg-[#0D111A]/95 p-2.5 shadow-xl border border-white/10 text-left backdrop-blur-md">
                  <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 mb-0.5">
                    <span>Faisal (Student)</span>
                    <span className="text-[9px] text-slate-400 font-normal">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-tight">
                    Sir, theorem is totally clear now! Can we solve #4 next? 👍
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#07090E]/90 px-4 py-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-300">18 Students Active</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Real-time Vector Sync Active (0ms)
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

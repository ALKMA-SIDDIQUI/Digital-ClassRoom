import { Cpu, Zap, Shield, FolderUp, Download, Activity, Sparkles } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "AI Model Orchestration & Vector Canvas",
      description:
        "High-performance vector rendering engine supporting fluid multi-tool drawing, geometric shapes, precision mathematical graphs, and high-DPI scaling.",
      icon: Cpu,
      badge: "Vector Core",
      color: "from-cyan-500 to-blue-600",
      borderGlow: "group-hover:border-cyan-500/50",
      accent: "text-cyan-400",
      bgLight: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "Real-Time Inference & Event Streaming",
      description:
        "Ultra-low latency WebSocket streaming with 0ms perceived lag. Intelligently batches strokes and element sync across hundreds of simultaneous participants.",
      icon: Zap,
      badge: "Socket.IO",
      color: "from-blue-500 to-indigo-600",
      borderGlow: "group-hover:border-blue-500/50",
      accent: "text-blue-400",
      bgLight: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Workflow Automation & Educator Authority",
      description:
        "Granular classroom controls. Teachers can lock canvas drawing for individual students, mute the chat section during lectures, and eject disruptive users.",
      icon: Shield,
      badge: "Governance",
      color: "from-violet-500 to-purple-600",
      borderGlow: "group-hover:border-violet-500/50",
      accent: "text-violet-400",
      bgLight: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      title: "Observability & Live Presence Monitoring",
      description:
        "Real-time participant presence tracking with live cursor broadcasting, active drawing indicators, and participant status telemetry.",
      icon: Activity,
      badge: "Telemetry",
      color: "from-emerald-500 to-teal-600",
      borderGlow: "group-hover:border-emerald-500/50",
      accent: "text-emerald-400",
      bgLight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Secure 25MB Resource Hub Pipelines",
      description:
        "Direct-to-storage PDF and image pipelines powered by Supabase. Open handouts directly in browser tabs or preview diagrams with zoom and download.",
      icon: FolderUp,
      badge: "25MB Hub",
      color: "from-amber-500 to-orange-600",
      borderGlow: "group-hover:border-amber-500/50",
      accent: "text-amber-400",
      bgLight: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Scalable Infrastructure & High-Res Export",
      description:
        "PostgreSQL database with Row Level Security (RLS) and instant board export to crystal-clear PNG snapshots for student revision.",
      icon: Download,
      badge: "Enterprise",
      color: "from-fuchsia-500 to-pink-600",
      borderGlow: "group-hover:border-fuchsia-500/50",
      accent: "text-fuchsia-400",
      bgLight: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    },
  ];

  return (
    <section id="platform" className="py-24 md:py-32 bg-[#07090E] relative overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-full max-w-6xl blur-[140px] opacity-20 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-cyan-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial-Grade Platform Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Engineered for High-Concurrency{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
              Live Collaboration
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            A unified infrastructure stack designed for zero-latency whiteboarding, pedagogical authority, and enterprise security.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl bg-[#0D111A]/80 p-7 border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between backdrop-blur-md hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 ${feature.borderGlow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${feature.bgLight}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Bottom Accent Indicator */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-300 transition">
                  <span className="font-mono text-[11px]">System Ready</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 group-hover:animate-ping" />
                    <span className="text-[11px] font-mono font-medium">99.99%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

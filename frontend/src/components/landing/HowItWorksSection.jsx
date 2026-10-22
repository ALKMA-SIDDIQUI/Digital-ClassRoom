import { Database, Sliders, PlayCircle, LineChart, ArrowRight } from "lucide-react";

export default function HowItWorksSection({ onOpenAuth }) {
  const steps = [
    {
      step: "01",
      title: "Connect Data & Tools",
      subtitle: "Instant & Zero Setup",
      description:
        "Initialize an encrypted session in seconds. Authenticate educators with verified teacher keys and connect storage pipelines seamlessly.",
      icon: Database,
      accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      tag: "10-Sec Setup",
    },
    {
      step: "02",
      title: "Configure Intelligence Layer",
      subtitle: "Custom Permissions & Rooms",
      description:
        "Define educator authority, individual student canvas locks, chat moderation thresholds, and high-resolution vector canvas presets.",
      icon: Sliders,
      accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      tag: "Zero-Trust RBAC",
    },
    {
      step: "03",
      title: "Deploy & Collaborate Live",
      subtitle: "Real-Time Vector Sync",
      description:
        "Students join via 6-digit room codes. Experience multi-user live stroke streaming, real-time cursors, and 25MB PDF/handout sharing.",
      icon: PlayCircle,
      accent: "text-violet-400 border-violet-500/30 bg-violet-500/10",
      tag: "0ms Perceived Latency",
    },
    {
      step: "04",
      title: "Monitor & Optimize Performance",
      subtitle: "Session Observability & Export",
      description:
        "Track participant engagement in real-time. Export vector board notes to crystal-clear PNG snapshots for student revision and archive.",
      icon: LineChart,
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      tag: "High-Res PNG Export",
    },
  ];

  return (
    <section id="solutions" className="py-24 md:py-32 bg-[#090D16] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            From Setup to Production in{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Four Simple Steps
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Engineered to remove complexity so educators can teach and engineering teams can deploy intelligent collaborative systems instantly.
          </p>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-[#0D111A]/90 p-6 border border-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-slate-600 group-hover:text-cyan-400 transition">
                      {item.step}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                      {item.tag}
                    </span>
                  </div>

                  <div className={`inline-flex p-3 rounded-xl border ${item.accent} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">
                    {item.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Step {index + 1} of 4</span>
                  <button
                    type="button"
                    onClick={() => onOpenAuth?.("signup")}
                    className="text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Test Flow</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

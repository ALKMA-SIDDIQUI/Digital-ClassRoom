import { Server, Globe2, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function InfrastructureSection({ onOpenAuth }) {
  const infraPoints = [
    {
      title: "Edge WebSocket Gateways",
      desc: "Distributed Socket.IO cluster delivering sub-15ms vector sync across North America, Europe, and Asia.",
    },
    {
      title: "Relational Persistence & Zero-Trust RLS",
      desc: "Powered by PostgreSQL with Row Level Security enforcing strict classroom partition boundaries.",
    },
    {
      title: "25MB High-Throughput Storage Hub",
      desc: "Direct-to-storage signed uploads for lecture handouts, PDFs, and multi-megabyte visual diagrams.",
    },
    {
      title: "Automated Failover & Session Recovery",
      desc: "In-memory stroke caches with batch flushing guarantee 0 data loss during network hiccups.",
    },
  ];

  return (
    <section id="infrastructure" className="py-24 md:py-32 bg-[#07090E] border-t border-white/[0.08] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 -z-10 h-[500px] w-[500px] blur-[150px] opacity-25 pointer-events-none bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
              <Server className="h-3.5 w-3.5" />
              <span>Global Enterprise Infrastructure</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Built for Speed, Reliability, and{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Massive Concurrency
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
              Optimus provides a fault-tolerant, globally distributed architecture engineered from bare metal to handle thousands of simultaneous collaborative classrooms with zero jitter.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {infraPoints.map((point, i) => (
                <div key={i} className="rounded-xl bg-[#0D111A]/90 p-4 border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">{point.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{point.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] transition cursor-pointer"
              >
                <span>Deploy on Optimus Infrastructure</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Abstract Animated Infrastructure Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-[#0A0E17]/90 p-6 md:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-mono text-xs font-bold text-cyan-300">EDGE MESH TOPOLOGY</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">STATUS: OPTIMAL (100%)</span>
              </div>

              {/* Topology Diagram */}
              <div className="py-6 space-y-4 font-mono text-xs">
                {/* Node 1: Client Gateway */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-white font-bold">Global Edge WebSocket CDN</span>
                  </div>
                  <span className="text-cyan-400 font-semibold">&lt; 15ms</span>
                </div>

                {/* Connection Line */}
                <div className="flex justify-center -my-2">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500" />
                </div>

                {/* Node 2: Vector Sync Engine */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-bold">In-Memory Batch Sync Worker</span>
                  </div>
                  <span className="text-blue-400 font-semibold">0ms Local Sync</span>
                </div>

                {/* Connection Line */}
                <div className="flex justify-center -my-2">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-violet-500" />
                </div>

                {/* Node 3: PostgreSQL Database */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-violet-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-violet-400" />
                    <span className="text-white font-bold">PostgreSQL with Zero-Trust RLS</span>
                  </div>
                  <span className="text-violet-400 font-semibold">ACID Guarded</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>ENCRYPTION: AES-256 + TLS 1.3</span>
                <span className="text-emerald-400 font-bold">99.99% SLA ACTIVE</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

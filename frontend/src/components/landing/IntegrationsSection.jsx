import { Puzzle, ArrowRight } from "lucide-react";

export default function IntegrationsSection({ onOpenAuth }) {
  const integrations = [
    { name: "GitHub", type: "Version Control & CI/CD", category: "DevTools" },
    { name: "Vercel", type: "Edge Deployment & Hosting", category: "Hosting" },
    { name: "Supabase", type: "PostgreSQL & Auth Engine", category: "Database" },
    { name: "Slack", type: "Real-time Notification Webhooks", category: "Chat" },
    { name: "AWS S3", type: "Object Handout Storage", category: "Cloud" },
    { name: "Google Cloud", type: "Kubernetes & Compute", category: "Infrastructure" },
    { name: "Canvas LMS", type: "LTI 1.3 Academic Sync", category: "Education" },
    { name: "Zoom", type: "Live Session Launcher", category: "Communication" },
  ];

  return (
    <section className="py-24 bg-[#07090E] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-3">
            <Puzzle className="h-3.5 w-3.5" />
            <span>Extensible Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Connect the Tools Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
              Team Already Uses
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Seamlessly integrate with modern developer stacks, cloud infrastructure, and enterprise learning management systems.
          </p>
        </div>

        {/* Integration Grid with Muted Modern Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {integrations.map((item, idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="group rounded-2xl bg-[#0D111A]/80 p-5 border border-white/[0.08] hover:border-white/20 hover:bg-[#121724] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition">
                  {item.category}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                {item.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {item.type}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => onOpenAuth?.("signup")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition cursor-pointer"
          >
            <span>Need a custom webhook or LTI integration? Request Developer Access</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}

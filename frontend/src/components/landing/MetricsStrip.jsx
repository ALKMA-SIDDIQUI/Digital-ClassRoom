import { Activity, ShieldCheck, Zap, Server } from "lucide-react";

export default function MetricsStrip() {
  const metrics = [
    {
      value: "99.99%",
      label: "Uptime SLA",
      detail: "Enterprise-grade PostgreSQL & RLS",
      icon: ShieldCheck,
      color: "text-cyan-400",
    },
    {
      value: "< 15ms",
      label: "Average Vector Latency",
      detail: "Ultra-fast Socket.IO event streaming",
      icon: Zap,
      color: "text-blue-400",
    },
    {
      value: "10M+",
      label: "Strokes & Elements Synced",
      detail: "Batched and persisted reliably",
      icon: Activity,
      color: "text-violet-400",
    },
    {
      value: "24/7",
      label: "High-Concurrency Infra",
      detail: "Automated scaling across global regions",
      icon: Server,
      color: "text-emerald-400",
    },
  ];

  return (
    <section className="border-y border-white/[0.08] bg-[#0A0D15]/80 py-10 backdrop-blur-md relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center md:items-start text-center md:text-left ${
                  idx > 0 ? "pt-6 md:pt-0 md:pl-8" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                    {item.value}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

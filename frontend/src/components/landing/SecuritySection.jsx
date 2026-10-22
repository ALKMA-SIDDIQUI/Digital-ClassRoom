import { ShieldCheck, Lock, KeyRound, FileCheck2, ArrowRight } from "lucide-react";

export default function SecuritySection({ onOpenAuth }) {
  const securityFeatures = [
    {
      title: "Row Level Security (RLS)",
      desc: "Zero-trust PostgreSQL architecture enforces that users can only query and mutate data from rooms they have authenticated access to.",
      icon: ShieldCheck,
    },
    {
      title: "End-to-End JWT Auth",
      desc: "All REST endpoints and Socket.IO real-time channels verify signed Supabase JSON Web Tokens on every handshake.",
      icon: Lock,
    },
    {
      title: "Passkey-Guarded Authority",
      desc: "Educator creation privileges require a server-verified passkey, preventing student impersonation or unauthorized room generation.",
      icon: KeyRound,
    },
    {
      title: "Encrypted 25MB Handouts",
      desc: "All student and teacher assets uploaded to Supabase Storage are encrypted at rest with signed URL download expiry.",
      icon: FileCheck2,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#090D16] border-t border-white/[0.08] relative overflow-hidden">
      {/* Subtle Violet/Cyan Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -z-10 h-[450px] w-[450px] blur-[140px] opacity-20 pointer-events-none bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Zero-Trust Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Enterprise Compliance &{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Institutional Privacy
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Architected to safeguard student data, prevent unauthorized entry, and maintain rigorous academic compliance.
          </p>
        </div>

        {/* 4 Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D111A]/90 p-6 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Enforced by Policy</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            type="button"
            onClick={() => onOpenAuth?.("signup")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.08] hover:border-white/20 transition cursor-pointer"
          >
            <span>Learn about security & compliance</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}

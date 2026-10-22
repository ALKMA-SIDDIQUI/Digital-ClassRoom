import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingSection({ onOpenAuth }) {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      name: "Starter",
      tagline: "For individual educators and tutors starting out",
      priceMonthly: 0,
      priceYearly: 0,
      period: "forever free",
      highlight: false,
      ctaText: "Start Building Free",
      features: [
        "Up to 3 active live classrooms",
        "25 concurrent students per session",
        "Infinite vector whiteboard canvas",
        "High-DPI PNG note exports",
        "100MB Supabase resource storage",
        "Community support & docs",
      ],
    },
    {
      name: "Growth",
      tagline: "For growing academies and collaborative teaching teams",
      priceMonthly: 29,
      priceYearly: 24,
      period: "per teacher / month",
      highlight: true,
      badge: "MOST POPULAR",
      ctaText: "Get Started with Growth",
      features: [
        "Unlimited live classrooms & sessions",
        "Up to 150 concurrent students per room",
        "Per-student individual whiteboard locking",
        "One-click classroom chat mute & moderation",
        "Disruptive participant ejection system",
        "Up to 25MB file sharing & instant PDF viewer",
        "Real-time stroke persistence in PostgreSQL",
        "Priority 24/7 technical support",
      ],
    },
    {
      name: "Enterprise",
      tagline: "For universities, large schools, and educational networks",
      priceMonthly: 99,
      priceYearly: 79,
      period: "custom volume billing",
      highlight: false,
      ctaText: "Contact Enterprise Sales",
      features: [
        "Unlimited students & dedicated rooms",
        "Dedicated edge WebSocket infrastructure",
        "Custom Canvas / Blackboard LTI 1.3 integration",
        "SSO / SAML institutional authentication",
        "Audit logs & academic compliance reporting",
        "99.99% uptime SLA guarantee",
        "Dedicated technical account manager",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#090D16] border-t border-white/[0.08] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-full max-w-6xl blur-[140px] opacity-25 pointer-events-none bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
            Transparent Plans
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Predictable Pricing for{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
              Every Stage
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your classroom or institution. Upgrade or downgrade anytime with zero lock-in.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-[#0D111A] border border-white/10">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                !isYearly ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                isYearly ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                plan.highlight
                  ? "bg-[#0D111A]/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 lg:-translate-y-2"
                  : "bg-[#0A0E17]/85 border border-white/[0.08] hover:border-white/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-cyan-500/40">
                  <Sparkles className="h-3 w-3" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed">
                  {plan.tagline}
                </p>

                <div className="mt-6 mb-6 pb-6 border-b border-white/[0.08] flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white">
                    ${isYearly ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => onOpenAuth?.("signup")}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                      : "bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

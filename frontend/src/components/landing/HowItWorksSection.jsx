import { UserPlus, DoorOpen, Presentation, ArrowRight } from "lucide-react";

export default function HowItWorksSection({ onOpenAuth }) {
  const steps = [
    {
      step: "01",
      title: "Create an Account",
      subtitle: "Instant & Secure Setup",
      description:
        "Sign up in seconds. Educators verify their teacher passkey for room creation powers, while students register with their email.",
      icon: UserPlus,
      color: "bg-blue-600 text-white",
      badge: "Free Registration",
    },
    {
      step: "02",
      title: "Create or Join Classroom",
      subtitle: "Zero Hassle Entry",
      description:
        "Teachers launch classrooms with custom names. Students enter the simple 6-character room code to join instantly.",
      icon: DoorOpen,
      color: "bg-violet-600 text-white",
      badge: "6-Digit Code",
    },
    {
      step: "03",
      title: "Teach, Draw & Collaborate",
      subtitle: "Live Interactive Lessons",
      description:
        "Draw diagrams, explain formulas, chat live, share 25MB handouts, and export final notes as high-resolution PNGs.",
      icon: Presentation,
      color: "bg-emerald-600 text-white",
      badge: "Real-time Sync",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#315BFF] mb-2 block">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828]">
            Get Started in Less Than 60 Seconds
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#53627A]">
            No complex software installations or browser extensions needed. Works directly in standard web browsers.
          </p>
        </div>

        {/* 3 Step Cards with Visual Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-3xl border border-slate-200/90 bg-[#F6F8FF]/60 p-8 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-extrabold text-slate-300">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200 shadow-2xs">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon Container */}
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} shadow-md shadow-blue-500/10`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-[#101828] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#315BFF] mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-[#53627A] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-[#315BFF]">
                  <span>Step {item.step} Complete</span>
                  <span>✓</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar Below */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => onOpenAuth("signup")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#101828] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Create Your Account Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}

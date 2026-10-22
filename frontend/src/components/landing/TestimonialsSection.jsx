import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Optimus replaced three disparate tools for our STEM academy. The 0ms vector sync and individual student board locking allow our professors to teach advanced calculus with zero distraction.",
      name: "Dr. Elena Rostova",
      role: "Dean of Mathematics",
      company: "Apex STEM Institute",
      avatar: "ER",
      color: "from-cyan-500 to-blue-600",
    },
    {
      quote:
        "We needed an interactive whiteboard platform that could scale to hundreds of concurrent rooms without buffering. The WebSocket batching architecture in Optimus is extraordinarily well engineered.",
      name: "Marcus Chen",
      role: "VP of Learning Architecture",
      company: "Synthetix EdTech",
      avatar: "MC",
      color: "from-blue-500 to-violet-600",
    },
    {
      quote:
        "The 25MB resource hub and PDF viewer directly in the canvas session transformed our tutorial sessions. Students ask doubts in live chat while notes are automatically preserved.",
      name: "Sarah Jenkins",
      role: "Lead Instructional Designer",
      company: "Northfield Digital Academy",
      avatar: "SJ",
      color: "from-violet-500 to-fuchsia-600",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#07090E] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
            Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Trusted by Teams Shipping the{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
              Future of Education
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Discover how leading educational institutions conduct frictionless interactive sessions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0D111A]/90 p-7 border border-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div>
                <Quote className="h-6 w-6 text-cyan-400/40 mb-4" />
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center gap-3.5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${item.color} text-white font-bold text-xs shadow-md`}>
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">{item.role} • {item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

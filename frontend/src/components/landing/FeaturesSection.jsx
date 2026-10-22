import { PenTool, Zap, MessageSquare, Users, Download, ShieldCheck, Lock, Share2 } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Interactive Whiteboard",
      description:
        "High-performance vector canvas with fluid pen, precision eraser, geometric shapes (rectangles, circles, arrows), and text stamping tools.",
      icon: PenTool,
      badge: "Canvas Engine",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Real-time Collaboration",
      description:
        "Powered by ultra-fast Socket.IO websockets. Live multi-user strokes, cursor movements, and element sync with 0ms perceived latency.",
      icon: Zap,
      badge: "Live Socket.IO",
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
      title: "Classroom Chat",
      description:
        "Integrated messaging stream so students can ask questions, engage in peer discussions, and receive real-time teacher announcements.",
      icon: MessageSquare,
      badge: "Messaging",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Teacher & Student Roles",
      description:
        "Strict cryptographic role hierarchy. Teachers possess classroom administration authority, while students collaborate safely.",
      icon: Users,
      badge: "Role Access",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Save & Export (PNG)",
      description:
        "Download high-resolution PNG snapshots of the whiteboard at any moment for lesson archives, revision, and homework handouts.",
      icon: Download,
      badge: "One-Click Export",
      color: "from-rose-500 to-pink-600",
      bgLight: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      title: "Secure Authentication",
      description:
        "Enterprise-grade Supabase session authentication with encrypted passwords and verified teacher invitation passkeys.",
      icon: ShieldCheck,
      badge: "PostgreSQL & RLS",
      color: "from-blue-600 to-cyan-600",
      bgLight: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },
    {
      title: "Board Lock & Teacher Controls",
      description:
        "Educators can pause chat, lock the board globally or per-individual student, and remove disruptive participants instantly.",
      icon: Lock,
      badge: "Full Authority",
      color: "from-purple-600 to-pink-600",
      bgLight: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Instant Classroom Sharing",
      description:
        "Teachers generate memorable 6-character room codes. Students paste the code to enter live collaborative lessons in seconds.",
      icon: Share2,
      badge: "Zero Friction",
      color: "from-emerald-600 to-green-600",
      bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#F6F8FF]/60 border-t border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#315BFF] mb-2 block">
            Commercial-Grade Feature Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828]">
            Everything You Need For Powerful Interactive Teaching
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#53627A]">
            Engineered with modern web standards, secure database architecture, and zero-latency real-time collaboration.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.bgLight} group-hover:scale-105 transition`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#101828] mb-2 group-hover:text-[#315BFF] transition">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#53627A] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-[#315BFF] transition">
                  <span>Learn more</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

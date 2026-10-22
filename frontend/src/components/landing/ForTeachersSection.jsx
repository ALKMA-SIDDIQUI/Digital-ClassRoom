import { CheckCircle2, ArrowRight, ShieldCheck, Lock, UploadCloud, Users } from "lucide-react";

export default function ForTeachersSection({ onOpenAuth }) {
  const teacherPerks = [
    {
      title: "Create & Manage Unlimited Classrooms",
      desc: "Instantly create live virtual classrooms with distinct codes for separate subjects, batches, or study groups.",
    },
    {
      title: "Individual Student Board Locking",
      desc: "Maintain total pedagogical control. Lock or unlock drawing for any specific student without disrupting the rest of the class.",
    },
    {
      title: "One-Click Classroom Chat Control",
      desc: "Pause the chat section during intense lectures and resume it whenever you are ready for student questions.",
    },
    {
      title: "Discipline & Participant Moderation",
      desc: "Easily remove disruptive participants with automatic disconnection and room re-entry protection.",
    },
    {
      title: "Share Up to 25MB Teaching Resources",
      desc: "Upload lecture handouts, PDF notes, and high-resolution diagrams directly to Supabase Storage with instant preview.",
    },
    {
      title: "High-Resolution PNG Board Export",
      desc: "Download complete board notes as PNG images to share with students for after-class revision and assignments.",
    },
  ];

  return (
    <section id="for-teachers" className="py-20 md:py-28 bg-[#F6F8FF]/70 border-t border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Teacher Capabilities */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#7047FF] block">
              For Educators & Institutions
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828] leading-tight">
              Powerful Classroom Control & Teaching Freedom
            </h2>

            <p className="text-sm sm:text-base text-[#53627A] leading-relaxed">
              Designed from the ground up for modern teachers. Whether you are conducting interactive math problem-solving, science lectures, or study sessions, Digital Classroom Board gives you full pedagogical authority.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {teacherPerks.map((perk, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#7047FF] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#101828] mb-1">{perk.title}</h4>
                      <p className="text-[11px] text-[#53627A] leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7047FF] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-[#6035EE] transition cursor-pointer"
              >
                Start Teaching as an Educator
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Teacher Panel Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                    🧑‍🏫
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Teacher Control Center</h4>
                    <span className="text-[10px] text-slate-400">Classroom: ADV-PHYSICS-26</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Active
                </span>
              </div>

              {/* Quick Actions Preview */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span>Lock Board</span>
                  <span className="text-[9px] text-slate-400">View-only mode</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-violet-600" />
                  <span>Moderate People</span>
                  <span className="text-[9px] text-slate-400">Per-student lock</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                  <UploadCloud className="h-4 w-4 text-blue-600" />
                  <span>Upload Resource</span>
                  <span className="text-[9px] text-slate-400">25MB Max</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>24 Attending</span>
                  <span className="text-[9px] text-slate-400">All authenticated</span>
                </div>
              </div>

              <div className="rounded-2xl bg-violet-50/70 p-3.5 border border-violet-100 text-xs text-violet-900 space-y-1">
                <p className="font-bold">Verified Teacher Invitation System</p>
                <p className="text-[11px] text-violet-700 leading-relaxed">
                  Only educators with an authorized teacher invitation passkey can create rooms, ensuring academic integrity across your platform.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

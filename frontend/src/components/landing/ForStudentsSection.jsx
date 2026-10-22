import { CheckCircle2, ArrowRight, Laptop, MessageCircle, FileText } from "lucide-react";

export default function ForStudentsSection({ onOpenAuth }) {
  const studentBenefits = [
    {
      title: "One-Click Classroom Joining",
      desc: "No complicated class schedules or links. Simply paste the 6-character room code from your teacher and enter immediately.",
    },
    {
      title: "Live Whiteboard Stream (0ms Delay)",
      desc: "Watch your teacher explain complex topics, write mathematical formulas, and illustrate diagrams in real time without buffering.",
    },
    {
      title: "Participate & Collaborate When Permitted",
      desc: "Solve questions directly on the shared board when authorized by your teacher using pen, shapes, and eraser tools.",
    },
    {
      title: "Classroom Chat & Doubt Resolution",
      desc: "Ask questions, share answers, and interact with peers through the integrated class chat stream.",
    },
    {
      title: "Open Handouts & PDFs in Real-Time",
      desc: "Instantly open teacher-shared lecture PDFs in a new tab, preview diagrams in full-screen, and download study notes.",
    },
    {
      title: "Works Smoothly on Any Device",
      desc: "Join seamlessly from your Windows PC, Mac, Chromebook, iPad, or mobile phone directly inside the browser.",
    },
  ];

  return (
    <section id="for-students" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Student Visual Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-blue-50/70 via-white to-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🎓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Student Learning Dashboard</h4>
                    <span className="text-[10px] text-slate-400">Class: Calculus II • Live Now</span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                  STUDENT
                </span>
              </div>

              {/* Clean Student Experience Mockup */}
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Enter Classroom Room Code:</span>
                  <span className="text-[10px] text-blue-600 font-bold">Quick Join</span>
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value="CLASS-EAQKL2"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold text-slate-800 tracking-wider"
                  />
                  <button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs">
                    Join
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <Laptop className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-bold">0ms Sync</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-bold">Ask Doubts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-[10px] font-bold">PDF Handouts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Student Benefits Copy */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#315BFF] block">
              For Students & Learners
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828] leading-tight">
              An Engaging, Distraction-Free Digital Classroom
            </h2>

            <p className="text-sm sm:text-base text-[#53627A] leading-relaxed">
              No clutter, no heavy app downloads. Just click to enter your teacher's session, follow along on the crisp whiteboard, ask your doubts, and download notes anytime.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {studentBenefits.map((perk, i) => (
                <div key={i} className="rounded-2xl bg-[#F6F8FF] p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#315BFF] shrink-0 mt-0.5" />
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#315BFF] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#2548DE] transition cursor-pointer"
              >
                Join as a Student Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

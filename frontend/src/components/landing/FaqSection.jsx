import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is Digital Classroom Board?",
      a: "Digital Classroom Board is a modern, real-time interactive educational platform designed for online teaching. It connects teachers and students through an infinite whiteboard canvas, real-time vector drawing, live classroom chat, 25MB file sharing, and educator moderation controls.",
    },
    {
      q: "How can teachers create a classroom?",
      a: "Educators sign up using their authorized Teacher Invitation Passkey. From the teacher dashboard, they simply enter a classroom name, click 'Create Classroom', and receive a unique 6-character room code (e.g. CLASS-EAQKL2) to share with their students.",
    },
    {
      q: "How can students join a live session?",
      a: "Students create a free account, log in, and enter the 6-character room code provided by their teacher. They immediately join the live whiteboard session with 0ms sync without downloading any software.",
    },
    {
      q: "Can multiple users collaborate on the whiteboard simultaneously?",
      a: "Yes! Powered by Socket.IO, multiple participants can draw, stamp text, and move cursors simultaneously. Teachers also have the authority to lock the board globally or per-individual student whenever focused lecture mode is required.",
    },
    {
      q: "How does the individual student whiteboard lock and removal work?",
      a: "In the 'People' sidebar tab, teachers have dedicated controls for every student. Clicking 'Lock Board' disables drawing tools and canvas interaction for that specific student while allowing others to continue. Clicking 'Remove' evicts disruptive students from the room and blocks unauthorized re-entry.",
    },
    {
      q: "Can lecture handouts, PDFs, and images be shared during class?",
      a: "Yes. Both teachers and students can upload files up to 25MB via the 'Files' tab into Supabase Storage. Clicking 'Open' launches PDFs in a new browser tab or opens images and diagrams in an interactive fullscreen preview modal with zoom and direct download capabilities.",
    },
    {
      q: "How does board saving and exporting work?",
      a: "Strokes are saved in real-time in PostgreSQL so reconnecting users instantly receive the up-to-date board. In addition, teachers and students can click 'Download PNG' at any moment to save a high-resolution image snapshot of the canvas directly to their computer.",
    },
    {
      q: "Which devices and web browsers are supported?",
      a: "Digital Classroom Board runs smoothly in modern web browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, and Brave on Windows, macOS, Linux, Chromebooks, iPads, and mobile smartphones.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#F6F8FF]/60 border-t border-slate-200/70">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#315BFF] mb-2 block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828]">
            Got Questions? We Have Answers.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#53627A]">
            Learn how Digital Classroom Board operates, manages security, and connects classrooms worldwide.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#101828] hover:text-[#315BFF] transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 bg-blue-50 text-blue-600 border-blue-200" : ""}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#53627A] leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

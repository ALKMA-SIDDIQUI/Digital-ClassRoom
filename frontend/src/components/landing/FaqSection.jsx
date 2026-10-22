import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is Optimus and how does it power digital classrooms?",
      a: "Optimus is a real-time collaborative educational infrastructure platform. It unites an infinite vector whiteboard canvas, ultra-low-latency Socket.IO event broadcasting, educator moderation controls, and 25MB file sharing into a single browser-native experience.",
    },
    {
      q: "How does the educator authority and passkey system work?",
      a: "Educator registration and upgrades are protected by a server-verified Teacher Invitation Passkey. Official teachers maintain full authority to lock canvas drawing for individual students, mute the chat stream during key lessons, and revoke permissions from promoted students.",
    },
    {
      q: "How does real-time stroke synchronization achieve 0ms perceived lag?",
      a: "The client uses optimistic local vector rendering combined with a WebSocket batching worker on the Node.js server. Strokes are broadcast immediately to all room participants and flushed to PostgreSQL asynchronously in batches of 30 segments or every 600ms.",
    },
    {
      q: "How does the 25MB resource hub work for PDFs and handouts?",
      a: "Both educators and students can upload study notes, assignment PDFs, and diagrams up to 25MB. Files are stored securely in Supabase Storage. Clicking 'Open' launches PDFs directly in a clean new tab or opens diagrams in a fullscreen image viewer with zoom controls.",
    },
    {
      q: "Which devices and web browsers are supported?",
      a: "Optimus runs seamlessly in modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, and Brave across Windows, macOS, Linux, Chromebooks, iPads, and mobile smartphones.",
    },
    {
      q: "How are student data and classroom communications secured?",
      a: "All network traffic is encrypted via TLS 1.3 and WSS. Database records are protected by PostgreSQL Row Level Security (RLS) policies, ensuring users can never read or mutate data outside their enrolled classrooms.",
    },
  ];

  return (
    <section id="resources" className="py-24 md:py-32 bg-[#07090E] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-cyan-400 mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Got Questions?{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
              We Have Answers.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Learn how Optimus operates, manages zero-trust security, and connects classrooms worldwide.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.08] bg-[#0D111A]/80 overflow-hidden backdrop-blur-md transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between p-6 text-left text-sm sm:text-base font-bold text-white hover:text-cyan-300 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className={`p-1.5 rounded-lg bg-white/[0.04] text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-400" : ""}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-4 font-normal">
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

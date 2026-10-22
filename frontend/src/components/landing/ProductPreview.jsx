import { useState } from "react";
import { Edit3, MessageSquare, Shield, FolderOpen, ArrowRight, Download, RotateCcw, RotateCw, Lock, Unlock, Eye } from "lucide-react";

export default function ProductPreview({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("canvas"); // "canvas" | "chat" | "moderation" | "resources"
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#315BFF");
  const [isDemoLocked, setIsDemoLocked] = useState(false);
  const [demoChatPaused, setDemoChatPaused] = useState(false);

  const tabs = [
    { id: "canvas", label: "Canvas & Drawing", icon: Edit3 },
    { id: "chat", label: "Classroom Chat", icon: MessageSquare },
    { id: "moderation", label: "Teacher Authority", icon: Shield },
    { id: "resources", label: "25MB File Hub", icon: FolderOpen },
  ];

  return (
    <section id="preview" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#315BFF] mb-2 block">
            Interactive Platform Preview
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#101828]">
            Built Specifically for High-Engagement Online Classrooms
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#53627A]">
            Everything teachers need to conduct interactive lessons and everything students need to learn without distraction.
          </p>

          {/* Interactive Tab Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#F6F8FF] border border-[#E6EAF2] max-w-2xl mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-white text-[#315BFF] shadow-sm shadow-blue-500/10 border border-slate-200/60"
                      : "text-[#53627A] hover:text-[#101828] hover:bg-white/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Preview Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-blue-500/5 overflow-hidden">
          
          {/* Top Classroom Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3.5 text-white gap-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold">Physics & Mathematics 101</h3>
                <span className="text-[11px] text-slate-400 font-mono">Room Code: CLASS-EAQKL2</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                18 Students Connected
              </span>
              <span className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                🧑‍🏫 Teacher Mode
              </span>
            </div>
          </div>

          {/* Tab 1: Canvas & Drawing View */}
          {activeTab === "canvas" && (
            <div className="p-4 sm:p-6 bg-slate-50">
              {/* Whiteboard Controls Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-xs border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {["pen", "eraser", "shape", "text"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTool(t)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                          selectedTool === t
                            ? "bg-[#315BFF] text-white shadow-xs"
                            : "text-slate-700 hover:bg-slate-200/70"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5 px-2">
                    {["#315BFF", "#7047FF", "#10B981", "#F59E0B", "#EF4444"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        style={{ backgroundColor: c }}
                        className={`h-5 w-5 rounded-full transition cursor-pointer ${
                          selectedColor === c ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDemoLocked(!isDemoLocked)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isDemoLocked
                        ? "bg-rose-100 text-rose-700 border border-rose-300"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isDemoLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    {isDemoLocked ? "Board Locked" : "Lock Board"}
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Undo
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Redo
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PNG
                  </button>
                </div>
              </div>

              {/* Canvas Preview Area */}
              <div className="relative h-80 sm:h-96 w-full rounded-2xl bg-white border border-slate-200 shadow-inner overflow-hidden p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-blue-50 px-3 py-1 border border-blue-200 text-xs font-bold text-blue-700">
                    Topic: Coordinate Geometry & Motion Graphs
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">
                    Velocity vs Time: Constant Acceleration Curve
                  </h4>
                </div>

                {/* SVG Curve Illustration */}
                <svg className="h-44 w-full" viewBox="0 0 600 160">
                  <line x1="40" y1="130" x2="560" y2="130" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="40" y1="10" x2="40" y2="130" stroke="#CBD5E1" strokeWidth="2" />
                  <path d="M 40 130 Q 240 120 400 40 T 540 20" fill="none" stroke="#315BFF" strokeWidth="4" />
                  <circle cx="400" cy="40" r="5" fill="#7047FF" />
                  <text x="415" y="45" fill="#7047FF" fontSize="12" fontWeight="bold">Peak Velocity (v = at)</text>
                  <text x="280" y="150" fill="#64748B" fontSize="11" fontWeight="bold">Time (seconds) →</text>
                  <text x="15" y="75" fill="#64748B" fontSize="11" fontWeight="bold" transform="rotate(-90 15 75)">Velocity (m/s)</text>
                </svg>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Selected Tool: <strong className="text-slate-700 uppercase font-mono">{selectedTool}</strong></span>
                  <span>Active Brush Color: <strong style={{ color: selectedColor }}>{selectedColor}</strong></span>
                  <span>Status: <strong className="text-emerald-600">Syncing with Socket.IO</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Classroom Chat View */}
          {activeTab === "chat" && (
            <div className="p-4 sm:p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-96">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      💬 Classroom Chat Stream
                      {demoChatPaused && (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          PAUSED BY TEACHER
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDemoChatPaused(!demoChatPaused)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        demoChatPaused
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {demoChatPaused ? "▶️ Resume Chat" : "⏸️ Pause Chat"}
                    </button>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-56 pr-2">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-violet-700">Mr. Sharma (Teacher)</span>
                        <span className="text-[10px] text-slate-400">10:02 AM</span>
                      </div>
                      <p className="text-slate-800">Welcome everyone! Please look at the acceleration curve on the board.</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-600">Rhea Sen (Student)</span>
                        <span className="text-[10px] text-slate-400">10:05 AM</span>
                      </div>
                      <p className="text-slate-800">Is the slope at point t=4s representing instantaneous acceleration?</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-violet-700">Mr. Sharma (Teacher)</span>
                        <span className="text-[10px] text-slate-400">10:06 AM</span>
                      </div>
                      <p className="text-slate-800">Exactly Rhea! That is the tangent slope \(dv/dt\). Great deduction!</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <input
                    disabled={demoChatPaused}
                    placeholder={demoChatPaused ? "Chat is paused by teacher..." : "Type message in classroom chat..."}
                    className="flex-1 rounded-xl border border-slate-300 p-2 text-xs focus:outline-none disabled:bg-slate-100"
                  />
                  <button
                    disabled={demoChatPaused}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Live People (3)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-violet-50/70 border border-violet-100 text-xs">
                    <span className="font-bold text-violet-900">Mr. Sharma (You)</span>
                    <span className="rounded bg-violet-200 px-1.5 py-0.5 text-[9px] font-bold text-violet-800">TEACHER</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800">Rhea Sen</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">STUDENT</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800">Aarav Patel</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">STUDENT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Teacher Moderation View */}
          {activeTab === "moderation" && (
            <div className="p-4 sm:p-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-3xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Student Whiteboard & Room Authority</h4>
                    <p className="text-xs text-slate-500">Teachers have full authority over individual drawing and participation.</p>
                  </div>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                    Educator Master Controls
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        A
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Aarav Patel</span>
                        <span className="text-[11px] text-slate-500">Active participant • Drawing enabled</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-bold hover:bg-amber-200 transition">
                        🔒 Lock Board
                      </button>
                      <button className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-xs font-bold transition">
                        🚫 Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        R
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          Rohan Gupta
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                            🔒 DRAWING LOCKED
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-500">Whiteboard disabled by teacher • View-only</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-bold hover:bg-emerald-700 transition">
                        🔓 Unlock Board
                      </button>
                      <button className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-xs font-bold transition">
                        🚫 Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>When you lock an individual student, only their drawing tools are stopped. The rest of the class continues uninterrupted.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: File Sharing & Resources */}
          {activeTab === "resources" && (
            <div className="p-4 sm:p-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-3xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Supabase Storage File Hub (Up to 25MB)</h4>
                    <p className="text-xs text-slate-500">Live CDN links, PDF handouts in new tabs, and fullscreen diagram previews.</p>
                  </div>
                  <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold">
                    Fast CDN Storage
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Calculus_Formula_Sheet_2026.pdf</span>
                        <span className="text-[11px] text-slate-500">3.8 MB • Shared by Teacher • 10:15 AM</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Open ↗
                      </button>
                      <button className="rounded-lg bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-200 flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        IMG
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Electromagnetic_Field_Diagram.png</span>
                        <span className="text-[11px] text-slate-500">1.2 MB • Fullscreen Preview Modal Ready</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Preview Modal
                      </button>
                      <button className="rounded-lg bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-200 flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Card Footer with CTA */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <span className="text-xs font-semibold text-slate-600">
              Ready to experience real-time collaborative teaching?
            </span>
            <button
              type="button"
              onClick={() => onOpenAuth("signup")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#315BFF] to-[#7047FF] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition cursor-pointer"
            >
              Start Free Classroom
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

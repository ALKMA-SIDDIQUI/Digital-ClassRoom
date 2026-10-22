import { useState } from "react";
import { Terminal, Copy, Check, ArrowRight, Code2 } from "lucide-react";

export default function DeveloperSection({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("ts");
  const [copied, setCopied] = useState(false);

  const snippets = {
    ts: `import { createOptimusClient } from "@optimus/classroom-sdk";

// Initialize ultra-low-latency client
const client = createOptimusClient({
  apiKey: process.env.OPTIMUS_API_KEY,
  region: "auto", // Lowest-latency edge node
});

// Join live collaborative classroom session
const classroom = await client.classrooms.join("MATH-101", {
  userId: "usr_9428",
  role: "teacher", // "teacher" | "student"
  onStroke: (stroke) => canvas.render(stroke),
  onChat: (msg) => chatFeed.append(msg),
  onLockStateChange: (locked) => canvas.setLocked(locked),
});

console.log("Connected to room:", classroom.id);`,
    python: `from optimus import ClassroomClient

client = ClassroomClient(api_key="opt_live_secret_key")

# Provision new encrypted collaborative room
room = client.classrooms.create(
    title="Advanced Calculus & Geometry",
    room_code="MATH-101",
    enable_chat=True,
    max_file_size_mb=25,
)

print(f"Room active: {room.code} on edge gateway")`,
    react: `import { useOptimusWhiteboard } from "@optimus/react";

export function CollaborativeBoard({ roomCode }) {
  const { strokes, drawStroke, isLocked, activeStudents } = useOptimusWhiteboard({
    roomCode,
    autoConnect: true,
  });

  return (
    <Canvas 
      strokes={strokes} 
      onDraw={drawStroke} 
      readOnly={isLocked}
    />
  );
}`,
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-24 md:py-32 bg-[#090D16] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Developer Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Code2 className="h-3.5 w-3.5" />
              <span>Developer-First Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ship Collaborative AI Tools with{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
                Minimal Code
              </span>
            </h2>

            <p className="text-base text-slate-400 leading-relaxed font-normal">
              Built for engineering teams who demand precision. Integrate our client SDKs, WebSockets, Supabase PostgreSQL storage, and prebuilt vector canvas hooks in minutes.
            </p>

            <div className="space-y-3 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">✓</span>
                <span>Type-safe TypeScript & Python SDKs</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">✓</span>
                <span>Zero-latency Socket.IO event protocol</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">✓</span>
                <span>Complete REST API with JWT authorization</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
              >
                <span>Read the documentation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Code Editor Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#070A12] shadow-2xl shadow-black/90 overflow-hidden font-mono text-xs">
              
              {/* Terminal Titlebar with Language Tabs */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D17] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  
                  {/* Language Tab Switcher */}
                  <div className="ml-4 flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ts")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        activeTab === "ts" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      TypeScript
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("python")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        activeTab === "python" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Python
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("react")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        activeTab === "react" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      React Hook
                    </button>
                  </div>
                </div>

                {/* Copy Snippet Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                  title="Copy code"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Display with Line Numbers */}
              <div className="p-5 overflow-x-auto text-slate-300 leading-relaxed font-mono selection:bg-blue-600/30">
                <pre className="text-xs">
                  <code>{snippets[activeTab]}</code>
                </pre>
              </div>

              {/* Editor Footer Status */}
              <div className="border-t border-white/[0.08] bg-[#0A0D17] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  <span>SDK v2.4.0 (Edge Optimized)</span>
                </span>
                <span className="text-emerald-400 font-semibold">Ready to Install</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

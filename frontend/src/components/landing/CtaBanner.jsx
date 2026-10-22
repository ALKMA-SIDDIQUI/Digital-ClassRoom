import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaBanner({ onOpenAuth }) {
  return (
    <section className="py-20 md:py-28 bg-[#07090E] relative overflow-hidden border-t border-white/[0.08]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Glow Banner Box */}
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-[#0D1528] via-[#090D18] to-[#070A12] p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-cyan-500/10">
          
          {/* Ambient Radial Lights */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-72 w-full max-w-3xl bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-violet-500/30 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready for Immediate Deployment</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Your next intelligent product{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                starts here.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Experience the power of ultra-low latency collaboration, automated classroom workflows, and institutional security with Optimus.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition cursor-pointer"
              >
                <span>Get started free</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth?.("signin")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-semibold text-white hover:bg-white/[0.08] hover:border-white/20 transition cursor-pointer"
              >
                <span>Sign in to account</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              No credit card required • Instant room code generation • 100% free starter tier
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}

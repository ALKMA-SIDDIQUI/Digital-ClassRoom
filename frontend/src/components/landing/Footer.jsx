import { Cpu } from "lucide-react";

export default function Footer({ onOpenAuth }) {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#05070B] text-slate-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Column (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#315BFF] via-[#5442FF] to-[#06B6D4] text-white shadow-md shadow-blue-500/20">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Optimus
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The intelligent infrastructure for real-time collaborative learning, AI-powered whiteboarding, and institutional classroom governance.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">Engine: Active (Socket.IO + PostgreSQL)</span>
            </div>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#platform" onClick={(e) => handleScrollTo(e, "platform")} className="hover:text-cyan-400 transition">
                  Platform Suite
                </a>
              </li>
              <li>
                <a href="#solutions" onClick={(e) => handleScrollTo(e, "solutions")} className="hover:text-cyan-400 transition">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#infrastructure" onClick={(e) => handleScrollTo(e, "infrastructure")} className="hover:text-cyan-400 transition">
                  Infrastructure
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => handleScrollTo(e, "pricing")} className="hover:text-cyan-400 transition">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Developers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#developers" onClick={(e) => handleScrollTo(e, "developers")} className="hover:text-cyan-400 transition">
                  SDK & WebSockets
                </a>
              </li>
              <li>
                <a href="#developers" onClick={(e) => handleScrollTo(e, "developers")} className="hover:text-cyan-400 transition">
                  API Reference
                </a>
              </li>
              <li>
                <button type="button" onClick={() => onOpenAuth?.("signup")} className="text-slate-400 hover:text-cyan-400 transition text-left cursor-pointer">
                  Get API Keys
                </button>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Changelog v2.4</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">About Us</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Careers</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Customer Stories</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Contact Support</span>
              </li>
            </ul>
          </div>

          {/* Col 6: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">FERPA / GDPR</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition">Security Disclosure</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Socials & Copyright */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            © 2026 Optimus Technologies Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-400">
            {/* GitHub SVG */}
            <span className="hover:text-white transition cursor-pointer" aria-label="GitHub">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </span>

            {/* Twitter SVG */}
            <span className="hover:text-white transition cursor-pointer" aria-label="Twitter">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>

            {/* LinkedIn SVG */}
            <span className="hover:text-white transition cursor-pointer" aria-label="LinkedIn">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

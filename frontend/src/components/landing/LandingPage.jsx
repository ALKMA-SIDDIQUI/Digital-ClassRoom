import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import MetricsStrip from "./MetricsStrip";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import InfrastructureSection from "./InfrastructureSection";
import DeveloperSection from "./DeveloperSection";
import IntegrationsSection from "./IntegrationsSection";
import SecuritySection from "./SecuritySection";
import TestimonialsSection from "./TestimonialsSection";
import PricingSection from "./PricingSection";
import FaqSection from "./FaqSection";
import CtaBanner from "./CtaBanner";
import Footer from "./Footer";

export default function LandingPage({ onOpenAuth, onNavigate }) {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Fixed / Sticky Glassmorphism Navigation Bar */}
      <Navbar onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 2. Hero Section (With Preserved Pythagoras Whiteboard Mockup Graphic in Dark Mode) */}
        <HeroSection onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

        {/* 3. Horizontal Metrics / Social Proof Strip */}
        <MetricsStrip />

        {/* 4. Platform Features Section */}
        <FeaturesSection />

        {/* 5. How It Works Section */}
        <HowItWorksSection onOpenAuth={onOpenAuth} />

        {/* 6. Infrastructure Section */}
        <InfrastructureSection onOpenAuth={onOpenAuth} />

        {/* 7. Developer Experience Section (Code Editor) */}
        <DeveloperSection onOpenAuth={onOpenAuth} />

        {/* 8. Integrations Ecosystem Section */}
        <IntegrationsSection onOpenAuth={onOpenAuth} />

        {/* 9. Zero-Trust Security & Compliance Section */}
        <SecuritySection onOpenAuth={onOpenAuth} />

        {/* 10. Testimonials Section */}
        <TestimonialsSection />

        {/* 11. Transparent Pricing Tiers */}
        <PricingSection onOpenAuth={onOpenAuth} />

        {/* 12. FAQ Section */}
        <FaqSection />

        {/* 13. Final Call-to-Action Banner */}
        <CtaBanner onOpenAuth={onOpenAuth} />
      </main>

      {/* 14. Global Footer */}
      <Footer onOpenAuth={onOpenAuth} onNavigate={onNavigate} />
    </div>
  );
}

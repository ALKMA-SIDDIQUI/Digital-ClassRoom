import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import ProductPreview from "./ProductPreview";
import HowItWorksSection from "./HowItWorksSection";
import ForTeachersSection from "./ForTeachersSection";
import ForStudentsSection from "./ForStudentsSection";
import FaqSection from "./FaqSection";
import Footer from "./Footer";

export default function LandingPage({ onOpenAuth, onNavigate }) {
  return (
    <div className="min-h-screen bg-white text-[#101828] flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <Navbar onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

        {/* 2. Features Grid */}
        <FeaturesSection />

        {/* 3. High-Fidelity Product Preview */}
        <ProductPreview onOpenAuth={onOpenAuth} />

        {/* 4. How It Works Workflow */}
        <HowItWorksSection onOpenAuth={onOpenAuth} />

        {/* 5. For Teachers Section */}
        <ForTeachersSection onOpenAuth={onOpenAuth} />

        {/* 6. For Students Section */}
        <ForStudentsSection onOpenAuth={onOpenAuth} />

        {/* 7. FAQ Accordion Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenAuth={onOpenAuth} onNavigate={onNavigate} />
    </div>
  );
}

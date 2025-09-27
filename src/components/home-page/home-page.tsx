"use client";

import { CTASection } from "./cta-section";
import { FAQSection } from "./faq-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingSection } from "./pricing-section";
import { TestimonialsSection } from "./testimonials-section";

export function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}

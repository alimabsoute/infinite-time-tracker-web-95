
import React from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/landing/HeroSection";
import AnalyticsPreviewSection from "@/components/landing/AnalyticsPreviewSection";
import ScreenshotCarousel from "@/components/landing/ScreenshotCarousel";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <AnalyticsPreviewSection />
      <ScreenshotCarousel />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </motion.div>
  );
};

export default LandingPage;


import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import AnalyticsPreviewSection from "@/components/landing/AnalyticsPreviewSection";
import ScreenshotCarousel from "@/components/landing/ScreenshotCarousel";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Show Header for authenticated users */}
      {user && <Header />}
      
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

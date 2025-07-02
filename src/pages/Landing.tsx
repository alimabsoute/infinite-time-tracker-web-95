
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
        <motion.div 
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"/>
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-r-accent"
            animate={{ rotate: -360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/8 via-accent/5 to-transparent rounded-full"
          animate={{
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 120, 240, 360],
            opacity: [0.3, 0.6, 0.4, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-[120%] h-[120%] bg-gradient-to-tl from-accent/8 via-primary/5 to-transparent rounded-full"
          animate={{
            scale: [1.2, 1, 1.3, 1.2],
            rotate: [360, 240, 120, 0],
            opacity: [0.4, 0.7, 0.3, 0.4],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Additional floating elements */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-40"
            animate={{
              x: [0, 200 + i * 50, 0],
              y: [0, -150 - i * 20, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 8 + i * 0.5,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Show Header for authenticated users */}
      {user && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Header />
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <HeroSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <AnalyticsPreviewSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2 }}
      >
        <ScreenshotCarousel />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: -150 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <FeaturesSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 150, rotateY: 15 }}
        whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2 }}
      >
        <PricingSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, rotateX: 20, scale: 0.9 }}
        whileInView={{ opacity: 1, rotateX: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <TestimonialsSection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotateZ: 5 }}
        whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2 }}
      >
        <CTASection />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;

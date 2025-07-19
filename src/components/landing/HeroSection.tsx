
import React from "react";
import { motion } from "framer-motion";
import FloatingBackground from "./FloatingBackground";
import HeroMainContent from "./hero/HeroMainContent";
import HeroPreview from "./HeroPreview";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-br from-background via-background/50 to-background">
      <FloatingBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid lg:grid-cols-12 gap-16 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Left side - Main content */}
          <div className="lg:col-span-7 xl:col-span-6">
            <HeroMainContent />
          </div>
          
          {/* Right side - Preview */}
          <div className="lg:col-span-5 xl:col-span-6">
            <HeroPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

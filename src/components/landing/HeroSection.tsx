
import React from "react";
import FloatingBackground from "./FloatingBackground";
import HeroContent from "./HeroContent";
import HeroPreview from "./HeroPreview";
import FeatureHighlights from "./FeatureHighlights";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-background via-background to-background">
      <FloatingBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <HeroContent />
            <FeatureHighlights />
          </div>
          
          <HeroPreview />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

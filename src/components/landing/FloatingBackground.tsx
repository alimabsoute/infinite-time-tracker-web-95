
import React from "react";
import { motion } from "framer-motion";

const FloatingBackground = () => {
  // Animation variants for floating circles
  const createFloatingAnimation = (initialX: number, initialY: number, range: number) => ({
    x: [initialX, initialX + range, initialX - range, initialX],
    y: [initialY, initialY - range, initialY + range, initialY],
    transition: {
      duration: Math.random() * 20 + 30, // 30-50 seconds for very slow movement
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 10, // Stagger the start times
    }
  });

  return (
    <div className="absolute inset-0 z-0 opacity-30">
      {/* Animated floating circles */}
      <motion.div 
        className="absolute w-40 h-40 rounded-full bg-primary/20"
        style={{ top: '2.5rem', left: '2.5rem' }}
        animate={createFloatingAnimation(0, 0, 50)}
      />
      <motion.div 
        className="absolute w-60 h-60 rounded-full bg-primary/10"
        style={{ bottom: '10rem', right: '5rem' }}
        animate={createFloatingAnimation(0, 0, 80)}
      />
      <motion.div 
        className="absolute w-20 h-20 rounded-full bg-accent/20"
        style={{ top: '10rem', right: '10rem' }}
        animate={createFloatingAnimation(0, 0, 30)}
      />
    </div>
  );
};

export default FloatingBackground;

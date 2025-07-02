
import React from "react";
import { motion } from "framer-motion";
import CircularTimerDisplay from "./CircularTimerDisplay";

const HeroPreview = () => {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.5, duration: 1, type: "spring", bounce: 0.2 }}
    >
      <div className="relative z-10">
        <motion.div
          whileHover={{ 
            scale: 1.02,
            rotateY: -5,
            rotateX: 5,
          }}
          transition={{ duration: 0.3 }}
          className="perspective-1000"
        >
          <CircularTimerDisplay />
        </motion.div>
      </div>
      
      {/* Subtle decorative elements */}
      <motion.div 
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 -z-10 blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-accent/15 to-primary/15 -z-10 blur-xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default HeroPreview;

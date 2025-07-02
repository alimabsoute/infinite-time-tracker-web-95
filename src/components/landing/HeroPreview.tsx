
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
      
      {/* Enhanced Decorative Elements */}
      <motion.div 
        className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 -z-10 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 -z-10 blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating Elements */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full opacity-40"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + i,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default HeroPreview;

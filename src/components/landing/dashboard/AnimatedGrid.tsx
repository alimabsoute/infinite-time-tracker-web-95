
import React from "react";
import { motion } from "framer-motion";

const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 opacity-10">
      <motion.div 
        className="grid grid-cols-12 grid-rows-8 h-full w-full"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {Array.from({ length: 96 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="border border-white/20"
            animate={{ 
              borderColor: [`rgba(255,255,255,0.1)`, `rgba(99,102,241,0.3)`, `rgba(255,255,255,0.1)`] 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              delay: i * 0.01,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedGrid;

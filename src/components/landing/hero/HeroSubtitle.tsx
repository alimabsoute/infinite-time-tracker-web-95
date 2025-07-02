
import React from "react";
import { motion } from "framer-motion";

const HeroSubtitle = () => {
  return (
    <motion.h2 
      className="text-2xl md:text-4xl font-medium mb-6 text-foreground/90"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <motion.span
        animate={{ 
          color: ["#000", "#6366f1", "#8b5cf6", "#000"],
          textShadow: [
            "0 0 0px currentColor",
            "0 0 20px currentColor", 
            "0 0 10px currentColor",
            "0 0 0px currentColor"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        Track your time,
      </motion.span>{" "}
      <motion.span
        animate={{ 
          color: ["#000", "#8b5cf6", "#6366f1", "#000"],
          textShadow: [
            "0 0 0px currentColor",
            "0 0 20px currentColor", 
            "0 0 10px currentColor",
            "0 0 0px currentColor"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        boost your productivity
      </motion.span>
    </motion.h2>
  );
};

export default HeroSubtitle;


import React from "react";
import { motion } from "framer-motion";

const HeroDescription = () => {
  return (
    <motion.p 
      className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto lg:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      PhynxTimer helps you understand how you spend your time with{" "}
      <motion.span 
        className="text-primary font-semibold"
        animate={{ 
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        unlimited running timers
      </motion.span>
      , advanced analytics, and goal tracking. Start with 3 free timers,
      then unlock the full power with our Pro plan.
    </motion.p>
  );
};

export default HeroDescription;

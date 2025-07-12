
import React from "react";
import { motion } from "framer-motion";
import PhynxTimerLogo from "../../PhynxTimerLogo";

const HeroTitle = () => {
  return (
    <>
      {/* Enhanced floating background elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full -z-10"
          animate={{
            x: [0, 100 + i * 20, 0],
            y: [0, -80 - i * 10, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 360, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6 + i * 0.5,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          style={{
            left: `${5 + i * 12}%`,
            top: `${10 + (i % 4) * 20}%`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
        className="inline-flex items-center gap-3 mb-6"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <PhynxTimerLogo width={96} height={96} className="text-primary" />
        </motion.div>
        <motion.h1 
          className="text-5xl md:text-7xl hero-title hero-title-animated"
          animate={{ 
            scale: [1, 1.02, 1],
            filter: [
              "drop-shadow(0 4px 8px hsl(var(--hero-outline) / 0.3))",
              "drop-shadow(0 6px 12px hsl(var(--hero-outline) / 0.4))",
              "drop-shadow(0 4px 8px hsl(var(--hero-outline) / 0.3))"
            ]
          }}
          transition={{ 
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          PhynxTimer
        </motion.h1>
      </motion.div>
    </>
  );
};

export default HeroTitle;


import React from "react";
import { motion } from "framer-motion";

const FloatingParticles = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          animate={{
            x: [0, 150, 0],
            y: [0, -80, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + i * 0.5,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          style={{
            left: `${15 + i * 10}%`,
            top: `${40 + (i % 3) * 15}%`,
          }}
        />
      ))}
    </>
  );
};

export default FloatingParticles;

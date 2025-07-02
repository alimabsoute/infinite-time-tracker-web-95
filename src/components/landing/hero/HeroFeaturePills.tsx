
import React from "react";
import { motion } from "framer-motion";
import { Timer, BarChart3, Target, Zap } from "lucide-react";

const HeroFeaturePills = () => {
  const features = [
    { icon: Timer, text: "Multiple Running Timers", delay: 0.2 },
    { icon: BarChart3, text: "Advanced Analytics", delay: 0.4 },
    { icon: Target, text: "Goal Tracking", delay: 0.6 },
    { icon: Zap, text: "Real-time Sync", delay: 0.8 }
  ];

  return (
    <motion.div 
      className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: 20, rotateX: 45 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          transition={{ delay: feature.delay, duration: 0.5 }}
          whileHover={{ 
            scale: 1.1, 
            y: -5,
            rotateY: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 rounded-full px-4 py-2 text-sm border border-primary/20 shadow-md"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <feature.icon className="h-4 w-4 text-primary" />
          </motion.div>
          <span>{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroFeaturePills;

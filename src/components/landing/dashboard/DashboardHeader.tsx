
import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface DashboardHeaderProps {
  variants: any;
}

const DashboardHeader = ({ variants }: DashboardHeaderProps) => {
  return (
    <motion.div 
      className="flex items-center justify-between mb-8"
      variants={variants}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="h-6 w-6 text-blue-400" />
        </motion.div>
        <h3 className="text-xl font-bold">PhynxTimer Dashboard</h3>
      </div>
      <div className="text-3xl font-mono">
        <motion.span
          animate={{ 
            opacity: [1, 0.5, 1],
            scale: [1, 1.05, 1]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          14:23:42
        </motion.span>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;

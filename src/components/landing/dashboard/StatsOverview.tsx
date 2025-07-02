
import React from "react";
import { motion } from "framer-motion";
import { Play, Target, Calendar, Zap } from "lucide-react";

interface StatsOverviewProps {
  variants: any;
}

const StatsOverview = ({ variants }: StatsOverviewProps) => {
  const stats = [
    { icon: Play, label: "Running", value: "3", color: "text-green-400" },
    { icon: Target, label: "Goals", value: "5", color: "text-blue-400" },
    { icon: Calendar, label: "Today", value: "4h", color: "text-purple-400" },
    { icon: Zap, label: "Streak", value: "12d", color: "text-yellow-400" }
  ];

  return (
    <motion.div 
      className="grid grid-cols-4 gap-4 mb-8"
      variants={variants}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="bg-white/5 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
          animate={{ y: [0, -2, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
          </motion.div>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-white/60">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsOverview;

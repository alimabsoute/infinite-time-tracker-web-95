
import { motion } from "framer-motion";

interface DashboardStatsProps {
  variants: any;
}

const DashboardStats = ({ variants }: DashboardStatsProps) => {
  const stats = [
    { value: "4h 35m", label: "Today", color: "text-green-400", delay: 0 },
    { value: "23h 12m", label: "This Week", color: "text-blue-400", delay: 0.5 },
    { value: "95%", label: "Efficiency", color: "text-purple-400", delay: 1 }
  ];

  return (
    <motion.div 
      className="grid grid-cols-3 gap-6"
      variants={variants}
    >
      {stats.map((stat, index) => (
        <motion.div key={index} className="text-center">
          <motion.div
            className={`text-3xl font-bold ${stat.color}`}
            animate={{ 
              scale: [1, 1.1, 1],
              textShadow: [
                "0 0 0px currentColor",
                "0 0 10px currentColor",
                "0 0 0px currentColor"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: stat.delay,
              ease: "easeInOut"
            }}
          >
            {stat.value}
          </motion.div>
          <div className="text-sm text-white/60 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;

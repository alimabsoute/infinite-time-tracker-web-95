
import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square } from "lucide-react";

const RealisticTimerDisplay = () => {
  const timers = [
    {
      name: "Website Redesign",
      time: "02:45:23",
      category: "Work",
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-400",
      bgColor: "bg-blue-50",
      isRunning: true,
      progress: 75
    },
    {
      name: "Client Meeting Prep",
      time: "01:30:45",
      category: "Meeting",
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-400",
      bgColor: "bg-purple-50",
      isRunning: false,
      progress: 45
    },
    {
      name: "Code Review",
      time: "00:58:12",
      category: "Development",
      color: "from-green-500 to-green-600",
      borderColor: "border-green-400",
      bgColor: "bg-green-50",
      isRunning: true,
      progress: 30
    },
    {
      name: "Project Planning",
      time: "03:12:05",
      category: "Planning",
      color: "from-orange-500 to-orange-600",
      borderColor: "border-orange-400",
      bgColor: "bg-orange-50",
      isRunning: false,
      progress: 90
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-2xl border border-gray-200/50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 gap-6"
      >
        {timers.map((timer, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative ${timer.bgColor} rounded-xl p-6 ${timer.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {/* Running indicator */}
            {timer.isRunning && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"
              />
            )}
            
            {/* Timer content */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{timer.name}</h4>
                  <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                    {timer.category}
                  </span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  {timer.isRunning ? (
                    <Pause className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                  ) : (
                    <Play className="h-5 w-5 text-gray-600 hover:text-green-500 transition-colors" />
                  )}
                </motion.div>
              </div>
              
              {/* Time display */}
              <motion.div
                animate={timer.isRunning ? { 
                  textShadow: ["0 0 0px currentColor", "0 0 8px currentColor", "0 0 0px currentColor"] 
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`text-2xl font-mono font-bold bg-gradient-to-r ${timer.color} bg-clip-text text-transparent`}
              >
                {timer.time}
              </motion.div>
              
              {/* Progress bar */}
              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${timer.progress}%` }}
                  transition={{ delay: index * 0.2, duration: 1, ease: "easeOut" }}
                  className={`h-2 bg-gradient-to-r ${timer.color} rounded-full`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -60, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + i * 0.5,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
        />
      ))}
    </div>
  );
};

export default RealisticTimerDisplay;

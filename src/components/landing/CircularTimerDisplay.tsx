
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { getProcessedTimerColors } from "../../utils/timerColorProcessor";

const CircularTimerDisplay = () => {
  const timers = [
    {
      id: "timer-1",
      name: "Website Redesign",
      time: "02:45:23",
      category: "Work",
      isRunning: true,
      progress: 75
    },
    {
      id: "timer-2", 
      name: "Client Meeting",
      time: "01:30:45",
      category: "Meeting",
      isRunning: false,
      progress: 45
    },
    {
      id: "timer-3",
      name: "Code Review",
      time: "00:58:12", 
      category: "Development",
      isRunning: true,
      progress: 30
    },
    {
      id: "timer-4",
      name: "Planning",
      time: "03:12:05",
      category: "Planning", 
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
        className="grid grid-cols-2 gap-8"
      >
        {timers.map((timer, index) => {
          const colors = getProcessedTimerColors(timer.id);
          
          return (
            <motion.div
              key={timer.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative"
            >
              {/* Running indicator */}
              {timer.isRunning && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg z-20"
                />
              )}
              
              {/* Circular timer container */}
              <div className="relative w-48 h-48 mx-auto">
                {/* Primary border */}
                <div 
                  className="absolute inset-0 rounded-full border-6 transition-all duration-300"
                  style={{
                    borderColor: colors.primaryBorder,
                    boxShadow: `
                      0 0 0 1px ${colors.primaryBorder},
                      0 4px 20px ${colors.shadowColor}40,
                      inset 0 0 20px ${colors.shadowColor}15,
                      0 8px 32px ${colors.shadowColor}25
                    `
                  }}
                />
                
                {/* Secondary border */}
                <div 
                  className="absolute top-1 left-1 right-1 bottom-1 rounded-full border-2"
                  style={{ borderColor: colors.secondaryBorder }}
                />
                
                {/* Inner content */}
                <div 
                  className="absolute top-2 left-2 right-2 bottom-2 rounded-full flex flex-col items-center justify-center backdrop-blur-sm"
                  style={{ backgroundColor: colors.backgroundFill }}
                >
                  {/* Category badge */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/60 text-gray-700 font-medium">
                      {timer.category}
                    </span>
                  </div>
                  
                  {/* Timer name */}
                  <div className="text-center mb-2 px-4">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                      {timer.name}
                    </h4>
                  </div>
                  
                  {/* Time display */}
                  <motion.div
                    animate={timer.isRunning ? { 
                      textShadow: ["0 0 0px currentColor", "0 0 8px currentColor", "0 0 0px currentColor"] 
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl font-mono font-bold mb-3"
                    style={{ color: colors.primaryBorder }}
                  >
                    {timer.time}
                  </motion.div>
                  
                  {/* Control button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                  >
                    {timer.isRunning ? (
                      <Pause className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    ) : (
                      <Play className="h-4 w-4 text-gray-600 hover:text-green-500 ml-0.5" />
                    )}
                  </motion.button>
                  
                  {/* Progress indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i < Math.floor(timer.progress / 20) 
                            ? 'opacity-100' 
                            : 'opacity-30'
                        }`}
                        style={{ 
                          backgroundColor: i < Math.floor(timer.progress / 20) 
                            ? colors.primaryBorder 
                            : colors.secondaryBorder 
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Running pulse animation */}
                {timer.isRunning && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ borderColor: colors.primaryBorder }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0px ${colors.primaryBorder}40`,
                        `0 0 0 8px ${colors.primaryBorder}20`,
                        `0 0 0 0px ${colors.primaryBorder}40`
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CircularTimerDisplay;

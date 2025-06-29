
import React from "react";
import { motion } from "framer-motion";
import { Clock, Play, Pause, BarChart3, Target, Calendar, Zap } from "lucide-react";

const EnhancedAnimatedDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="grid grid-cols-12 grid-rows-8 h-full w-full"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {Array.from({ length: 96 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="border border-white/20"
              animate={{ 
                borderColor: [`rgba(255,255,255,0.1)`, `rgba(99,102,241,0.3)`, `rgba(255,255,255,0.1)`] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                delay: i * 0.01,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
      
      <div className="relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
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

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          {[
            { icon: Play, label: "Running", value: "3", color: "text-green-400" },
            { icon: Target, label: "Goals", value: "5", color: "text-blue-400" },
            { icon: Calendar, label: "Today", value: "4h", color: "text-purple-400" },
            { icon: Zap, label: "Streak", value: "12d", color: "text-yellow-400" }
          ].map((stat, index) => (
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

        {/* Enhanced Active Timers */}
        <motion.div 
          className="space-y-4 mb-8"
          variants={itemVariants}
        >
          {/* Running Timer */}
          <motion.div 
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30 relative overflow-hidden"
            animate={{ 
              borderColor: [
                "rgba(34, 197, 94, 0.3)", 
                "rgba(34, 197, 94, 0.8)", 
                "rgba(34, 197, 94, 0.3)"
              ],
              boxShadow: [
                "0 0 0 rgba(34, 197, 94, 0.3)",
                "0 0 20px rgba(34, 197, 94, 0.3)",
                "0 0 0 rgba(34, 197, 94, 0.3)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 bg-green-400 rounded-full"
                />
                <span className="font-semibold text-lg">Website Redesign</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Work</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pause className="h-5 w-5 text-green-400 cursor-pointer" />
                </motion.div>
                <span className="font-mono text-2xl text-green-400 font-bold">02:34:12</span>
              </div>
            </div>
            
            <div className="relative w-full bg-white/20 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                animate={{ width: ["65%", "66%", "65%"] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </div>
          </motion.div>

          {/* Paused Timer */}
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-yellow-400/30 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                <span className="font-semibold text-lg text-white/90">Client Meeting Prep</span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">Meeting</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="h-5 w-5 text-yellow-400 cursor-pointer" />
                </motion.div>
                <span className="font-mono text-xl text-yellow-400 font-bold">01:15:30</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full w-[35%]" />
            </div>
          </motion.div>

          {/* Completed Timer */}
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10 opacity-75"
            animate={{ opacity: [0.75, 0.9, 0.75] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 bg-emerald-500 rounded-full"
                />
                <span className="font-semibold text-lg text-white/80">Code Review</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">Review</span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="font-mono text-xl text-blue-400 font-bold">01:15:20</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full w-full" />
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {[
            { value: "4h 35m", label: "Today", color: "text-green-400", delay: 0 },
            { value: "23h 12m", label: "This Week", color: "text-blue-400", delay: 0.5 },
            { value: "95%", label: "Efficiency", color: "text-purple-400", delay: 1 }
          ].map((stat, index) => (
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
      </div>

      {/* Enhanced Floating Particles */}
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
    </motion.div>
  );
};

export default EnhancedAnimatedDashboard;

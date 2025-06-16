
import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, BarChart3 } from "lucide-react";
import PhynxTimerLogo from "../PhynxTimerLogo";

const AnimatedDashboard = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PhynxTimerLogo width={20} height={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold">Active Timers</h3>
          </div>
          <div className="text-2xl font-mono">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              14:23:42
            </motion.span>
          </div>
        </div>

        {/* Active timers */}
        <div className="space-y-4 mb-6">
          {/* Timer 1 - Active */}
          <motion.div 
            className="bg-white/10 rounded-lg p-4 border border-green-400/30"
            animate={{ borderColor: ["rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.6)", "rgba(34, 197, 94, 0.3)"] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
                <span className="font-medium">Website Redesign</span>
              </div>
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4 text-green-400" />
                <span className="font-mono text-green-400">02:34:12</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-green-400 h-2 rounded-full"
                animate={{ width: ["65%", "66%", "65%"] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </div>
          </motion.div>

          {/* Timer 2 - Paused */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="font-medium text-white/80">Client Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-yellow-400" />
                <span className="font-mono text-yellow-400">01:15:30</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full w-[35%]" />
            </div>
          </div>

          {/* Timer 3 - Completed */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <span className="font-medium text-white/80">Code Review</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-blue-400">00:45:20</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold text-green-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
            >
              4h 35m
            </motion.div>
            <div className="text-sm text-white/60">Today</div>
          </div>
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold text-blue-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              23h 12m
            </motion.div>
            <div className="text-sm text-white/60">This Week</div>
          </div>
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold text-purple-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            >
              95%
            </motion.div>
            <div className="text-sm text-white/60">Efficiency</div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i,
            delay: i * 0.5,
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedDashboard;

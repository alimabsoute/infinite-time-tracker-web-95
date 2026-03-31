
import { motion } from "framer-motion";
import { Play, Pause, BarChart3 } from "lucide-react";

interface ActiveTimersSectionProps {
  variants: any;
}

const ActiveTimersSection = ({ variants }: ActiveTimersSectionProps) => {
  return (
    <motion.div 
      className="space-y-4 mb-8"
      variants={variants}
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
  );
};

export default ActiveTimersSection;

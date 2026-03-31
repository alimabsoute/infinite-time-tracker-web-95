
import React from 'react';
import { motion } from 'framer-motion';

const ColorLegend: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
      <span>Activity Level:</span>
      <motion.div 
        className="flex items-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
      >
        <div className="w-3 h-3 bg-blue-500/20 rounded-sm"></div>
        <span className="ml-1">Low</span>
      </motion.div>
      <motion.div 
        className="flex items-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
      >
        <div className="w-3 h-3 bg-blue-500/40 rounded-sm"></div>
        <span className="ml-1">Medium</span>
      </motion.div>
      <motion.div 
        className="flex items-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
      >
        <div className="w-3 h-3 bg-blue-500/80 rounded-sm"></div>
        <span className="ml-1">High</span>
      </motion.div>
    </div>
  );
};

export default ColorLegend;

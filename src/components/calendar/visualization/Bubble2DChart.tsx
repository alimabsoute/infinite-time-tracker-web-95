
import React from 'react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../../types";
import { useBubbleDataProcessor, BubbleData } from './BubbleDataProcessor';

interface Bubble2DChartProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  onError?: (error: Error) => void;
}

export const Bubble2DChart: React.FC<Bubble2DChartProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick,
  onError
}) => {
  const bubbles = useBubbleDataProcessor({
    sessions,
    startDate,
    endDate,
    onError
  });

  console.log('🔍 Bubble2DChart - Rendering with', bubbles.length, 'bubbles');

  if (!bubbles || bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-600">
          <p>No timer data available for 2D visualization</p>
          <p className="text-sm mt-2">Sessions available: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 400"
        className="absolute inset-0"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Bubbles */}
        {bubbles.map((bubble, index) => {
          // Map 3D position to 2D
          const x = ((bubble.position[0] + 8) / 16) * 700 + 50; // Map -8 to 8 range to 50-750
          const y = ((bubble.position[1] + 3) / 6) * 300 + 50;  // Map -3 to 3 range to 50-350
          const radius = bubble.size * 20 + 10; // Scale size for 2D
          
          return (
            <motion.circle
              key={bubble.id}
              cx={x}
              cy={y}
              r={radius}
              fill={bubble.color}
              fillOpacity={0.7}
              stroke={bubble.color}
              strokeWidth={2}
              className="cursor-pointer hover:fill-opacity-100 transition-all duration-200"
              onClick={() => onBubbleClick?.(bubble)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <title>{`${bubble.timerName}\nTotal: ${(bubble.totalTime / 3600000).toFixed(1)}h\nSessions: ${bubble.sessionCount}`}</title>
            </motion.circle>
          );
        })}
        
        {/* Axis labels */}
        <text x="400" y="390" textAnchor="middle" className="text-xs fill-slate-600">
          Time Timeline →
        </text>
        <text x="15" y="200" textAnchor="middle" className="text-xs fill-slate-600" transform="rotate(-90 15 200)">
          Activity Level ↑
        </text>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-slate-700 text-xs space-y-1">
          <div className="font-semibold mb-2">2D Bubble Chart</div>
          <div>• Size = Total time logged</div>
          <div>• Position = Timeline & activity</div>
          <div>• Colors = Categories</div>
          <div className="text-slate-500 mt-2">{bubbles.length} timers visualized</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Bubble2DChart;

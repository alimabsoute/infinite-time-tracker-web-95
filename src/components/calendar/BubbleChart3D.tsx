
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../types";
import { useBubbleDataProcessor } from './visualization/BubbleDataProcessor';
import BubbleScene3D from './visualization/BubbleScene3D';
import BubbleChartLegend from './visualization/BubbleChartLegend';

interface BubbleChart3DProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: any) => void;
}

export const BubbleChart3D: React.FC<BubbleChart3DProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick
}) => {
  // Process data using the dedicated hook
  const bubbles = useBubbleDataProcessor({
    sessions,
    currentWeekStart
  });

  const handleBubbleClick = (bubble: any) => {
    console.log('🔍 BubbleChart3D - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  if (!bubbles || bubbles.length === 0) {
    console.log('🔍 BubbleChart3D - No bubbles to render');
    return (
      <motion.div 
        className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-white">
          <p>No timer data available for this week</p>
          <p className="text-sm mt-2 text-slate-300">Create some timers and log time to see the 3D visualization</p>
          <p className="text-xs mt-4 text-slate-400">Debug: {sessions.length} sessions available</p>
        </div>
      </motion.div>
    );
  }

  console.log('🔍 BubbleChart3D - Rendering with', bubbles.length, 'bubbles');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden relative"
    >
      <Canvas
        camera={{ position: [0, 5, 15], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        onCreated={({ gl }) => {
          console.log('🔍 BubbleChart3D - Canvas created successfully');
          gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
        }}
      >
        <BubbleScene3D bubbles={bubbles} onBubbleClick={handleBubbleClick} />
      </Canvas>
      
      <BubbleChartLegend bubblesCount={bubbles.length} />
    </motion.div>
  );
};

export default BubbleChart3D;


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreemapNodeData } from './utils/TreemapDataProcessor';

interface TreemapTooltipProps {
  node: TreemapNodeData | null;
  viewMode: 'category' | 'timer';
}

const TreemapTooltip: React.FC<TreemapTooltipProps> = ({ node, viewMode }) => {
  if (!node) return null;

  const totalHours = (node.value / (1000 * 60 * 60)).toFixed(1);
  const avgSessionTime = node.sessions > 0 ? (node.value / node.sessions / (1000 * 60)).toFixed(0) : '0';

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8, x: -10, y: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -10, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute pointer-events-none z-30"
        style={{
          left: node.x + node.width / 2,
          top: node.y - 10,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm min-w-48">
          <div className="font-semibold text-foreground mb-2">{node.name}</div>
          
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Time:</span>
              <span className="font-medium text-foreground">{totalHours}h</span>
            </div>
            
            <div className="flex justify-between">
              <span>Sessions:</span>
              <span className="font-medium text-foreground">{node.sessions}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Avg/Session:</span>
              <span className="font-medium text-foreground">{avgSessionTime}m</span>
            </div>

            {viewMode === 'timer' && node.category && (
              <div className="flex justify-between pt-1 border-t">
                <span>Category:</span>
                <span className="font-medium text-foreground">{node.category}</span>
              </div>
            )}
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-background/95"></div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TreemapTooltip;

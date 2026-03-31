
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import TreemapNode from './TreemapNode';
import TreemapTooltip from './TreemapTooltip';
import { processTreemapData, TreemapNodeData } from './utils/TreemapDataProcessor';

interface InteractiveTreemapChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  isStandalone?: boolean;
  onBubbleClick?: (timer: any) => void;
}

const InteractiveTreemapChart: React.FC<InteractiveTreemapChartProps> = ({
  sessions,
  selectedCategory,
  isStandalone = false,
  onBubbleClick
}) => {
  const [hoveredNode, setHoveredNode] = useState<TreemapNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreemapNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'category' | 'timer'>('category');


  // Process data into treemap format with dynamic container sizing
  const treemapData = useMemo(() => {
    // Calculate responsive container dimensions
    const baseWidth = isStandalone ? 768 : 800;
    const baseHeight = isStandalone ? 320 : 500;
    
    return processTreemapData(sessions, selectedCategory, viewMode, baseWidth, baseHeight);
  }, [sessions, selectedCategory, viewMode, isStandalone]);

  const handleNodeHover = useCallback((node: TreemapNodeData | null) => {
    setHoveredNode(node);
  }, []);

  const handleNodeClick = useCallback((node: TreemapNodeData) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }

    // Call the bubble click handler if provided
    if (onBubbleClick) {
      const totalHours = (node.value / (1000 * 60 * 60)).toFixed(1);
      const avgSessionTime = node.sessions > 0 ? (node.value / node.sessions / (1000 * 60)).toFixed(0) : '0';
      
      onBubbleClick({
        id: node.id,
        name: node.name,
        totalTime: node.value,
        totalHours: totalHours,
        sessionCount: node.sessions,
        avgSessionTime: parseFloat(avgSessionTime),
        category: node.category || 'Uncategorized',
        isRunning: false // Treemap shows historical data, so nothing is currently running
      });
    }
  }, [selectedNode, onBubbleClick]);

  const handleViewModeToggle = useCallback(() => {
    setViewMode(prev => prev === 'category' ? 'timer' : 'category');
    setSelectedNode(null);
    setHoveredNode(null);
  }, []);

  if (!treemapData || treemapData.children.length === 0) {
    return (
      <div className={isStandalone ? "h-[400px]" : "h-full"}>
        <Card className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="font-medium">No Treemap Data</p>
            <p className="text-sm">No timer data found for the selected period</p>
            <p className="text-xs">Sessions processed: {sessions.length}</p>
          </div>
        </Card>
      </div>
    );
  }

  const content = (
    <div className="h-full w-full relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <motion.button
          onClick={handleViewModeToggle}
          className="px-3 py-1 bg-background/90 backdrop-blur-sm border rounded-md text-xs font-medium hover:bg-muted transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View by {viewMode === 'category' ? 'Timer' : 'Category'}
        </motion.button>
      </div>

      {/* Treemap Container */}
      <div className="h-full w-full p-4 bg-gradient-to-br from-background to-muted/20 rounded-lg overflow-hidden relative">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${isStandalone ? 768 : 800} ${isStandalone ? 320 : 500}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="treemap-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="treemap-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
          </defs>
          
          {/* Background rectangle to show container bounds */}
          <rect 
            x="0" 
            y="0" 
            width={isStandalone ? 768 : 800} 
            height={isStandalone ? 320 : 500}
            fill="url(#treemap-bg)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            rx="8"
          />
          
          <AnimatePresence mode="wait">
            <motion.g
              key={viewMode}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {treemapData.children.map((node, index) => (
                <TreemapNode
                  key={`${node.id}-${viewMode}`}
                  node={node}
                  index={index}
                  isHovered={hoveredNode?.id === node.id}
                  isSelected={selectedNode?.id === node.id}
                  onHover={handleNodeHover}
                  onClick={handleNodeClick}
                  viewMode={viewMode}
                />
              ))}
            </motion.g>
          </AnimatePresence>
        </svg>

        {/* Tooltip */}
        <TreemapTooltip 
          node={hoveredNode || selectedNode} 
          viewMode={viewMode}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 text-xs space-y-2">
        <div className="font-medium">Interactive Treemap</div>
        <div className="space-y-1 text-muted-foreground">
          <div>• Rectangle size = Total time</div>
          <div>• Color intensity = Activity level</div>
          <div>• Click rectangles to select</div>
          <div>• Hover for details</div>
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Timer Activity Treemap</CardTitle>
          <p className="text-sm text-muted-foreground">
            Hierarchical view of timer usage • {treemapData.children.length} {viewMode === 'category' ? 'categories' : 'timers'}
          </p>
        </CardHeader>
        <CardContent className="h-full pb-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

export default InteractiveTreemapChart;

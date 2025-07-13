
import React from 'react';
import { motion } from 'framer-motion';

export interface TreemapNodeData {
  name: string;
  size: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  totalHours: string;
  sessionCount: number;
  category: string;
  isRunning: boolean;
  data?: {
    name: string;
    totalHours: string;
    sessionCount: number;
    category: string;
    isRunning: boolean;
  };
}

interface TreemapNodeProps {
  node: TreemapNodeData;
  onClick: (node: TreemapNodeData) => void;
  isSelected: boolean;
}

const TreemapNode: React.FC<TreemapNodeProps> = ({ node, onClick, isSelected }) => {
  const handleClick = () => {
    onClick(node);
  };

  // Use node properties directly, fallback to data if needed
  const displayName = node.name || node.data?.name || 'Unknown';
  const displayHours = node.totalHours || node.data?.totalHours || '0.0';
  const displaySessions = node.sessionCount || node.data?.sessionCount || 0;
  const displayCategory = node.category || node.data?.category || 'Uncategorized';
  const displayIsRunning = node.isRunning || node.data?.isRunning || false;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <motion.rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={node.color}
        stroke={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.2)'}
        strokeWidth={isSelected ? 3 : 1}
        rx={4}
        whileHover={{ 
          scale: 1.02,
          stroke: '#3b82f6',
          strokeWidth: 2
        }}
        transition={{ duration: 0.2 }}
      />
      
      {node.width > 80 && node.height > 40 && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2 - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(12, node.width / 8)}
          fill="white"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {displayName}
        </motion.text>
      )}
      
      {node.width > 100 && node.height > 60 && (
        <>
          <motion.text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2 + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(10, node.width / 10)}
            fill="rgba(255,255,255,0.8)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {displayHours}h
          </motion.text>
          <motion.text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2 + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(9, node.width / 12)}
            fill="rgba(255,255,255,0.7)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {displaySessions} sessions
          </motion.text>
        </>
      )}
      
      {displayIsRunning && (
        <motion.circle
          cx={node.x + node.width - 8}
          cy={node.y + 8}
          r={4}
          fill="#22c55e"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        />
      )}
    </motion.g>
  );
};

export default TreemapNode;

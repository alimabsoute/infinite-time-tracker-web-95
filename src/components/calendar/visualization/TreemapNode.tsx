
import React from 'react';
import { motion } from 'framer-motion';
import { TreemapNodeData } from './utils/TreemapDataProcessor';

interface TreemapNodeProps {
  node: TreemapNodeData;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (node: TreemapNodeData | null) => void;
  onClick: (node: TreemapNodeData) => void;
  viewMode: 'category' | 'timer';
}

const TreemapNode: React.FC<TreemapNodeProps> = ({ 
  node, 
  index,
  isHovered,
  isSelected,
  onHover,
  onClick,
  viewMode 
}) => {
  const handleClick = () => {
    onClick(node);
  };

  const handleMouseEnter = () => {
    onHover(node);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  // Calculate display values
  const totalHours = (node.value / (1000 * 60 * 60)).toFixed(1);
  const avgSessionTime = node.sessions > 0 ? (node.value / node.sessions / (1000 * 60)).toFixed(0) : '0';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <motion.rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={node.color}
        stroke={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : 'rgba(255,255,255,0.2)'}
        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
        rx={4}
        whileHover={{ 
          scale: 1.02,
          filter: 'brightness(1.1)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Main label */}
      {node.width > 80 && node.height > 40 && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2 - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(14, Math.max(10, node.width / 8))}
          fill="white"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.02 }}
        >
          {node.name}
        </motion.text>
      )}
      
      {/* Time info */}
      {node.width > 100 && node.height > 60 && (
        <>
          <motion.text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2 + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(11, Math.max(8, node.width / 12))}
            fill="rgba(255,255,255,0.9)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.02 }}
          >
            {totalHours}h
          </motion.text>
          <motion.text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2 + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(9, Math.max(7, node.width / 14))}
            fill="rgba(255,255,255,0.8)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.02 }}
          >
            {node.sessions} sessions
          </motion.text>
        </>
      )}
      
      {/* Category badge for timer view */}
      {viewMode === 'timer' && node.category && node.width > 120 && node.height > 80 && (
        <motion.text
          x={node.x + 6}
          y={node.y + 16}
          fontSize={Math.min(8, node.width / 16)}
          fill="rgba(255,255,255,0.7)"
          fontWeight="medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.02 }}
        >
          {node.category}
        </motion.text>
      )}
    </motion.g>
  );
};

export default TreemapNode;

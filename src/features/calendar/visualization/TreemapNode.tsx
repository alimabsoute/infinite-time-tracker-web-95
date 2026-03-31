
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
        x={node.x + 1}
        y={node.y + 1}
        width={Math.max(0, node.width - 2)}
        height={Math.max(0, node.height - 2)}
        fill={node.color}
        stroke={isSelected ? 'hsl(217, 91%, 60%)' : isHovered ? 'hsl(213, 93%, 68%)' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
        rx={6}
        filter={isHovered ? 'url(#treemap-glow)' : undefined}
        whileHover={{ 
          filter: 'brightness(1.15) saturate(1.1)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Main label */}
      {node.width > 60 && node.height > 30 && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2 - (node.height > 60 ? 10 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(16, Math.max(9, Math.min(node.width / 6, node.height / 4)))}
          fill="white"
          fontWeight="600"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.02 }}
        >
          {node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name}
        </motion.text>
      )}
      
      {/* Time info */}
      {node.width > 80 && node.height > 50 && (
        <>
          <motion.text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2 + (node.height > 80 ? 12 : 8)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(13, Math.max(8, Math.min(node.width / 10, node.height / 6)))}
            fill="rgba(255,255,255,0.95)"
            fontWeight="500"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.3))"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.02 }}
          >
            {totalHours}h
          </motion.text>
          {node.height > 80 && (
            <motion.text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2 + 26}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={Math.min(10, Math.max(7, Math.min(node.width / 14, node.height / 8)))}
              fill="rgba(255,255,255,0.8)"
              filter="drop-shadow(0 1px 1px rgba(0,0,0,0.3))"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.02 }}
            >
              {node.sessions} session{node.sessions !== 1 ? 's' : ''}
            </motion.text>
          )}
        </>
      )}
      
      {/* Category badge for timer view */}
      {viewMode === 'timer' && node.category && node.width > 100 && node.height > 70 && (
        <motion.text
          x={node.x + 8}
          y={node.y + 18}
          fontSize={Math.min(9, Math.max(7, node.width / 18))}
          fill="rgba(255,255,255,0.75)"
          fontWeight="500"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.4))"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.02 }}
        >
          {node.category.length > 12 ? node.category.substring(0, 10) + '...' : node.category}
        </motion.text>
      )}
      
      {/* Small rectangles get minimal info */}
      {node.width <= 60 && node.height >= 20 && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(8, Math.max(6, Math.min(node.width / 8, node.height / 3)))}
          fill="rgba(255,255,255,0.9)"
          fontWeight="600"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.02 }}
        >
          {node.name.length > 8 ? node.name.substring(0, 6) + '..' : node.name}
        </motion.text>
      )}
    </motion.g>
  );
};

export default TreemapNode;

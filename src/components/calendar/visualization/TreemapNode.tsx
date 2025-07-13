
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
  const handleMouseEnter = () => {
    onHover(node);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  const handleClick = () => {
    onClick(node);
  };

  // Calculate text size based on rectangle size
  const textSize = Math.min(node.width, node.height) / 8;
  const fontSize = Math.max(10, Math.min(16, textSize));
  
  // Determine if text should be shown
  const shouldShowText = node.width > 60 && node.height > 30;
  const shouldShowValue = node.width > 100 && node.height > 50;

  // Animation variants
  const rectangleVariants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: index * 0.02,
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      opacity: 0.9,
      transition: {
        duration: 0.2
      }
    },
    selected: {
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.02 + 0.2,
        duration: 0.3
      }
    }
  };

  return (
    <motion.g
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={{
        hover: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {/* Main Rectangle */}
      <motion.rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={node.color}
        stroke={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--foreground))" : "hsl(var(--border))"}
        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
        rx={4}
        ry={4}
        className="cursor-pointer"
        variants={rectangleVariants}
        animate={isSelected ? "selected" : isHovered ? "hover" : "animate"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        filter={isSelected ? "url(#treemap-glow)" : undefined}
      />

      {/* Gradient Overlay for depth */}
      <motion.rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill="url(#treemap-gradient)"
        rx={4}
        ry={4}
        className="pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: index * 0.02 + 0.1 }}
      />

      {/* Text Label */}
      {shouldShowText && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2 - (shouldShowValue ? fontSize / 2 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fill="hsl(var(--foreground))"
          className="font-medium pointer-events-none select-none"
          variants={textVariants}
        >
          {node.name.length > 15 ? node.name.slice(0, 15) + '...' : node.name}
        </motion.text>
      )}

      {/* Value Text */}
      {shouldShowValue && (
        <motion.text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2 + fontSize / 2 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize * 0.8}
          fill="hsl(var(--muted-foreground))"
          className="pointer-events-none select-none"
          variants={textVariants}
        >
          {(node.value / (1000 * 60 * 60)).toFixed(1)}h
        </motion.text>
      )}

      {/* Session Count Badge */}
      {node.sessions > 1 && node.width > 80 && node.height > 40 && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 + 0.3 }}
        >
          <motion.rect
            x={node.x + node.width - 25}
            y={node.y + 5}
            width={20}
            height={16}
            fill="hsl(var(--primary))"
            rx={8}
            ry={8}
            className="pointer-events-none"
          />
          <motion.text
            x={node.x + node.width - 15}
            y={node.y + 13}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="hsl(var(--primary-foreground))"
            className="font-bold pointer-events-none select-none"
          >
            {node.sessions}
          </motion.text>
        </motion.g>
      )}

      {/* Additional gradient definitions */}
      <defs>
        <linearGradient id="treemap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 0.1 }} />
        </linearGradient>
      </defs>
    </motion.g>
  );
};

export default TreemapNode;

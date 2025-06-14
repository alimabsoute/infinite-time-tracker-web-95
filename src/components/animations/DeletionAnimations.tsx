
import React from 'react';
import { motion } from 'framer-motion';

interface DeletionAnimationProps {
  children: React.ReactNode;
  animationType: 'explode' | 'melt' | 'crumble' | 'vaporize';
  onComplete: () => void;
}

const DeletionAnimation: React.FC<DeletionAnimationProps> = ({ 
  children, 
  animationType, 
  onComplete 
}) => {
  const getAnimationVariants = () => {
    switch (animationType) {
      case 'explode':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: {
            scale: [1, 1.2, 0],
            opacity: [1, 0.8, 0],
            rotate: [0, Math.random() * 360],
          },
          transition: { duration: 0.6, ease: "easeOut" }
        };
      
      case 'melt':
        return {
          initial: { scaleY: 1, opacity: 1, transformOrigin: 'bottom' },
          animate: {
            scaleY: [1, 0.8, 0.3, 0],
            scaleX: [1, 1.1, 1.2, 0.8],
            opacity: [1, 0.9, 0.5, 0],
          },
          transition: { duration: 0.8, ease: "easeInOut" }
        };
      
      case 'crumble':
        return {
          initial: { scale: 1, opacity: 1 },
          animate: {
            scale: [1, 0.9, 0.7, 0.3, 0],
            opacity: [1, 0.8, 0.4, 0.1, 0],
            rotate: [0, -5, 5, -10, 0],
            y: [0, 0, 20, 40, 60],
          },
          transition: { duration: 0.7, ease: "easeIn" }
        };
      
      case 'vaporize':
        return {
          initial: { scale: 1, opacity: 1, filter: 'blur(0px)' },
          animate: {
            scale: [1, 1.1, 1.3, 0],
            opacity: [1, 0.7, 0.3, 0],
            filter: ['blur(0px)', 'blur(2px)', 'blur(8px)', 'blur(20px)'],
          },
          transition: { duration: 0.5, ease: "easeOut" }
        };
      
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 0 },
          transition: { duration: 0.3 }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={variants.transition}
      onAnimationComplete={onComplete}
      style={{ 
        position: 'relative',
        transformOrigin: animationType === 'melt' ? 'bottom' : 'center'
      }}
    >
      {children}
    </motion.div>
  );
};

export default DeletionAnimation;

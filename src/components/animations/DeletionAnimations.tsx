
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
  console.log('💥 Starting deletion animation:', animationType);

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'explode':
        return {
          initial: { scale: 1, opacity: 1, rotate: 0 },
          animate: {
            scale: [1, 1.3, 0],
            opacity: [1, 0.8, 0],
            rotate: [0, Math.random() * 360],
            y: [0, -20, 50],
          },
          transition: { duration: 0.8, ease: "easeOut" }
        };
      
      case 'melt':
        return {
          initial: { scaleY: 1, scaleX: 1, opacity: 1, transformOrigin: 'bottom' },
          animate: {
            scaleY: [1, 0.8, 0.3, 0],
            scaleX: [1, 1.1, 1.2, 0.8],
            opacity: [1, 0.9, 0.5, 0],
            y: [0, 5, 15, 25],
          },
          transition: { duration: 1.0, ease: "easeInOut" }
        };
      
      case 'crumble':
        return {
          initial: { scale: 1, opacity: 1, rotate: 0 },
          animate: {
            scale: [1, 0.9, 0.7, 0.3, 0],
            opacity: [1, 0.8, 0.4, 0.1, 0],
            rotate: [0, -5, 5, -10, 0],
            y: [0, 0, 20, 40, 60],
            x: [0, Math.random() * 10 - 5, Math.random() * 20 - 10],
          },
          transition: { duration: 0.9, ease: "easeIn" }
        };
      
      case 'vaporize':
        return {
          initial: { scale: 1, opacity: 1, filter: 'blur(0px)' },
          animate: {
            scale: [1, 1.1, 1.3, 0],
            opacity: [1, 0.7, 0.3, 0],
            filter: ['blur(0px)', 'blur(2px)', 'blur(8px)', 'blur(20px)'],
            y: [0, -10, -20, -30],
          },
          transition: { duration: 0.7, ease: "easeOut" }
        };
      
      default:
        return {
          initial: { opacity: 1, scale: 1 },
          animate: { opacity: 0, scale: 0.8 },
          transition: { duration: 0.5 }
        };
    }
  };

  const variants = getAnimationVariants();

  const handleAnimationComplete = () => {
    console.log('✅ Deletion animation completed:', animationType);
    onComplete();
  };

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={variants.transition}
      onAnimationComplete={handleAnimationComplete}
      style={{ 
        position: 'relative',
        transformOrigin: animationType === 'melt' ? 'bottom' : 'center',
        zIndex: 1000, // Ensure visibility during animation
      }}
    >
      {children}
    </motion.div>
  );
};

export default DeletionAnimation;


import React from 'react';
import { motion } from 'framer-motion';

interface CreationAnimationProps {
  children: React.ReactNode;
  animationType: 'sparkle' | 'bounce' | 'glow' | 'spiral' | 'rainbow';
  onComplete: () => void;
}

const CreationAnimation: React.FC<CreationAnimationProps> = ({ 
  children, 
  animationType, 
  onComplete 
}) => {
  console.log('✨ Starting creation animation:', animationType);

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'sparkle':
        return {
          initial: { scale: 0, opacity: 0, rotate: -180 },
          animate: {
            scale: [0, 1.2, 1],
            opacity: [0, 1, 1],
            rotate: [0, 360, 0],
          },
          transition: { 
            duration: 1.2, 
            ease: "easeOut",
            times: [0, 0.6, 1]
          }
        };
      
      case 'bounce':
        return {
          initial: { y: -50, scale: 0, opacity: 0 },
          animate: {
            y: [0, -20, 0, -10, 0],
            scale: [0, 1.1, 1, 1.05, 1],
            opacity: [0, 1, 1, 1, 1],
          },
          transition: { 
            duration: 1.0, 
            ease: "easeOut",
            times: [0, 0.3, 0.5, 0.7, 1]
          }
        };
      
      case 'glow':
        return {
          initial: { scale: 0.8, opacity: 0, filter: 'blur(10px)' },
          animate: {
            scale: [0.8, 1.1, 1],
            opacity: [0, 1, 1],
            filter: ['blur(10px)', 'blur(0px)', 'blur(0px)'],
          },
          transition: { 
            duration: 0.8, 
            ease: "easeOut",
            times: [0, 0.6, 1]
          }
        };
      
      case 'spiral':
        return {
          initial: { scale: 0, opacity: 0, rotate: 0 },
          animate: {
            scale: [0, 0.5, 1.1, 1],
            opacity: [0, 0.5, 1, 1],
            rotate: [0, 180, 360, 360],
          },
          transition: { 
            duration: 1.5, 
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1]
          }
        };
      
      case 'rainbow':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: {
            scale: [0, 1.2, 1],
            opacity: [0, 1, 1],
          },
          transition: { 
            duration: 1.0, 
            ease: "easeOut",
            times: [0, 0.7, 1]
          }
        };
      
      default:
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5 }
        };
    }
  };

  const variants = getAnimationVariants();

  const handleAnimationComplete = () => {
    console.log('✅ Creation animation completed:', animationType);
    onComplete();
  };

  const getRainbowStyle = () => {
    if (animationType === 'rainbow') {
      return {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
        backgroundSize: '300% 300%',
        animation: 'rainbow-shift 2s ease infinite',
        borderRadius: '12px',
        padding: '2px',
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={variants.transition}
      onAnimationComplete={handleAnimationComplete}
      style={{ 
        position: 'relative',
        zIndex: 1000,
        ...getRainbowStyle()
      }}
    >
      {animationType === 'rainbow' ? (
        <div style={{ 
          background: 'white', 
          borderRadius: '10px', 
          overflow: 'hidden' 
        }}>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};

export default CreationAnimation;

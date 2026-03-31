
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  size: number;
  opacity: number;
  gravity: number;
}

interface ConfettiAnimationProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const vibrantColors = [
  '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
];

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ x, y, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isAnimatingRef = useRef(false);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    
    if (isAnimatingRef.current) {
      return;
    }
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();

    // OPTIMIZED: Reduced from 150 to 50 particles for better performance
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 20, // Slightly reduced spread
        vy: Math.random() * -18 - 6, // Reduced initial velocity
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
        shape: ['circle', 'square', 'triangle', 'star', 'heart'][Math.floor(Math.random() * 5)] as any,
        size: Math.random() * 16 + 8, // Slightly smaller size range (8-24px)
        opacity: 1,
        gravity: 0.3 + Math.random() * 0.3, // Consistent gravity range
      });
    }
    setPieces(newPieces);

    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      // OPTIMIZED: Reduced duration from 6s to 3s
      if (elapsed > 3000) {
        cleanup();
        return;
      }

      setPieces(currentPieces => 
        currentPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + piece.gravity,
          rotation: piece.rotation + piece.rotationSpeed,
          opacity: Math.max(0, piece.opacity - 0.005), // Faster fade for shorter duration
        })).filter(piece => piece.opacity > 0 && piece.y < window.innerHeight + 50) // Smaller boundary
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const cleanup = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      isAnimatingRef.current = false;
      setPieces([]);
      onComplete();
    };

    animationRef.current = requestAnimationFrame(animate);
    timeoutRef.current = setTimeout(cleanup, 3500); // Cleanup after 3.5s

    return cleanup;
  }, [x, y, onComplete]);

  const renderShape = (piece: ConfettiPiece) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: piece.x,
      top: piece.y,
      width: piece.size,
      height: piece.size,
      opacity: piece.opacity,
      transform: `rotate(${piece.rotation}deg)`,
      pointerEvents: 'none' as const,
      zIndex: 10000,
      // OPTIMIZED: Removed heavy drop-shadow filter for better performance
    };

    switch (piece.shape) {
      case 'circle':
        return (
          <div key={piece.id} style={{ 
            ...baseStyle, 
            backgroundColor: piece.color,
            borderRadius: '50%',
            // OPTIMIZED: Removed glow effect for performance
          }} />
        );
      case 'square':
        return (
          <div key={piece.id} style={{ 
            ...baseStyle, 
            backgroundColor: piece.color,
            // OPTIMIZED: Removed glow effect for performance
          }} />
        );
      case 'triangle':
        return (
          <div
            key={piece.id}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
              width: 0,
              height: 0,
            }}
          />
        );
      case 'star':
        return (
          <div
            key={piece.id}
            style={{
              ...baseStyle,
              background: piece.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }}
          />
        );
      case 'heart':
        return (
          <div
            key={piece.id}
            style={{
              ...baseStyle,
              background: piece.color,
              clipPath: 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")',
              transform: `${baseStyle.transform} scale(0.8)`,
            }}
          />
        );
      default:
        return null;
    }
  };

  if (pieces.length === 0) {
    return null;
  }

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 10000,
      overflow: 'hidden',
    }}>
      {pieces.map(renderShape)}
    </div>,
    document.body
  );
};

export default ConfettiAnimation;

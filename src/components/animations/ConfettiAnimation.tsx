
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
  shape: 'circle' | 'square' | 'triangle';
  size: number;
}

interface ConfettiAnimationProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ x, y, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isAnimatingRef = useRef(false);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Prevent multiple animations from starting
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();

    // Create confetti pieces
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 30; i++) {
      newPieces.push({
        id: i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -8 - 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
        size: Math.random() * 8 + 4,
      });
    }
    setPieces(newPieces);

    // Animate confetti with performance optimization
    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      // Stop animation after 2.5 seconds
      if (elapsed > 2500) {
        cleanup();
        return;
      }

      setPieces(currentPieces => 
        currentPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.3, // gravity
          rotation: piece.rotation + piece.rotationSpeed,
        }))
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
      onComplete();
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup after timeout as fallback
    timeoutRef.current = setTimeout(cleanup, 3000);

    return cleanup;
  }, []); // Remove x, y, onComplete from dependencies to prevent re-runs

  const renderShape = (piece: ConfettiPiece) => {
    const style = {
      position: 'absolute' as const,
      left: piece.x,
      top: piece.y,
      width: piece.size,
      height: piece.size,
      backgroundColor: piece.color,
      transform: `rotate(${piece.rotation}deg)`,
      pointerEvents: 'none' as const,
    };

    switch (piece.shape) {
      case 'circle':
        return <div key={piece.id} style={{ ...style, borderRadius: '50%' }} />;
      case 'square':
        return <div key={piece.id} style={style} />;
      case 'triangle':
        return (
          <div
            key={piece.id}
            style={{
              ...style,
              backgroundColor: 'transparent',
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
              width: 0,
              height: 0,
            }}
          />
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {pieces.map(renderShape)}
    </div>,
    document.body
  );
};

export default ConfettiAnimation;

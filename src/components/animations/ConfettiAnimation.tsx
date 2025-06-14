
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
    console.log('🎉 Confetti animation starting at:', { x, y });
    
    // Prevent multiple animations from starting
    if (isAnimatingRef.current) {
      console.log('⚠️ Animation already running, skipping');
      return;
    }
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();

    // Create confetti pieces
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 40; i++) { // Increased from 30 to 40 for more visibility
      newPieces.push({
        id: i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 12, // Increased spread
        vy: Math.random() * -12 - 4, // Increased initial velocity
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
        size: Math.random() * 10 + 6, // Increased size range
      });
    }
    setPieces(newPieces);
    console.log('✨ Created', newPieces.length, 'confetti pieces');

    // Animate confetti with performance optimization
    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      // Stop animation after 3 seconds (increased duration)
      if (elapsed > 3000) {
        console.log('⏰ Animation timeout reached');
        cleanup();
        return;
      }

      setPieces(currentPieces => 
        currentPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.4, // Slightly increased gravity
          rotation: piece.rotation + piece.rotationSpeed,
        }))
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const cleanup = () => {
      console.log('🧹 Cleaning up confetti animation');
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

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup after timeout as fallback
    timeoutRef.current = setTimeout(cleanup, 3500);

    return cleanup;
  }, [x, y, onComplete]);

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
      zIndex: 10000, // Ensure it's above everything
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
      zIndex: 10000, // Very high z-index
      overflow: 'hidden',
    }}>
      {pieces.map(renderShape)}
    </div>,
    document.body
  );
};

export default ConfettiAnimation;

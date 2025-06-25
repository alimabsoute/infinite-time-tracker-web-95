
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
}

interface CelebrationAnimationsProps {
  type: 'fireworks' | 'sparkles';
  onComplete: () => void;
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB'];

const CelebrationAnimations: React.FC<CelebrationAnimationsProps> = ({ type, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isAnimatingRef = useRef(false);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    console.log('🎆 Starting celebration animation:', type);
    
    if (isAnimatingRef.current) {
      console.log('⚠️ Animation already running, skipping');
      return;
    }
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();

    // Create particles based on animation type
    const newParticles: Particle[] = [];
    
    if (type === 'fireworks') {
      // Create multiple firework bursts at different positions
      const burstPositions = [
        { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.8, y: window.innerHeight * 0.4 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
      ];

      burstPositions.forEach((pos, burstIndex) => {
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          const speed = Math.random() * 8 + 4;
          newParticles.push({
            id: burstIndex * 20 + i,
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 4,
            opacity: 1,
            life: 1,
          });
        }
      });
    } else if (type === 'sparkles') {
      // Create sparkles that appear randomly across the screen
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 6,
          opacity: 1,
          life: 1,
        });
      }
    }

    setParticles(newParticles);
    console.log('✨ Created', newParticles.length, 'celebration particles');

    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      if (elapsed > 2500) {
        console.log('⏰ Celebration animation timeout reached');
        cleanup();
        return;
      }

      setParticles(currentParticles => 
        currentParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + (type === 'fireworks' ? 0.3 : 0.1), // Gravity effect for fireworks
          rotation: particle.rotation + particle.rotationSpeed,
          opacity: particle.opacity - 0.008, // Fade out over time
          life: particle.life - 0.008,
        })).filter(particle => particle.opacity > 0)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const cleanup = () => {
      console.log('🧹 Cleaning up celebration animation');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      isAnimatingRef.current = false;
      setParticles([]);
      onComplete();
    };

    animationRef.current = requestAnimationFrame(animate);
    timeoutRef.current = setTimeout(cleanup, 3000);

    return cleanup;
  }, [type, onComplete]);

  const renderParticle = (particle: Particle) => {
    if (type === 'fireworks') {
      // Render firework particles as circles with glow
      return (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            pointerEvents: 'none',
            zIndex: 10000,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      );
    } else {
      // Render sparkles as star shapes
      return (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: particle.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          />
        </div>
      );
    }
  };

  if (particles.length === 0) {
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
      {particles.map(renderParticle)}
    </div>,
    document.body
  );
};

export default CelebrationAnimations;


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
  trail?: Array<{ x: number; y: number; opacity: number }>;
  type?: 'balloon' | 'animal' | 'firework' | 'sparkle';
  animalType?: 'bear' | 'cat' | 'dog' | 'rabbit';
  bounceHeight?: number;
  floatSpeed?: number;
}

interface CelebrationAnimationsProps {
  type: 'fireworks' | 'sparkles' | 'balloons' | 'animals';
  onComplete: () => void;
}

const vibrantColors = ['#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'];

const CelebrationAnimations: React.FC<CelebrationAnimationsProps> = ({ type, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
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

    const newParticles: Particle[] = [];
    
    if (type === 'fireworks') {
      // OPTIMIZED: Reduced burst positions from 5 to 3 and particles per burst from 35 to 20
      const burstPositions = [
        { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.8, y: window.innerHeight * 0.35 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
      ];

      burstPositions.forEach((pos, burstIndex) => {
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          const speed = Math.random() * 10 + 5; // Slightly reduced speed
          newParticles.push({
            id: burstIndex * 20 + i,
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
            size: Math.random() * 6 + 4, // Smaller particles (4-10px)
            opacity: 1,
            life: 1,
            trail: [], // OPTIMIZED: Simplified trail system
            type: 'firework',
          });
        }
      });
    } else if (type === 'sparkles') {
      // OPTIMIZED: Reduced from 60 to 25 sparkles
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 4, // Reduced velocity
          vy: (Math.random() - 0.5) * 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 8 + 6, // Smaller sparkles (6-14px)
          opacity: 1,
          life: 1,
          type: 'sparkle',
        });
      }
    } else if (type === 'balloons') {
      // OPTIMIZED: Reduced from 15 to 8 balloons
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          vx: (Math.random() - 0.5) * 1.5, // Reduced horizontal movement
          vy: -Math.random() * 2.5 - 1.5, // Reduced float speed
          rotation: Math.random() * 15 - 7.5, // Reduced sway
          rotationSpeed: (Math.random() - 0.5) * 1.5,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 20 + 20, // Smaller balloons (20-40px)
          opacity: 1,
          life: 1,
          type: 'balloon',
          floatSpeed: Math.random() * 1.5 + 0.8,
        });
      }
    } else if (type === 'animals') {
      // OPTIMIZED: Reduced from 8 to 5 animals
      const animalTypes: Array<'bear' | 'cat' | 'dog' | 'rabbit'> = ['bear', 'cat', 'dog', 'rabbit'];
      for (let i = 0; i < 5; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * (window.innerWidth - 80) + 40,
          y: window.innerHeight * 0.7 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 3, // Reduced movement
          vy: -Math.random() * 6 - 3, // Reduced bounce
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 15 + 25, // Smaller animals (25-40px)
          opacity: 1,
          life: 1,
          type: 'animal',
          animalType: animalTypes[Math.floor(Math.random() * animalTypes.length)],
          bounceHeight: Math.random() * 150 + 80,
        });
      }
    }

    setParticles(newParticles);

    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      // OPTIMIZED: Reduced duration from 4s to 2.5s
      if (elapsed > 2500) {
        cleanup();
        return;
      }

      setParticles(currentParticles => 
        currentParticles.map(particle => {
          let newParticle = { ...particle };
          
          if (particle.type === 'firework') {
            // OPTIMIZED: Simplified trail system for better performance
            if (newParticle.trail && newParticle.trail.length > 0) {
              newParticle.trail = newParticle.trail.slice(-4); // Keep only last 4 trail points
              newParticle.trail = newParticle.trail.map((t, index) => ({
                ...t,
                opacity: t.opacity * 0.7 // Faster trail fade
              }));
            }
            
            newParticle.x += particle.vx;
            newParticle.y += particle.vy;
            newParticle.vy += 0.35; // Slightly reduced gravity
            newParticle.opacity -= 0.008; // Faster fade
          } else if (particle.type === 'balloon') {
            newParticle.x += particle.vx;
            newParticle.y += particle.vy * (particle.floatSpeed || 1);
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity = particle.y < -80 ? 0 : particle.opacity; // Earlier fade boundary
          } else if (particle.type === 'animal') {
            newParticle.x += particle.vx * 0.4; // Reduced movement
            newParticle.y += particle.vy;
            newParticle.vy += 0.5; // Reduced gravity
            
            // Simplified bounce logic
            if (newParticle.y > window.innerHeight * 0.7 && newParticle.vy > 0) {
              newParticle.vy = -Math.abs(newParticle.vy) * 0.6; // Reduced bounce energy
              newParticle.y = window.innerHeight * 0.7;
            }
            
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity -= 0.005; // Faster fade
          } else {
            // Default sparkle behavior - optimized
            newParticle.x += particle.vx;
            newParticle.y += particle.vy;
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity -= 0.007; // Faster fade
          }
          
          newParticle.life -= 0.008; // Faster life decay
          return newParticle;
        }).filter(particle => particle.opacity > 0 && particle.life > 0)
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
      setParticles([]);
      onComplete();
    };

    animationRef.current = requestAnimationFrame(animate);
    timeoutRef.current = setTimeout(cleanup, 3000); // Cleanup after 3s

    return cleanup;
  }, [type, onComplete]);

  const renderParticle = (particle: Particle) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none' as const,
      zIndex: 10000,
    };

    if (particle.type === 'firework') {
      return (
        <div key={particle.id}>
          {/* OPTIMIZED: Simplified trail rendering */}
          {particle.trail?.slice(-3).map((trailPoint, index) => (
            <div
              key={`${particle.id}-trail-${index}`}
              style={{
                position: 'absolute',
                left: trailPoint.x,
                top: trailPoint.y,
                width: particle.size * 0.5,
                height: particle.size * 0.5,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: trailPoint.opacity,
                pointerEvents: 'none',
                zIndex: 9999,
                // OPTIMIZED: Removed heavy box-shadow for performance
              }}
            />
          ))}
          {/* Main particle */}
          <div
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              borderRadius: '50%',
              // OPTIMIZED: Removed glow effect for performance
            }}
          />
        </div>
      );
    } else if (particle.type === 'balloon') {
      return (
        <div key={particle.id}>
          {/* Balloon */}
          <div
            style={{
              ...baseStyle,
              background: `radial-gradient(circle at 30% 30%, ${particle.color}, ${particle.color}dd)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              // OPTIMIZED: Removed heavy filter for performance
            }}
          />
          {/* String */}
          <div
            style={{
              position: 'absolute',
              left: particle.x + particle.size / 2,
              top: particle.y + particle.size,
              width: 1,
              height: 20, // Shorter string
              backgroundColor: '#666',
              opacity: particle.opacity,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        </div>
      );
    } else if (particle.type === 'animal') {
      // Simplified animal shapes using CSS
      const animalShapes = {
        bear: '🧸',
        cat: '🐱',
        dog: '🐶',
        rabbit: '🐰'
      };
      
      return (
        <div
          key={particle.id}
          style={{
            ...baseStyle,
            fontSize: particle.size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // OPTIMIZED: Removed heavy filter for performance
          }}
        >
          {animalShapes[particle.animalType || 'bear']}
        </div>
      );
    } else {
      // Sparkles - optimized
      return (
        <div
          key={particle.id}
          style={{
            ...baseStyle,
            background: particle.color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            // OPTIMIZED: Removed heavy filter for performance
          }}
        />
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


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
    console.log('🎆 Starting enhanced celebration animation:', type);
    
    if (isAnimatingRef.current) {
      console.log('⚠️ Animation already running, skipping');
      return;
    }
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();

    const newParticles: Particle[] = [];
    
    if (type === 'fireworks') {
      // Enhanced fireworks with more burst positions and particles
      const burstPositions = [
        { x: window.innerWidth * 0.15, y: window.innerHeight * 0.25 },
        { x: window.innerWidth * 0.85, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.15 },
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.4 },
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.35 },
      ];

      burstPositions.forEach((pos, burstIndex) => {
        for (let i = 0; i < 35; i++) { // Increased from 20 to 35 particles per burst
          const angle = (Math.PI * 2 * i) / 35;
          const speed = Math.random() * 12 + 6; // Increased speed
          newParticles.push({
            id: burstIndex * 35 + i,
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
            size: Math.random() * 8 + 6, // Larger particles
            opacity: 1,
            life: 1,
            trail: [], // Initialize trail for fireworks
            type: 'firework',
          });
        }
      });
    } else if (type === 'sparkles') {
      // Enhanced sparkles
      for (let i = 0; i < 60; i++) { // Increased count
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 12 + 8, // Larger sparkles
          opacity: 1,
          life: 1,
          type: 'sparkle',
        });
      }
    } else if (type === 'balloons') {
      // New balloon animation
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 2, // Float upward
          rotation: Math.random() * 20 - 10, // Slight sway
          rotationSpeed: (Math.random() - 0.5) * 2,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 30 + 25, // Large balloons
          opacity: 1,
          life: 1,
          type: 'balloon',
          floatSpeed: Math.random() * 2 + 1,
        });
      }
    } else if (type === 'animals') {
      // New stuffed animal animation
      const animalTypes: Array<'bear' | 'cat' | 'dog' | 'rabbit'> = ['bear', 'cat', 'dog', 'rabbit'];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: window.innerHeight * 0.7 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 8 - 4, // Initial bounce
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
          size: Math.random() * 20 + 30, // Large animals
          opacity: 1,
          life: 1,
          type: 'animal',
          animalType: animalTypes[Math.floor(Math.random() * animalTypes.length)],
          bounceHeight: Math.random() * 200 + 100,
        });
      }
    }

    setParticles(newParticles);
    console.log('✨ Created', newParticles.length, 'enhanced celebration particles');

    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || 0);
      
      // Extended duration to 4 seconds
      if (elapsed > 4000) {
        console.log('⏰ Enhanced celebration animation timeout reached');
        cleanup();
        return;
      }

      setParticles(currentParticles => 
        currentParticles.map(particle => {
          let newParticle = { ...particle };
          
          if (particle.type === 'firework') {
            // Add trail effect for fireworks
            if (newParticle.trail) {
              newParticle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
              if (newParticle.trail.length > 8) {
                newParticle.trail.shift();
              }
              // Fade trail
              newParticle.trail = newParticle.trail.map((t, index) => ({
                ...t,
                opacity: t.opacity * (index / newParticle.trail!.length) * 0.8
              }));
            }
            
            newParticle.x += particle.vx;
            newParticle.y += particle.vy;
            newParticle.vy += 0.4; // Gravity
            newParticle.opacity -= 0.006;
          } else if (particle.type === 'balloon') {
            newParticle.x += particle.vx;
            newParticle.y += particle.vy * (particle.floatSpeed || 1);
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity = particle.y < -100 ? 0 : particle.opacity;
          } else if (particle.type === 'animal') {
            newParticle.x += particle.vx * 0.5;
            newParticle.y += particle.vy;
            newParticle.vy += 0.6; // Gravity for bouncing
            
            // Bounce logic
            if (newParticle.y > window.innerHeight * 0.7 && newParticle.vy > 0) {
              newParticle.vy = -Math.abs(newParticle.vy) * 0.7; // Bounce with energy loss
              newParticle.y = window.innerHeight * 0.7;
            }
            
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity -= 0.003;
          } else {
            // Default sparkle behavior
            newParticle.x += particle.vx;
            newParticle.y += particle.vy;
            newParticle.rotation += particle.rotationSpeed;
            newParticle.opacity -= 0.005;
          }
          
          newParticle.life -= 0.005;
          return newParticle;
        }).filter(particle => particle.opacity > 0 && particle.life > 0)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const cleanup = () => {
      console.log('🧹 Cleaning up enhanced celebration animation');
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
    timeoutRef.current = setTimeout(cleanup, 4500);

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
          {/* Render trail */}
          {particle.trail?.map((trailPoint, index) => (
            <div
              key={`${particle.id}-trail-${index}`}
              style={{
                position: 'absolute',
                left: trailPoint.x,
                top: trailPoint.y,
                width: particle.size * 0.6,
                height: particle.size * 0.6,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: trailPoint.opacity,
                pointerEvents: 'none',
                zIndex: 9999,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              }}
            />
          ))}
          {/* Main particle */}
          <div
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
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
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            }}
          />
          {/* String */}
          <div
            style={{
              position: 'absolute',
              left: particle.x + particle.size / 2,
              top: particle.y + particle.size,
              width: 1,
              height: 30,
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
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {animalShapes[particle.animalType || 'bear']}
        </div>
      );
    } else {
      // Sparkles
      return (
        <div
          key={particle.id}
          style={{
            ...baseStyle,
            background: particle.color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
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

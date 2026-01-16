import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Explosion {
  id: number;
  x: number;
  y: number;
  color: string;
}

const sectionColors: Record<string, string> = {
  '': '#8b5cf6',
  'numbers': '#818cf8',
  'portfolio': '#06b6d4',
  'philosophy': '#10b981',
  'contact': '#ec4899',
};

// Generate subtle particles
const generateParticles = () => {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 12 + Math.random() * 10;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 0.03,
    };
  });
};

export default function ClickEffect() {
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles] = useState(generateParticles);

  const getCurrentSection = useCallback(() => {
    const sections = ['numbers', 'portfolio', 'philosophy', 'contact'];
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5) {
          return sections[i];
        }
      }
    }
    return '';
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't trigger on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select')) return;

      const section = getCurrentSection();
      const color = sectionColors[section] || sectionColors[''];

      const newExplosion: Explosion = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        color,
      };

      setExplosions(prev => [...prev, newExplosion]);

      // Clean up after animation
      setTimeout(() => {
        setExplosions(prev => prev.filter(exp => exp.id !== newExplosion.id));
      }, 600);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [getCurrentSection]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <AnimatePresence>
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className="absolute"
            style={{ left: explosion.x, top: explosion.y }}
          >
            {/* Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  backgroundColor: explosion.color,
                  width: particle.size,
                  height: particle.size,
                  left: -particle.size / 2,
                  top: -particle.size / 2,
                }}
                initial={{ x: 0, y: 0, opacity: 0.7, scale: 1 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  duration: 0.35,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
            {/* Center glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                backgroundColor: explosion.color,
              }}
              initial={{ width: 3, height: 3, x: -1.5, y: -1.5, opacity: 0.6 }}
              animate={{ width: 12, height: 12, x: -6, y: -6, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

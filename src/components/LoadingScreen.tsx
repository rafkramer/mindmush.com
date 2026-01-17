import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'loading' | 'exit'>('loading');
  const letters = 'MINDMUSH'.split('');

  useEffect(() => {
    // Show loading animation, then exit
    const timer = setTimeout(() => {
      setPhase('exit');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center"
        >
          {/* Gradient background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600/20 via-violet-600/10 to-transparent blur-3xl"
          />

          {/* Logo text */}
          <div className="relative flex">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white"
                style={{ display: 'inline-block' }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Underline animation */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[calc(50%-40px)] w-32 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent origin-center"
          />

          {/* Subtle pulse ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border border-purple-500/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

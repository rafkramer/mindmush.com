import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import HeroScene from './HeroScene';

const words = ['build', 'launch', 'scale', 'acquire', 'exit'];

function AnimatedWord({ word }: { word: string }) {
  const letters = useMemo(() => word.split(''), [word]);

  return (
    <motion.span
      initial="initial"
      animate="animate"
      exit="exit"
      className="inline-flex"
      style={{ perspective: '600px' }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{
            y: 45,
            opacity: 0,
            rotateX: -50,
            filter: 'blur(10px)',
            scale: 0.85,
          }}
          animate={{
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 120,
              damping: 18,
              mass: 0.6,
              delay: i * 0.04,
            },
          }}
          exit={{
            y: -35,
            opacity: 0,
            rotateX: 25,
            filter: 'blur(8px)',
            scale: 0.9,
            transition: {
              type: 'tween',
              duration: 0.3,
              ease: [0.5, 0, 0.9, 0.5],
              delay: i * 0.025,
            },
          }}
          className="inline-block bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center bottom',
            willChange: 'transform, opacity, filter',
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="snap-section px-6 overflow-visible">
      <div className="max-w-6xl mx-auto w-full overflow-visible">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center overflow-visible">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-5"
            >
              <span className="text-xs font-mono tracking-widest text-[#8b5cf6] uppercase">
                MINDMUSH
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight mb-7"
            >
              <span className="text-white">We </span>
              <span className="relative inline-block" style={{ minWidth: '4ch' }}>
                <AnimatePresence mode="wait">
                  <AnimatedWord key={words[currentIndex]} word={words[currentIndex]} />
                </AnimatePresence>
              </span>
              <br />
              <span className="text-white whitespace-nowrap">mobile apps.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base md:text-lg text-white/50 leading-relaxed"
            >
              Venture studio focused on building a profitable portfolio of consumer software. Based in Switzerland.
            </motion.p>
          </div>

          {/* Right: 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="hidden lg:flex justify-center items-center"
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

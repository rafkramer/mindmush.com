import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    >
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 150,
              damping: 20,
              delay: i * 0.03,
            },
          }}
          exit={{
            y: -15,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
              delay: i * 0.02,
            },
          }}
          className="inline-block bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent"
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="snap-section px-4 sm:px-6 overflow-visible">
      <div className="max-w-6xl mx-auto w-full overflow-visible">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 sm:gap-8 lg:gap-12 items-center overflow-visible">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-4 sm:mb-5"
            >
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#8b5cf6] uppercase">
                MINDMUSH
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[5rem] font-semibold leading-[1.1] sm:leading-[1.05] tracking-tight mb-5 sm:mb-7"
            >
              <span className="text-white">We </span>
              <span className="relative inline-block min-w-[3ch] sm:min-w-[4ch]">
                <AnimatePresence mode="wait">
                  <AnimatedWord key={words[currentIndex]} word={words[currentIndex]} />
                </AnimatePresence>
              </span>
              <br />
              <span className="text-white">mobile apps.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed sm:leading-[2] mt-4 sm:mt-8"
            >
              Venture studio focused on growing a profitable portfolio of
              <br className="hidden sm:block" />
              <span className="whitespace-nowrap">consumer software. Based in Switzerland. Operating internationally.</span>
            </motion.p>
          </div>

          {/* Right: 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="hidden lg:flex justify-center items-center overflow-visible"
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

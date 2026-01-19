import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['build', 'launch', 'scale', 'buy', 'sell'];

const wordWidths: Record<string, string> = {
  build: '2.75em',
  launch: '3.4em',
  scale: '2.65em',
  buy: '2.1em',
  sell: '2.05em',
};

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
          initial={{ y: 25, opacity: 0, filter: 'blur(4px)' }}
          animate={{
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 25,
              delay: i * 0.025,
            },
          }}
          exit={{
            y: -20,
            opacity: 0,
            filter: 'blur(4px)',
            transition: {
              duration: 0.15,
              ease: 'easeIn',
              delay: i * 0.015,
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
  const currentWord = words[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="snap-section relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Glow effect behind text */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="flex flex-col items-center text-center px-4 relative z-10">

          {/* MINDMUSH label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6"
          >
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#8b5cf6] uppercase">
              MINDMUSH
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] font-semibold leading-[1.05] tracking-tight"
          >
            <span className="inline-flex items-baseline">
              <span className="text-white">We&thinsp;</span>
              <span
                className="inline-block overflow-hidden text-left"
                style={{
                  width: wordWidths[currentWord],
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <AnimatePresence mode="wait">
                  <AnimatedWord key={currentWord} word={currentWord} />
                </AnimatePresence>
              </span>
            </span>
            <br />
            <span className="text-white">mobile apps.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-white/60 leading-relaxed mt-8 max-w-xl"
          >
            Venture studio that understands how to win in the app game.<br />Established in 2020. Based in Switzerland.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <a
              href="#portfolio"
              className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium rounded-full transition-colors duration-200"
            >
              Launches
            </a>
            <a
              href="#contact"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full border border-white/20 transition-colors duration-200"
            >
              Partners
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/40"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/20 -mt-3"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

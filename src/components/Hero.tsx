import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from './HeroScene';

const words = ['acquire', 'build', 'launch', 'scale', 'exit'];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section px-6">
      <div className="max-w-7xl mx-auto w-full overflow-visible">
        <div className="grid lg:grid-cols-2 gap-8 items-center overflow-visible">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <span className="text-xs font-mono tracking-widest text-[#8b5cf6] uppercase">
                Venture Studio
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-8"
            >
              <span className="text-white">We </span>
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[currentIndex]}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent"
                  >
                    {words[currentIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              <span className="text-white">mobile apps.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base md:text-lg text-[#888] max-w-lg leading-relaxed mb-12"
            >
              Swiss venture studio focused on building a profitable portfolio of consumer software. We partner with exceptional founders and operators to create products that scale.
            </motion.p>

          </div>

          {/* Right: Planet Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block overflow-visible"
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

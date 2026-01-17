import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function LiveCounter({ baseValue }: { baseValue: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  // Count up animation
  useEffect(() => {
    if (!inView || isComplete) return;

    let startTime: number;
    let animationId: number;

    const animateIn = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / 2500, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(eased * baseValue));

      if (progress < 1) {
        animationId = requestAnimationFrame(animateIn);
      } else {
        setIsComplete(true);
      }
    };

    animationId = requestAnimationFrame(animateIn);
    return () => cancelAnimationFrame(animationId);
  }, [inView, baseValue, isComplete]);

  // Continuous increment after complete - +1 every 0.5-2 seconds
  useEffect(() => {
    if (!isComplete) return;

    const tick = () => {
      setDisplayValue(prev => prev + 1);
      const nextDelay = 500 + Math.random() * 1500;
      timeoutId = setTimeout(tick, nextDelay);
    };

    let timeoutId = setTimeout(tick, 500 + Math.random() * 1500);
    return () => clearTimeout(timeoutId);
  }, [isComplete]);

  return (
    <span ref={ref} className="text-[#a5b4fc] tabular-nums">
      {displayValue.toLocaleString()}
    </span>
  );
}

export default function ImpactStats() {
  return (
    <section id="numbers" className="snap-section px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-base sm:text-xl md:text-2xl text-white mb-4 sm:mb-6">
            50+ apps launched with
          </p>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-semibold tracking-tight mb-4 sm:mb-6">
            <LiveCounter baseValue={10847293} />
          </h2>

          <p className="text-base sm:text-xl md:text-2xl text-white">
            downloads and counting
          </p>
        </motion.div>
      </div>
    </section>
  );
}

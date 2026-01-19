import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function LiveCounter({ baseValue }: { baseValue: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  // Smooth count up with throttled updates
  useEffect(() => {
    if (!inView || isComplete) return;

    const duration = 4000;
    const startTime = performance.now();
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

    let lastUpdate = 0;
    const updateInterval = 50; // Only update every 50ms for smoother look

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Only update display at intervals
      if (currentTime - lastUpdate >= updateInterval) {
        const eased = easeOutQuint(progress);
        setDisplayValue(Math.round(eased * baseValue));
        lastUpdate = currentTime;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(baseValue);
        setIsComplete(true);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, baseValue, isComplete]);

  // Continuous increment after complete
  useEffect(() => {
    if (!isComplete) return;

    const tick = () => {
      setDisplayValue(prev => prev + 1);
      timeoutId = setTimeout(tick, 3000 + Math.random() * 2000);
    };

    let timeoutId = setTimeout(tick, 3000 + Math.random() * 2000);
    return () => clearTimeout(timeoutId);
  }, [isComplete]);

  return (
    <span ref={ref} className="text-[#a78bfa] tabular-nums font-medium">
      {displayValue.toLocaleString()}
    </span>
  );
}

export default function ImpactStats() {
  return (
    <section id="numbers" className="snap-section px-4 sm:px-6 relative overflow-hidden">
      {/* Purple nebula glow - same vibe as hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
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

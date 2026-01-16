import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function LiveCounter({ baseValue }: { baseValue: number }) {
  const [displayValue, setDisplayValue] = useState(baseValue);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView) return;

    // Initial count-up animation
    if (!hasAnimated.current) {
      let startTime: number;
      let animationId: number;

      const animateIn = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 3000, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(eased * baseValue));

        if (progress < 1) {
          animationId = requestAnimationFrame(animateIn);
        } else {
          hasAnimated.current = true;
        }
      };

      animationId = requestAnimationFrame(animateIn);
      return () => cancelAnimationFrame(animationId);
    }

    // Continuous slow increment after initial animation
    const interval = setInterval(() => {
      setDisplayValue(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 800 + Math.random() * 400);

    return () => clearInterval(interval);
  }, [inView, baseValue]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

export default function ImpactStats() {
  return (
    <section className="section section-dark px-6">
      <div className="max-w-5xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lg md:text-xl text-white/40 mb-4">
            50+ apps launched with
          </p>

          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-white mb-4">
            <LiveCounter baseValue={10847293} />
          </h2>

          <p className="text-lg md:text-xl text-white/40">
            downloads and counting
          </p>
        </motion.div>
      </div>
    </section>
  );
}

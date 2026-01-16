import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export default function Philosophy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-25%' });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (inView) {
      // Step 1: Pieces fly in and assemble
      setTimeout(() => setStep(1), 100);
      // Step 2: Puzzle shrinks
      setTimeout(() => setStep(2), 2000);
      // Step 3: Text appears
      setTimeout(() => setStep(3), 2800);
    }
  }, [inView]);

  // Dimensions
  const W = 140;
  const H = 100;
  const T = 25;

  // TAB: cubic bezier bulging RIGHT from the right edge
  const drawTab = (atX: number) => `
    C ${atX + T*0.4} ${H/2 - T*0.8}, ${atX + T} ${H/2 - T*0.5}, ${atX + T} ${H/2}
    C ${atX + T} ${H/2 + T*0.5}, ${atX + T*0.4} ${H/2 + T*0.8}, ${atX} ${H/2 + T}
  `;

  // HOLE: cubic bezier curving INTO piece from left edge
  const drawHole = () => `
    C ${T*0.4} ${H/2 + T*0.8}, ${T} ${H/2 + T*0.5}, ${T} ${H/2}
    C ${T} ${H/2 - T*0.5}, ${T*0.4} ${H/2 - T*0.8}, 0 ${H/2 - T}
  `;

  // Piece paths
  const piece1 = `M 0 0 L ${W} 0 L ${W} ${H/2 - T} ${drawTab(W)} L ${W} ${H} L 0 ${H} Z`;
  const piece2 = `M 0 0 L ${W} 0 L ${W} ${H/2 - T} ${drawTab(W)} L ${W} ${H} L 0 ${H} L 0 ${H/2 + T} ${drawHole()} L 0 0 Z`;
  const piece3 = `M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} L 0 ${H/2 + T} ${drawHole()} L 0 0 Z`;

  // Smooth easing
  const smoothEase = [0.25, 0.1, 0.25, 1];

  // Text labels
  const labels = ['Development', 'Distribution', 'Acquisitions'];

  return (
    <section id="philosophy" className="snap-section px-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-center h-full">
        <div ref={ref} className="relative flex items-center justify-center" style={{ height: '70vh' }}>

          {/* Subtle glow on complete */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              width: 500,
              height: 300,
            }}
            initial={{ opacity: 0 }}
            animate={step >= 2 ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: smoothEase }}
          />

          {/* SVG Container that scales down */}
          <motion.div
            initial={{ scale: 1.4 }}
            animate={step >= 2 ? { scale: 0.75 } : { scale: 1.4 }}
            transition={{
              duration: 1.0,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <svg
              width="550"
              height="200"
              viewBox="-50 -50 550 200"
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="puzzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="subtleGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Piece 1 - from left */}
              <motion.g
                initial={{ x: -300, y: 80, rotate: -15, opacity: 0 }}
                animate={step >= 1 ? {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1
                } : {}}
                transition={{
                  duration: 1.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0
                }}
              >
                <motion.path
                  d={piece1}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="url(#puzzleGrad)"
                  strokeWidth="2"
                  animate={step >= 2 ? { filter: "url(#subtleGlow)" } : {}}
                  transition={{ duration: 0.6 }}
                />
                <motion.text
                  x={W / 2}
                  y={H / 2 + 5}
                  textAnchor="middle"
                  fill="rgba(110, 231, 183, 0.9)"
                  fontSize="11"
                  fontWeight="500"
                  letterSpacing="0.05em"
                  initial={{ opacity: 0 }}
                  animate={step >= 1 ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {labels[0]}
                </motion.text>
              </motion.g>

              {/* Piece 2 - from bottom */}
              <motion.g
                initial={{ x: W, y: 250, rotate: 10, opacity: 0 }}
                animate={step >= 1 ? {
                  x: W,
                  y: 0,
                  rotate: 0,
                  opacity: 1
                } : {}}
                transition={{
                  duration: 1.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.2
                }}
              >
                <motion.path
                  d={piece2}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="url(#puzzleGrad)"
                  strokeWidth="2"
                  animate={step >= 2 ? { filter: "url(#subtleGlow)" } : {}}
                  transition={{ duration: 0.6 }}
                />
                <motion.text
                  x={W / 2}
                  y={H / 2 + 5}
                  textAnchor="middle"
                  fill="rgba(110, 231, 183, 0.9)"
                  fontSize="11"
                  fontWeight="500"
                  letterSpacing="0.05em"
                  initial={{ opacity: 0 }}
                  animate={step >= 1 ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  {labels[1]}
                </motion.text>
              </motion.g>

              {/* Piece 3 - from right */}
              <motion.g
                initial={{ x: W * 2 + 300, y: -80, rotate: 15, opacity: 0 }}
                animate={step >= 1 ? {
                  x: W * 2,
                  y: 0,
                  rotate: 0,
                  opacity: 1
                } : {}}
                transition={{
                  duration: 1.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.4
                }}
              >
                <motion.path
                  d={piece3}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="url(#puzzleGrad)"
                  strokeWidth="2"
                  animate={step >= 2 ? { filter: "url(#subtleGlow)" } : {}}
                  transition={{ duration: 0.6 }}
                />
                <motion.text
                  x={W / 2}
                  y={H / 2 + 5}
                  textAnchor="middle"
                  fill="rgba(110, 231, 183, 0.9)"
                  fontSize="11"
                  fontWeight="500"
                  letterSpacing="0.05em"
                  initial={{ opacity: 0 }}
                  animate={step >= 1 ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {labels[2]}
                </motion.text>
              </motion.g>
            </svg>
          </motion.div>
        </div>

        {/* Text - appears after shrink */}
        <motion.div
          className="text-center max-w-2xl -mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={step >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
            Partners <span className="text-emerald-400">compound.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50">
            The right connections turn good ideas into great exits.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

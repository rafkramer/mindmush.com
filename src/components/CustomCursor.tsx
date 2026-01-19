import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

// Purple for hero/numbers, then colors shift for other sections
const sectionColors: Record<string, string> = {
  default: '#8b5cf6',    // purple (hero)
  numbers: '#8b5cf6',    // purple (same as hero)
  portfolio: '#06b6d4',  // cyan
  partners: '#10b981',   // emerald
  contact: '#ec4899',    // pink
};

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [currentSection, setCurrentSection] = useState('default');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], input, textarea, select');
      setIsHovering(!!isClickable);
    };

    const checkSection = () => {
      const sections = ['numbers', 'portfolio', 'partners', 'contact'];
      let found = 'default';

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
            found = sectionId;
            break;
          }
        }
      }

      setCurrentSection(found);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', checkSection, { passive: true });
    checkSection();

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', checkSection);
    };
  }, [cursorX, cursorY]);

  const color = sectionColors[currentSection] || sectionColors.default;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[10000]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        animate={{
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 0.8 : 0.6,
        }}
        transition={{ duration: 0.15 }}
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'Home', color: '#8b5cf6' },
  { id: 'numbers', label: 'Numbers', color: '#818cf8' },
  { id: 'portfolio', label: 'Portfolio', color: '#06b6d4' },
  { id: 'philosophy', label: 'Partners', color: '#10b981' },
  { id: 'contact', label: 'Contact', color: '#ec4899' },
];

// Generate star burst particles
const generateStars = () => {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      id: i,
      x: Math.cos(angle) * 30,
      y: Math.sin(angle) * 30,
    };
  });
};

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [stars] = useState(generateStars);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Check if at top of page
      if (scrollY < 100) {
        setActiveSection('home');
        return;
      }

      const sections = navItems.slice(1).map(item => ({
        id: item.id,
        el: document.getElementById(item.id)
      })).filter(s => s.el);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5) {
            setActiveSection(section.id);
            return;
          }
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update indicator position when active section changes
  useEffect(() => {
    const activeEl = itemRefs.current.get(activeSection);
    if (activeEl && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left - 8,
        width: itemRect.width + 16,
      });
    }
  }, [activeSection]);

  const handleClick = (id: string) => {
    setClickedItem(id);
    setTimeout(() => setClickedItem(null), 500);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center">
      <div
        ref={navRef}
        className="relative flex items-center px-2 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]"
      >
        {/* Apple glass indicator */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />

        {navItems.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <a
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
              }}
              href={item.id === 'home' ? '#' : `#${item.id}`}
              onClick={(e) => {
                if (item.id === 'home') {
                  e.preventDefault();
                }
                handleClick(item.id);
              }}
              className="relative px-3 py-1.5"
            >
              {/* Star burst explosion */}
              <AnimatePresence>
                {clickedItem === item.id && (
                  <>
                    {stars.map((star) => (
                      <motion.span
                        key={star.id}
                        className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{
                          x: star.x,
                          y: star.y,
                          scale: 0,
                          opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    ))}
                    {/* Center flash */}
                    <motion.span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </>
                )}
              </AnimatePresence>
              <motion.span
                className={`relative z-10 text-xs font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
                animate={{
                  scale: clickedItem === item.id ? [1, 0.95, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.25 }}
              >
                {item.label}
              </motion.span>
            </a>
            {index < navItems.length - 1 && (
              <span className="w-[3px] h-[3px] rounded-full bg-white/[0.15]" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

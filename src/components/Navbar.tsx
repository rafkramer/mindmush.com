import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'MINDMUSH', color: '#8b5cf6' },
  { id: 'numbers', label: 'Numbers', color: '#818cf8' },
  { id: 'portfolio', label: 'Portfolio', color: '#06b6d4' },
  { id: 'partners', label: 'Partners', color: '#10b981' },
  { id: 'contact', label: 'Contact', color: '#ec4899' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

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

  const handleClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center">
      <div className="flex items-center p-1 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08]">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.id === 'home' ? '#' : `#${item.id}`}
            onClick={(e) => {
              if (item.id === 'home') {
                e.preventDefault();
              }
              handleClick(item.id);
            }}
            className="relative px-5 py-2"
          >
            {/* Background indicator */}
            {activeSection === item.id && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute inset-0 rounded-full bg-white/[0.1]"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
            <span
              className={`relative z-10 text-[12px] font-medium transition-colors duration-200 ${
                activeSection === item.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'numbers', label: 'Numbers', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'portfolio', label: 'Portfolio', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'partners', label: 'Partners', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Nav */}
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
                {item.id === 'home' ? 'MINDMUSH' : item.label}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile Nav - Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around p-2 rounded-2xl bg-[#111113]/90 backdrop-blur-2xl border border-white/[0.08]">
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
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  activeSection === item.id
                    ? 'bg-white/[0.08]'
                    : ''
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    activeSection === item.id ? 'text-[#8b5cf6]' : 'text-white/40'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/40'
                  }`}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

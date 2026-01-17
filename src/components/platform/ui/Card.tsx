import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  glow?: 'purple' | 'blue' | 'green' | 'orange' | null;
}

export function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  glow = null,
}: CardProps) {
  const baseStyles = 'bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm relative overflow-hidden';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const glowColors = {
    purple: 'from-purple-500/10',
    blue: 'from-blue-500/10',
    green: 'from-green-500/10',
    orange: 'from-orange-500/10',
  };

  const content = (
    <>
      {glow && (
        <div className={`absolute inset-0 bg-gradient-to-br ${glowColors[glow]} to-transparent opacity-50 pointer-events-none`} />
      )}
      <div className="relative">{children}</div>
    </>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className={`${baseStyles} ${paddingStyles[padding]} ${className} hover:border-white/[0.12] hover:bg-white/[0.03] transition-colors duration-200`}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${className}`} onClick={onClick}>
      {content}
    </div>
  );
}

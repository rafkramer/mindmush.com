import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconColor?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
  positive?: boolean | null;
  delay?: number;
  trend?: 'up' | 'down' | null;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = 'purple',
  positive = null,
  delay = 0,
  trend = null,
  onClick,
  active = true,
}: StatCardProps) {
  const iconColors = {
    purple: 'bg-purple-500/10 text-purple-400 shadow-purple-500/5',
    blue: 'bg-blue-500/10 text-blue-400 shadow-blue-500/5',
    green: 'bg-green-500/10 text-green-400 shadow-green-500/5',
    red: 'bg-red-500/10 text-red-400 shadow-red-500/5',
    orange: 'bg-orange-500/10 text-orange-400 shadow-orange-500/5',
  };

  const valueColor = positive === null
    ? 'text-white'
    : positive
      ? 'text-green-400'
      : 'text-red-400';

  const borderColors = {
    purple: 'border-purple-500/50',
    blue: 'border-blue-500/50',
    green: 'border-green-500/50',
    red: 'border-red-500/50',
    orange: 'border-orange-500/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      } ${
        active
          ? `${borderColors[iconColor]} border-2`
          : 'border-white/[0.06] opacity-50'
      }`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center gap-2 sm:gap-4">
        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${iconColors[iconColor]}`}>
          <div className="scale-75 sm:scale-100">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{label}</div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-base sm:text-2xl font-semibold tracking-tight ${valueColor}`} style={{ fontFamily: 'Space Grotesk, monospace' }}>
              {value}
            </span>
            {trend && (
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import type { VentureState, VentureType } from '../../../utils/platform/constants';
import { STATE_COLORS, TYPE_COLORS } from '../../../utils/platform/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.05] text-white/70',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-amber-500/10 text-amber-400',
    danger: 'bg-red-500/10 text-red-400',
    info: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface StateBadgeProps {
  state: VentureState;
  className?: string;
}

export function StateBadge({ state, className = '' }: StateBadgeProps) {
  const colors = STATE_COLORS[state];
  const label = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

interface TypeBadgeProps {
  type: VentureType;
  className?: string;
}

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type];
  const label = type === 'game' ? 'Game' : 'App';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

interface RoleBadgeProps {
  role: 'admin' | 'partner';
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const styles = role === 'admin'
    ? 'bg-purple-500/10 text-purple-400'
    : 'bg-blue-500/10 text-blue-400';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${styles} ${className}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

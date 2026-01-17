export const STORAGE_KEYS = {
  users: 'mindmush_users',
  ventures: 'mindmush_ventures',
  studioExpenses: 'mindmush_studio_expenses',
  settings: 'mindmush_settings',
  payouts: 'mindmush_payouts',
  currentUser: 'mindmush_current_user',
} as const;

export const VENTURE_STATES = ['building', 'live', 'scaling', 'passive', 'killed'] as const;
export type VentureState = typeof VENTURE_STATES[number];

export const VENTURE_TYPES = ['app', 'game'] as const;
export type VentureType = typeof VENTURE_TYPES[number];

export const EXPENSE_CATEGORIES = [
  'operations',
  'salaries',
  'tools',
  'marketing',
  'legal',
  'other',
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const STATE_COLORS: Record<VentureState, { text: string; bg: string }> = {
  building: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  live: { text: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  scaling: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  passive: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  killed: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

export const TYPE_COLORS: Record<VentureType, { text: string; bg: string }> = {
  app: { text: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' },
  game: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
};

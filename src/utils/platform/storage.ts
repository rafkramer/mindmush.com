import { STORAGE_KEYS } from './constants';
import type { User, Venture, StudioExpense, Settings, Payout } from './types';

// Demo data based on real MINDMUSH portfolio
const DEMO_USERS: User[] = [
  { id: 1, username: 'admin', password: 'kramer', role: 'admin', contract: '' },
  { id: 2, username: 'marcus', password: 'demo123', role: 'partner', contract: 'Standard equity agreement - 15% revenue share on assigned ventures.' },
  { id: 3, username: 'sofia', password: 'demo123', role: 'partner', contract: 'Development partner agreement - 20% equity on FaceKit 3D, 10% on Debloat AI.' },
  { id: 4, username: 'jake', password: 'demo123', role: 'partner', contract: 'Creative partnership - Revenue share on game titles.' },
];

const DEMO_VENTURES: Venture[] = [
  {
    id: 'v1',
    name: 'Skibidi War',
    type: 'game',
    state: 'scaling',
    revenue: 247800,
    studioEquity: 60,
    bundleId: 'com.mindmush.skibidiwar',
    superwallKey: '',
    icon: '/icons/Game_image.webp',
    partners: [
      { userId: 2, equity: 25 },
      { userId: 4, equity: 15 },
    ],
    expenses: [
      { id: 'e1', description: 'DaFuq!?Boom! licensing deal', amount: 45000, date: '2024-10-15', category: 'legal' },
      { id: 'e2', description: 'UA Campaign - TikTok', amount: 28000, date: '2024-11-01', category: 'marketing' },
      { id: 'e3', description: 'UA Campaign - Meta', amount: 19500, date: '2024-11-15', category: 'marketing' },
      { id: 'e4', description: 'Server costs', amount: 2400, date: '2024-12-01', category: 'operations' },
    ],
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'v2',
    name: 'DaGame',
    type: 'game',
    state: 'live',
    revenue: 89400,
    studioEquity: 70,
    bundleId: 'com.mindmush.dagame',
    superwallKey: '',
    icon: '/icons/dagame.png',
    partners: [
      { userId: 4, equity: 30 },
    ],
    expenses: [
      { id: 'e5', description: 'Initial development', amount: 8500, date: '2024-06-01', category: 'salaries' },
      { id: 'e6', description: 'App Store featuring bonus', amount: 5000, date: '2024-07-15', category: 'marketing' },
    ],
    createdAt: '2024-05-15T00:00:00Z',
  },
  {
    id: 'v3',
    name: 'FaceKit 3D',
    type: 'app',
    state: 'live',
    revenue: 156200,
    studioEquity: 55,
    bundleId: '',
    superwallKey: 'pk_live_facekit_xxxxx',
    icon: '/icons/facekit_3d_icon.png',
    partners: [
      { userId: 3, equity: 20 },
      { userId: 2, equity: 25 },
    ],
    expenses: [
      { id: 'e7', description: 'TrueDepth API development', amount: 12000, date: '2024-03-01', category: 'salaries' },
      { id: 'e8', description: 'ML model training', amount: 7500, date: '2024-04-01', category: 'tools' },
      { id: 'e9', description: 'Influencer campaign', amount: 15000, date: '2024-08-01', category: 'marketing' },
    ],
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'v4',
    name: 'Debloat AI',
    type: 'app',
    state: 'passive',
    revenue: 67800,
    studioEquity: 65,
    bundleId: '',
    superwallKey: 'pk_live_debloat_xxxxx',
    icon: '/icons/debloat_ai_icon.png',
    partners: [
      { userId: 3, equity: 10 },
      { userId: 2, equity: 25 },
    ],
    expenses: [
      { id: 'e10', description: 'AI model development', amount: 18000, date: '2024-01-15', category: 'salaries' },
      { id: 'e11', description: 'AppStack acquisition legal', amount: 8500, date: '2024-09-01', category: 'legal' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'v5',
    name: 'Obama Run',
    type: 'game',
    state: 'passive',
    revenue: 34600,
    studioEquity: 80,
    bundleId: 'com.mindmush.obamarun',
    superwallKey: '',
    icon: '/icons/obama_run_icon.png',
    partners: [
      { userId: 4, equity: 20 },
    ],
    expenses: [
      { id: 'e12', description: 'Game development', amount: 6000, date: '2023-11-01', category: 'salaries' },
    ],
    createdAt: '2023-10-01T00:00:00Z',
  },
  {
    id: 'v6',
    name: 'Amanda AI',
    type: 'app',
    state: 'passive',
    revenue: 42100,
    studioEquity: 50,
    bundleId: '',
    superwallKey: 'pk_live_amanda_xxxxx',
    icon: '/icons/amanda_ai_icon.png',
    partners: [
      { userId: 2, equity: 30 },
      { userId: 3, equity: 20 },
    ],
    expenses: [
      { id: 'e13', description: 'GPT API integration', amount: 4500, date: '2024-02-01', category: 'tools' },
      { id: 'e14', description: 'Pathmark Labs acquisition', amount: 12000, date: '2024-10-01', category: 'legal' },
    ],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'v7',
    name: 'Fitness Tracker Pro',
    type: 'app',
    state: 'building',
    revenue: 0,
    studioEquity: 100,
    bundleId: '',
    superwallKey: '',
    icon: null,
    partners: [],
    expenses: [
      { id: 'e15', description: 'Initial development sprint', amount: 15000, date: '2025-01-01', category: 'salaries' },
      { id: 'e16', description: 'HealthKit integration', amount: 3500, date: '2025-01-10', category: 'tools' },
    ],
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const DEMO_STUDIO_EXPENSES: StudioExpense[] = [
  { id: 's1', description: 'Office rent - Zurich', amount: 4500, date: '2025-01-01', category: 'operations' },
  { id: 's2', description: 'Developer tools & subscriptions', amount: 1200, date: '2025-01-01', category: 'tools' },
  { id: 's3', description: 'Legal retainer', amount: 2500, date: '2025-01-01', category: 'legal' },
  { id: 's4', description: 'Cloud infrastructure (AWS)', amount: 3800, date: '2025-01-01', category: 'operations' },
  { id: 's5', description: 'Team salaries', amount: 28000, date: '2025-01-01', category: 'salaries' },
  { id: 's6', description: 'Marketing budget (general)', amount: 5000, date: '2025-01-01', category: 'marketing' },
  { id: 's7', description: 'Office rent - Zurich', amount: 4500, date: '2024-12-01', category: 'operations' },
  { id: 's8', description: 'Team salaries', amount: 28000, date: '2024-12-01', category: 'salaries' },
  { id: 's9', description: 'Holiday bonuses', amount: 8000, date: '2024-12-15', category: 'salaries' },
];

const DEMO_PAYOUTS: Payout[] = [
  { id: 'p1', userId: 2, period: 'January 2025', amount: 12450, date: '2025-01-15', status: 'pending' },
  { id: 'p2', userId: 3, period: 'January 2025', amount: 8720, date: '2025-01-15', status: 'pending' },
  { id: 'p3', userId: 4, period: 'January 2025', amount: 6340, date: '2025-01-15', status: 'pending' },
  { id: 'p4', userId: 2, period: 'December 2024', amount: 11200, date: '2024-12-15', status: 'paid' },
  { id: 'p5', userId: 3, period: 'December 2024', amount: 7850, date: '2024-12-15', status: 'paid' },
  { id: 'p6', userId: 4, period: 'December 2024', amount: 5420, date: '2024-12-15', status: 'paid' },
];

// Initialize data with defaults if not present
// Data version - increment to force refresh demo data
const DEMO_DATA_VERSION = '5';

export function initializeData(): void {
  // Check if we need to refresh demo data
  const currentVersion = localStorage.getItem('mindmush_demo_version');
  const needsRefresh = currentVersion !== DEMO_DATA_VERSION;

  if (needsRefresh) {
    // Clear old data and load fresh demo data
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DEMO_USERS));
    localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify(DEMO_VENTURES));
    localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify(DEMO_STUDIO_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ applovinApiKey: 'demo_key_xxxxx' }));
    localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify(DEMO_PAYOUTS));
    localStorage.setItem('mindmush_demo_version', DEMO_DATA_VERSION);
  }
}

// Users
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

// Ventures
export function getVentures(): Venture[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ventures) || '[]');
}

export function saveVentures(ventures: Venture[]): void {
  localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify(ventures));
}

// Studio Expenses
export function getStudioExpenses(): StudioExpense[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.studioExpenses) || '[]');
}

export function saveStudioExpenses(expenses: StudioExpense[]): void {
  localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify(expenses));
}

// Settings
export function getSettings(): Settings {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

// Payouts
export function getPayouts(): Payout[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.payouts) || '[]');
}

export function savePayouts(payouts: Payout[]): void {
  localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify(payouts));
}

// Current User (session)
export function getCurrentUser(): User | null {
  const saved = sessionStorage.getItem(STORAGE_KEYS.currentUser);
  return saved ? JSON.parse(saved) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

// Generate unique ID
export function generateId(): string {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

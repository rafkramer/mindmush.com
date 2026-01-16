import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface VentureExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface VenturePartner {
  userId: number;
  equity: number;
}

export interface Venture {
  id: string;
  name: string;
  type: 'game' | 'app';
  state: 'building' | 'live' | 'scaling' | 'passive' | 'killed';
  revenue: number;
  studioEquity: number;
  bundleId?: string;
  superwallKey?: string;
  icon?: string;
  partners: VenturePartner[];
  expenses: VentureExpense[];
  createdAt: string;
}

const STORAGE_KEY = 'mindmush_ventures';

function createVenturesStore() {
  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial: Venture[] = stored ? JSON.parse(stored) : [];

  const ventures = writable<Venture[]>(initial);

  // Persist to localStorage
  ventures.subscribe(value => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  });

  return {
    subscribe: ventures.subscribe,

    add: (venture: Omit<Venture, 'id' | 'createdAt' | 'expenses' | 'partners'>) => {
      const newVenture: Venture = {
        ...venture,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        partners: [],
        expenses: [],
        createdAt: new Date().toISOString()
      };
      ventures.update(v => [...v, newVenture]);
      return newVenture;
    },

    update: (id: string, updates: Partial<Venture>) => {
      ventures.update(all =>
        all.map(v => v.id === id ? { ...v, ...updates } : v)
      );
    },

    delete: (id: string) => {
      ventures.update(all => all.filter(v => v.id !== id));
    },

    get: (id: string): Venture | undefined => {
      return get(ventures).find(v => v.id === id);
    },

    addExpense: (ventureId: string, expense: Omit<VentureExpense, 'id'>) => {
      const newExpense: VentureExpense = {
        ...expense,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      ventures.update(all =>
        all.map(v => v.id === ventureId
          ? { ...v, expenses: [...v.expenses, newExpense] }
          : v
        )
      );
    },

    deleteExpense: (ventureId: string, expenseId: string) => {
      ventures.update(all =>
        all.map(v => v.id === ventureId
          ? { ...v, expenses: v.expenses.filter(e => e.id !== expenseId) }
          : v
        )
      );
    },

    updatePartners: (ventureId: string, partners: VenturePartner[]) => {
      ventures.update(all =>
        all.map(v => v.id === ventureId ? { ...v, partners } : v)
      );
    },

    getByState: (state: Venture['state'] | 'all') => {
      return derived(ventures, $ventures =>
        state === 'all' ? $ventures : $ventures.filter(v => v.state === state)
      );
    },

    getByPartner: (userId: number) => {
      return derived(ventures, $ventures =>
        $ventures.filter(v => v.partners.some(p => p.userId === userId))
      );
    },

    // Computed stats
    stats: derived(ventures, $ventures => {
      let totalRevenue = 0;
      let totalExpenses = 0;
      let studioRevenue = 0;

      $ventures.forEach(v => {
        const ventureExpenses = v.expenses.reduce((sum, e) => sum + e.amount, 0);
        totalRevenue += v.revenue || 0;
        totalExpenses += ventureExpenses;
        studioRevenue += (v.revenue || 0) * (v.studioEquity / 100);
      });

      return {
        totalRevenue,
        totalExpenses,
        studioRevenue,
        count: $ventures.length
      };
    })
  };
}

export const ventures = createVenturesStore();

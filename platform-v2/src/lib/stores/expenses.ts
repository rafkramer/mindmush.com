import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface StudioExpense {
  id: string;
  description: string;
  category: 'operations' | 'salaries' | 'tools' | 'marketing' | 'legal' | 'other';
  amount: number;
  date: string;
}

const STORAGE_KEY = 'mindmush_studio_expenses';

function createExpensesStore() {
  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial: StudioExpense[] = stored ? JSON.parse(stored) : [];

  const expenses = writable<StudioExpense[]>(initial);

  expenses.subscribe(value => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  });

  return {
    subscribe: expenses.subscribe,

    add: (expense: Omit<StudioExpense, 'id'>) => {
      const newExpense: StudioExpense = {
        ...expense,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      expenses.update(e => [...e, newExpense]);
      return newExpense;
    },

    delete: (id: string) => {
      expenses.update(all => all.filter(e => e.id !== id));
    },

    total: derived(expenses, $expenses =>
      $expenses.reduce((sum, e) => sum + e.amount, 0)
    ),

    thisMonth: derived(expenses, $expenses => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return $expenses
        .filter(e => new Date(e.date) >= monthStart)
        .reduce((sum, e) => sum + e.amount, 0);
    }),

    byCategory: derived(expenses, $expenses => {
      const categories: Record<string, number> = {};
      $expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });
      return categories;
    }),

    filtered: (startDate: Date, endDate: Date) => {
      return derived(expenses, $expenses =>
        $expenses.filter(e => {
          const date = new Date(e.date);
          return date >= startDate && date <= endDate;
        })
      );
    }
  };
}

export const studioExpenses = createExpensesStore();

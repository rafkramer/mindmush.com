import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Payout {
  id: string;
  period: string;
  amount: number;
  status: 'paid' | 'pending';
  date: string;
  userId: number;
}

const STORAGE_KEY = 'mindmush_payouts';

function createPayoutsStore() {
  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial: Payout[] = stored ? JSON.parse(stored) : [];

  const payouts = writable<Payout[]>(initial);

  payouts.subscribe(value => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  });

  return {
    subscribe: payouts.subscribe,

    add: (payout: Omit<Payout, 'id'>) => {
      const newPayout: Payout = {
        ...payout,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      payouts.update(p => [...p, newPayout]);
      return newPayout;
    },

    updateStatus: (id: string, status: Payout['status']) => {
      payouts.update(all =>
        all.map(p => p.id === id ? { ...p, status } : p)
      );
    },

    getByUser: (userId: number) => {
      return derived(payouts, $payouts =>
        $payouts.filter(p => p.userId === userId)
      );
    },

    totalPaidForUser: (userId: number) => {
      return derived(payouts, $payouts =>
        $payouts
          .filter(p => p.userId === userId && p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0)
      );
    }
  };
}

export const payouts = createPayoutsStore();

// Apple payout schedule helpers
export function getNextApplePayoutDate(): Date {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  let payoutDate = new Date(lastMonth.getTime() + (45 * 24 * 60 * 60 * 1000));

  if (payoutDate < today) {
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    payoutDate = new Date(thisMonthEnd.getTime() + (45 * 24 * 60 * 60 * 1000));
  }

  return payoutDate;
}

export function getDaysUntilPayout(): number {
  const payoutDate = getNextApplePayoutDate();
  const today = new Date();
  return Math.ceil((payoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

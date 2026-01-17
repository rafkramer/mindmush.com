import type { VentureState, VentureType, ExpenseCategory } from './constants';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'partner';
  contract?: string;
}

export interface VenturePartner {
  userId: number;
  equity: number;
}

export interface VentureExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: ExpenseCategory;
}

export interface Venture {
  id: string;
  name: string;
  type: VentureType;
  state: VentureState;
  revenue: number;
  studioEquity: number;
  bundleId?: string;
  superwallKey?: string;
  icon?: string | null;
  partners: VenturePartner[];
  expenses: VentureExpense[];
  createdAt: string;
}

export interface StudioExpense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export interface Settings {
  applovinApiKey?: string;
}

export interface Payout {
  id: string;
  userId: number;
  period: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
}

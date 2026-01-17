import { useState, useEffect, useCallback } from 'react';
import {
  getVentures,
  saveVentures,
  generateId,
} from '../../utils/platform/storage';
import { filterByDateRange } from '../../utils/platform/format';
import type { Venture, VentureExpense } from '../../utils/platform/types';
import type { VentureState } from '../../utils/platform/constants';

export function useVentures() {
  const [ventures, setVenturesState] = useState<Venture[]>([]);

  useEffect(() => {
    setVenturesState(getVentures());
  }, []);

  const refresh = useCallback(() => {
    setVenturesState(getVentures());
  }, []);

  const addVenture = useCallback((ventureData: Omit<Venture, 'id' | 'createdAt' | 'partners' | 'expenses'>): Venture => {
    const currentVentures = getVentures();
    const newVenture: Venture = {
      id: generateId(),
      ...ventureData,
      partners: [],
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    const updatedVentures = [newVenture, ...currentVentures];
    saveVentures(updatedVentures);
    setVenturesState(updatedVentures);
    return newVenture;
  }, []);

  const updateVenture = useCallback((id: string, updates: Partial<Venture>): boolean => {
    const currentVentures = getVentures();
    const index = currentVentures.findIndex(v => v.id === id);
    if (index === -1) return false;
    const updatedVentures = currentVentures.map((v, i) =>
      i === index ? { ...v, ...updates } : v
    );
    saveVentures(updatedVentures);
    setVenturesState(updatedVentures);
    return true;
  }, []);

  const deleteVenture = useCallback((id: string): boolean => {
    const ventures = getVentures();
    const filtered = ventures.filter(v => v.id !== id);
    if (filtered.length === ventures.length) return false;
    saveVentures(filtered);
    setVenturesState(filtered);
    return true;
  }, []);

  const getById = useCallback((id: string): Venture | undefined => {
    return ventures.find(v => v.id === id);
  }, [ventures]);

  const getByState = useCallback((state: VentureState): Venture[] => {
    return ventures.filter(v => v.state === state);
  }, [ventures]);

  const getByPartner = useCallback((userId: number): Venture[] => {
    return ventures.filter(v => v.partners.some(p => p.userId === userId));
  }, [ventures]);

  // Add expense to a venture
  const addVentureExpense = useCallback((ventureId: string, description: string, amount: number): boolean => {
    const currentVentures = getVentures();
    const index = currentVentures.findIndex(v => v.id === ventureId);
    if (index === -1) return false;

    const expense: VentureExpense = {
      id: generateId(),
      description,
      amount,
      date: new Date().toISOString(),
    };

    const updatedVentures = currentVentures.map((v, i) => {
      if (i !== index) return v;
      return { ...v, expenses: [expense, ...(v.expenses || [])] };
    });
    saveVentures(updatedVentures);
    setVenturesState(updatedVentures);
    return true;
  }, []);

  const deleteVentureExpense = useCallback((ventureId: string, expenseId: string): boolean => {
    const currentVentures = getVentures();
    const index = currentVentures.findIndex(v => v.id === ventureId);
    if (index === -1) return false;

    const updatedVentures = currentVentures.map((v, i) => {
      if (i !== index) return v;
      return { ...v, expenses: (v.expenses || []).filter(e => e.id !== expenseId) };
    });
    saveVentures(updatedVentures);
    setVenturesState(updatedVentures);
    return true;
  }, []);

  // Calculate stats
  const getStats = useCallback((dateRange: number | 'all' = 'all') => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let studioRevenue = 0;

    ventures.forEach(venture => {
      const ventureExpenses = filterByDateRange(venture.expenses || [], dateRange)
        .reduce((sum, e) => sum + e.amount, 0);
      totalRevenue += venture.revenue || 0;
      totalExpenses += ventureExpenses;
      studioRevenue += (venture.revenue || 0) * (venture.studioEquity / 100);
    });

    return {
      totalRevenue,
      totalExpenses,
      studioRevenue,
      studioProfit: studioRevenue - totalExpenses,
      ventureCount: ventures.length,
    };
  }, [ventures]);

  return {
    ventures,
    refresh,
    addVenture,
    updateVenture,
    deleteVenture,
    getById,
    getByState,
    getByPartner,
    addVentureExpense,
    deleteVentureExpense,
    getStats,
  };
}

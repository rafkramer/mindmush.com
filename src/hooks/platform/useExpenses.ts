import { useState, useEffect, useCallback } from 'react';
import {
  getStudioExpenses,
  saveStudioExpenses,
  generateId,
} from '../../utils/platform/storage';
import { filterByDateRange } from '../../utils/platform/format';
import type { StudioExpense } from '../../utils/platform/types';
import type { ExpenseCategory } from '../../utils/platform/constants';

export function useExpenses() {
  const [expenses, setExpensesState] = useState<StudioExpense[]>([]);

  useEffect(() => {
    setExpensesState(getStudioExpenses());
  }, []);

  const refresh = useCallback(() => {
    setExpensesState(getStudioExpenses());
  }, []);

  const addExpense = useCallback((
    description: string,
    amount: number,
    category: ExpenseCategory
  ): StudioExpense => {
    const currentExpenses = getStudioExpenses();
    const newExpense: StudioExpense = {
      id: generateId(),
      description,
      amount,
      category,
      date: new Date().toISOString(),
    };
    const updatedExpenses = [newExpense, ...currentExpenses];
    saveStudioExpenses(updatedExpenses);
    setExpensesState(updatedExpenses);
    return newExpense;
  }, []);

  const deleteExpense = useCallback((id: string): boolean => {
    const expenses = getStudioExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length === expenses.length) return false;
    saveStudioExpenses(filtered);
    setExpensesState(filtered);
    return true;
  }, []);

  const getTotal = useCallback((dateRange: number | 'all' = 'all'): number => {
    const filtered = filterByDateRange(expenses, dateRange);
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getMonthlyTotal = useCallback((): number => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses
      .filter(e => new Date(e.date) >= monthStart)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return {
    expenses,
    refresh,
    addExpense,
    deleteExpense,
    getTotal,
    getMonthlyTotal,
  };
}

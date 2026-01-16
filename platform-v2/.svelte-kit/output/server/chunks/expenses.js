import { w as writable, d as derived } from "./index.js";
function createExpensesStore() {
  const initial = [];
  const expenses = writable(initial);
  expenses.subscribe((value) => {
  });
  return {
    subscribe: expenses.subscribe,
    add: (expense) => {
      const newExpense = {
        ...expense,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      expenses.update((e) => [...e, newExpense]);
      return newExpense;
    },
    delete: (id) => {
      expenses.update((all) => all.filter((e) => e.id !== id));
    },
    total: derived(
      expenses,
      ($expenses) => $expenses.reduce((sum, e) => sum + e.amount, 0)
    ),
    thisMonth: derived(expenses, ($expenses) => {
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return $expenses.filter((e) => new Date(e.date) >= monthStart).reduce((sum, e) => sum + e.amount, 0);
    }),
    byCategory: derived(expenses, ($expenses) => {
      const categories = {};
      $expenses.forEach((e) => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });
      return categories;
    }),
    filtered: (startDate, endDate) => {
      return derived(
        expenses,
        ($expenses) => $expenses.filter((e) => {
          const date = new Date(e.date);
          return date >= startDate && date <= endDate;
        })
      );
    }
  };
}
const studioExpenses = createExpensesStore();
export {
  studioExpenses as s
};

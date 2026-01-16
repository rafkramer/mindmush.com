import { w as writable, d as derived, g as get } from "./index.js";
function createVenturesStore() {
  const initial = [];
  const ventures2 = writable(initial);
  ventures2.subscribe((value) => {
  });
  return {
    subscribe: ventures2.subscribe,
    add: (venture) => {
      const newVenture = {
        ...venture,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        partners: [],
        expenses: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      ventures2.update((v) => [...v, newVenture]);
      return newVenture;
    },
    update: (id, updates) => {
      ventures2.update(
        (all) => all.map((v) => v.id === id ? { ...v, ...updates } : v)
      );
    },
    delete: (id) => {
      ventures2.update((all) => all.filter((v) => v.id !== id));
    },
    get: (id) => {
      return get(ventures2).find((v) => v.id === id);
    },
    addExpense: (ventureId, expense) => {
      const newExpense = {
        ...expense,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      ventures2.update(
        (all) => all.map(
          (v) => v.id === ventureId ? { ...v, expenses: [...v.expenses, newExpense] } : v
        )
      );
    },
    deleteExpense: (ventureId, expenseId) => {
      ventures2.update(
        (all) => all.map(
          (v) => v.id === ventureId ? { ...v, expenses: v.expenses.filter((e) => e.id !== expenseId) } : v
        )
      );
    },
    updatePartners: (ventureId, partners) => {
      ventures2.update(
        (all) => all.map((v) => v.id === ventureId ? { ...v, partners } : v)
      );
    },
    getByState: (state) => {
      return derived(
        ventures2,
        ($ventures) => state === "all" ? $ventures : $ventures.filter((v) => v.state === state)
      );
    },
    getByPartner: (userId) => {
      return derived(
        ventures2,
        ($ventures) => $ventures.filter((v) => v.partners.some((p) => p.userId === userId))
      );
    },
    // Computed stats
    stats: derived(ventures2, ($ventures) => {
      let totalRevenue = 0;
      let totalExpenses = 0;
      let studioRevenue = 0;
      $ventures.forEach((v) => {
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
const ventures = createVenturesStore();
export {
  ventures as v
};

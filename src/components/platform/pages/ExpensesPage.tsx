import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../../utils/platform/format';
import type { StudioExpense } from '../../../utils/platform/types';

interface ExpensesPageProps {
  expenses: StudioExpense[];
  totalExpenses: number;
  monthlyExpenses: number;
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  operations: 'info',
  salaries: 'success',
  tools: 'default',
  marketing: 'warning',
  legal: 'danger',
  other: 'default',
};

export function ExpensesPage({
  expenses,
  totalExpenses,
  monthlyExpenses,
  onAddExpense,
  onDeleteExpense,
}: ExpensesPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Studio Expenses</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Track operating costs and overhead</p>
        </div>
        <Button variant="primary" onClick={onAddExpense} className="w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <StatCard
          label="Total Studio Costs"
          value={formatCurrency(totalExpenses)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9" />
            </svg>
          }
          iconColor="red"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(monthlyExpenses)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          iconColor="orange"
        />
      </div>

      {/* Expenses Table */}
      <Card>
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No studio expenses recorded.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {expenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 bg-white/[0.02] rounded-xl"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm text-white flex-1">{expense.description}</span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={CATEGORY_COLORS[expense.category] || 'default'}>
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                      </Badge>
                      <span className="text-xs text-white/40">{formatDate(expense.date)}</span>
                    </div>
                    <span className="text-sm font-semibold text-white font-mono">{formatCurrency(expense.amount)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Description</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Category</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Amount</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Date</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, i) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-2 text-sm text-white">{expense.description}</td>
                      <td className="py-3 px-2">
                        <Badge variant={CATEGORY_COLORS[expense.category] || 'default'}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-2 text-right text-sm text-white/40">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

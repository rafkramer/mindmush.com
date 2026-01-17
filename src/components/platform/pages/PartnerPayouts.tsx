import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate, getNextApplePayoutDate, getDaysUntilPayout, filterByDateRange } from '../../../utils/platform/format';
import { getPayouts } from '../../../utils/platform/storage';
import type { User, Venture } from '../../../utils/platform/types';

interface PartnerPayoutsProps {
  user: User;
  ventures: Venture[];
}

export function PartnerPayouts({ user, ventures }: PartnerPayoutsProps) {
  const userVentures = ventures.filter(v =>
    (v.partners || []).some(p => p.userId === user.id)
  );

  // Calculate pending amount
  let pendingAmount = 0;
  userVentures.forEach(v => {
    const partner = v.partners.find(p => p.userId === user.id);
    const equity = partner?.equity || 0;
    const ventureExpenses = (v.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const profit = (v.revenue || 0) - ventureExpenses;
    pendingAmount += profit * (equity / 100);
  });

  const payouts = getPayouts().filter(p => p.userId === user.id);
  const totalPaidOut = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const nextPayoutDate = getNextApplePayoutDate();
  const daysUntilPayout = getDaysUntilPayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Payouts</h1>
        <p className="text-white/40 text-sm mt-1">Track your earnings and payment schedule</p>
      </div>

      {/* Next Payout Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50 mb-1">Next Payout</p>
            <p className="text-4xl font-bold text-white font-mono">{formatCurrency(pendingAmount)}</p>
            <p className="text-sm text-white/50 mt-2">
              {formatDate(nextPayoutDate.toISOString())}
            </p>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{daysUntilPayout}</p>
                <p className="text-xs text-white/40">days</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-white/50 mb-1">Total Paid Out</p>
          <p className="text-2xl font-semibold text-green-400 font-mono">{formatCurrency(totalPaidOut)}</p>
        </Card>
        <Card>
          <p className="text-sm text-white/50 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-amber-400 font-mono">{formatCurrency(pendingAmount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-white/50 mb-1">Next Payout Date</p>
          <p className="text-lg font-medium text-white">
            {nextPayoutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </Card>
      </div>

      {/* Payout Schedule Info */}
      <Card>
        <h3 className="text-sm font-medium text-white/70 mb-3">Payment Schedule</h3>
        <p className="text-sm text-white/50">
          Profit distributions follow Apple's payout schedule. Payments are typically disbursed within 45 days
          after the end of each fiscal month. Your share is calculated based on your equity percentage in each venture.
        </p>
      </Card>

      {/* Payout History */}
      <Card>
        <h3 className="text-sm font-medium text-white/70 mb-4">Payout History</h3>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No payout history yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Period</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-white/40">Status</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, i) => (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03]"
                  >
                    <td className="py-3 px-2 text-sm text-white">{payout.period}</td>
                    <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-white/40">
                      {formatDate(payout.date)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

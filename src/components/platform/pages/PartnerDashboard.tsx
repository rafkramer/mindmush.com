import { motion } from 'framer-motion';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';
import { StateBadge, TypeBadge } from '../ui/Badge';
import { formatCurrency } from '../../../utils/platform/format';
import type { User, Venture } from '../../../utils/platform/types';

interface PartnerDashboardProps {
  user: User;
  ventures: Venture[];
  onViewVenture: (id: string) => void;
}

export function PartnerDashboard({
  user,
  ventures,
  onViewVenture,
}: PartnerDashboardProps) {
  const userVentures = ventures.filter(v =>
    (v.partners || []).some(p => p.userId === user.id)
  );

  // Calculate totals
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalShare = 0;

  userVentures.forEach(v => {
    const partner = v.partners.find(p => p.userId === user.id);
    const equity = partner?.equity || 0;
    const ventureExpenses = (v.expenses || [])
      .reduce((sum, e) => sum + e.amount, 0);
    const profit = (v.revenue || 0) - ventureExpenses;

    totalRevenue += v.revenue || 0;
    totalProfit += profit;
    totalShare += profit * (equity / 100);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">My Portfolio</h1>
        <p className="text-white/40 text-xs sm:text-sm mt-1">Your venture overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Ventures"
          value={String(userVentures.length)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8" />
            </svg>
          }
          iconColor="purple"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659" />
            </svg>
          }
          iconColor="blue"
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307" />
            </svg>
          }
          iconColor="green"
          positive={totalProfit >= 0}
        />
        <StatCard
          label="Your Share"
          value={formatCurrency(totalShare)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15" />
            </svg>
          }
          iconColor="orange"
        />
      </div>

      {/* Ventures Table */}
      <Card>
        <h3 className="text-sm font-medium text-white/70 mb-4">Your Ventures</h3>

        {userVentures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No ventures assigned to you yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {userVentures.map((venture, i) => {
                const partner = venture.partners.find(p => p.userId === user.id);
                const equity = partner?.equity || 0;
                const ventureExpenses = (venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
                const profit = (venture.revenue || 0) - ventureExpenses;
                const share = profit * (equity / 100);

                return (
                  <motion.div
                    key={venture.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onViewVenture(venture.id)}
                    className="p-3 bg-white/[0.02] rounded-xl active:bg-white/[0.04] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                        venture.type === 'game' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                      }`}>
                        {venture.icon ? (
                          <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className={`w-5 h-5 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087' : 'M10.5 1.5H8.25'} />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{venture.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StateBadge state={venture.state} />
                          <span className="text-xs text-purple-400">{equity}% equity</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-white/40 mb-0.5">Profit</p>
                        <p className={`font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 mb-0.5">Your Share</p>
                        <p className={`font-mono ${share >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(share)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Venture</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-white/40">State</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Equity</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Revenue</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Profit</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Your Share</th>
                  </tr>
                </thead>
                <tbody>
                  {userVentures.map((venture, i) => {
                    const partner = venture.partners.find(p => p.userId === user.id);
                    const equity = partner?.equity || 0;
                    const ventureExpenses = (venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
                    const profit = (venture.revenue || 0) - ventureExpenses;
                    const share = profit * (equity / 100);

                    return (
                      <motion.tr
                        key={venture.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onViewVenture(venture.id)}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
                              venture.type === 'game' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                            }`}>
                              {venture.icon ? (
                                <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg className={`w-5 h-5 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087' : 'M10.5 1.5H8.25'} />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-white font-medium">{venture.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <TypeBadge type={venture.type} />
                        </td>
                        <td className="py-3 px-2">
                          <StateBadge state={venture.state} />
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-purple-400">
                          {equity}%
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                          {formatCurrency(venture.revenue || 0)}
                        </td>
                        <td className={`py-3 px-2 text-right text-sm font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)}
                        </td>
                        <td className={`py-3 px-2 text-right text-sm font-mono ${share >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(share)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

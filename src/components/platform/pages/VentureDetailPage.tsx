import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StateBadge, TypeBadge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../../utils/platform/format';
import { getSettings, getUsers } from '../../../utils/platform/storage';
import type { Venture } from '../../../utils/platform/types';

interface VentureDetailPageProps {
  venture: Venture;
  onBack: () => void;
  onEdit: () => void;
  onAddExpense: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onSync: () => void;
}

export function VentureDetailPage({
  venture,
  onBack,
  onEdit,
  onAddExpense,
  onDeleteExpense,
  onSync,
}: VentureDetailPageProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<any>(null);
  const settings = getSettings();
  const users = getUsers();

  const ventureExpenses = (venture.expenses || [])
    .reduce((sum, e) => sum + e.amount, 0);
  const profit = (venture.revenue || 0) - ventureExpenses;
  const studioRev = (venture.revenue || 0) * (venture.studioEquity / 100);

  // API status
  const getApiStatus = () => {
    if (venture.state === 'building' || venture.state === 'killed') {
      return { status: 'disabled', text: `API sync disabled for ${venture.state} ventures`, className: 'bg-white/[0.02] border-white/[0.06] text-white/40' };
    }
    if (venture.type === 'game') {
      if (venture.bundleId && settings.applovinApiKey) {
        return { status: 'connected', text: `AppLovin API connected • Bundle: ${venture.bundleId}`, className: 'bg-green-500/10 border-green-500/20 text-green-400' };
      }
      if (!venture.bundleId) {
        return { status: 'disconnected', text: 'Bundle ID not configured', className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
      }
      return { status: 'disconnected', text: 'AppLovin API key not configured in Settings', className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    }
    if (venture.superwallKey) {
      return { status: 'connected', text: 'Superwall API connected', className: 'bg-green-500/10 border-green-500/20 text-green-400' };
    }
    return { status: 'disconnected', text: 'Superwall API key not configured', className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  };

  const apiStatus = getApiStatus();

  // Initialize chart
  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current) return;

    const initChart = async () => {
      const ChartJS = (window as any).Chart;
      if (!ChartJS) return;

      if (chart) chart.destroy();

      const ctx = chartRef.current!.getContext('2d');
      if (!ctx) return;

      const days = 30;
      const labels: string[] = [];
      const revenueData: number[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        revenueData.push(Math.round((venture.revenue || 0) / days));
      }

      const newChart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: venture.type === 'game' ? 'Revenue' : 'Proceeds',
            data: revenueData,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: (v: number) => '$' + v.toLocaleString() } },
          },
        },
      });
      setChart(newChart);
    };

    initChart();
    return () => { if (chart) chart.destroy(); };
  }, [venture]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
            venture.type === 'game' ? 'bg-orange-500/10' : 'bg-blue-500/10'
          }`}>
            {venture.icon ? (
              <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover" />
            ) : (
              <svg className={`w-7 h-7 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5'} />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-white">{venture.name}</h1>
              <TypeBadge type={venture.type} />
              <StateBadge state={venture.state} />
            </div>
            <p className="text-white/40 text-sm mt-0.5">
              {venture.type === 'game' ? 'Mobile Game' : 'Consumer App'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {apiStatus.status === 'connected' && (
            <Button variant="ghost" onClick={onSync}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </Button>
          )}
          <Button variant="secondary" onClick={onEdit}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
        </div>
      </div>

      {/* API Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${apiStatus.className}`}
      >
        <span className={`w-2 h-2 rounded-full ${
          apiStatus.status === 'connected' ? 'bg-green-400' :
          apiStatus.status === 'disconnected' ? 'bg-amber-400' : 'bg-white/30'
        }`} />
        <span className="text-sm">{apiStatus.text}</span>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={venture.type === 'game' ? 'Revenue' : 'Proceeds'}
          value={formatCurrency(venture.revenue || 0)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0" /></svg>}
          iconColor="purple"
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(ventureExpenses)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101" /></svg>}
          iconColor="red"
        />
        <StatCard
          label="Profit"
          value={formatCurrency(profit)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307" /></svg>}
          iconColor="green"
          positive={profit >= 0}
        />
        <StatCard
          label="Studio Revenue"
          value={formatCurrency(studioRev)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18" /></svg>}
          iconColor="blue"
        />
      </div>

      {/* Chart */}
      <Card>
        <h3 className="text-sm font-medium text-white/70 mb-4">Performance</h3>
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>
      </Card>

      {/* Equity & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity - Compact */}
        <Card padding="sm">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Equity Split</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-400">Studio</span>
              <span className="text-white font-medium">{venture.studioEquity}%</span>
            </div>
            {(venture.partners || []).map(partner => {
              const user = users.find(u => u.id === partner.userId);
              if (!user) return null;
              return (
                <div key={partner.userId} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{user.username}</span>
                  <span className="text-white/80">{partner.equity}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Expenses - Takes more space */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide">Expenses</h3>
            <Button variant="ghost" size="sm" onClick={onAddExpense}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </Button>
          </div>
          {(venture.expenses || []).length === 0 ? (
            <p className="text-sm text-white/40 text-center py-6">No expenses recorded.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(venture.expenses || []).map(expense => (
                <div key={expense.id} className="flex items-center justify-between py-1.5 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-white truncate">{expense.description}</span>
                    <span className="text-xs text-white/30 flex-shrink-0">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-white/70 font-mono">{formatCurrency(expense.amount)}</span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

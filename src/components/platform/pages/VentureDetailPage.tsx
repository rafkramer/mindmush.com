import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StateBadge, TypeBadge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../../utils/platform/format';
import { getSettings, getUsers } from '../../../utils/platform/storage';
import { IDEA_CATEGORY_CONFIG } from '../../../utils/platform/constants';
import type { Venture, Idea } from '../../../utils/platform/types';

interface VentureDetailPageProps {
  venture: Venture;
  ideas?: Idea[];
  onBack: () => void;
  onEdit: () => void;
  onAddExpense: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onSync: () => void;
  onViewIdea?: (idea: Idea) => void;
  onAddIdea?: () => void;
}

export function VentureDetailPage({
  venture,
  ideas = [],
  onBack,
  onEdit,
  onAddExpense,
  onDeleteExpense,
  onSync,
  onViewIdea,
  onAddIdea,
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

  // Generate realistic trend data with variation
  const generateTrendData = (baseValue: number, days: number, ventureId: string) => {
    const data: number[] = [];
    let current = baseValue * 0.7;
    // Use venture ID to create consistent seed
    const seed = ventureId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < days; i++) {
      const noise = (seededRandom(i) - 0.5) * baseValue * 0.3;
      current = current * 1.015 + noise; // Slight upward trend
      current = Math.max(current, baseValue * 0.3);
      current = Math.min(current, baseValue * 1.5);
      data.push(Math.round(current));
    }
    return data;
  };

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
      const avgDailyRevenue = (venture.revenue || 0) / days;
      const revenueData = generateTrendData(avgDailyRevenue, days, venture.id);

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      const newChart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: venture.type === 'game' ? 'Revenue' : 'Proceeds',
            data: revenueData,
            borderColor: '#8b5cf6',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#8b5cf6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index' as const,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 11, 0.95)',
              titleColor: 'rgba(255,255,255,0.9)',
              bodyColor: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: (ctx: any) => `Revenue: $${ctx.parsed.y.toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
              ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
              border: { display: false },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
              ticks: {
                color: 'rgba(255,255,255,0.35)',
                font: { size: 10 },
                callback: (v: number) => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
                padding: 8,
              },
              border: { display: false },
            },
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
      <div className="space-y-4">
        {/* Top row - Back button and actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {apiStatus.status === 'connected' && (
              <Button variant="ghost" onClick={onSync} className="hidden sm:flex">
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
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>

        {/* Venture info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
            venture.type === 'game' ? 'bg-orange-500/10' : 'bg-blue-500/10'
          }`}>
            {venture.icon ? (
              <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover" />
            ) : (
              <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5'} />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-white truncate">{venture.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <TypeBadge type={venture.type} />
              <StateBadge state={venture.state} />
            </div>
          </div>
        </div>
      </div>

      {/* API Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border ${apiStatus.className}`}
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          apiStatus.status === 'connected' ? 'bg-green-400' :
          apiStatus.status === 'disconnected' ? 'bg-amber-400' : 'bg-white/30'
        }`} />
        <span className="text-xs sm:text-sm truncate">{apiStatus.text}</span>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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
      <Card className="overflow-hidden">
        <h3 className="text-sm font-medium text-white/70 mb-4">Performance</h3>
        <div className="h-48 sm:h-64 -mx-2 sm:mx-0">
          <canvas ref={chartRef} />
        </div>
      </Card>

      {/* Equity & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div key={expense.id} className="flex items-center justify-between py-2 sm:py-1.5 group border-b border-white/[0.03] sm:border-0 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 flex-1">
                    <span className="text-sm text-white truncate">{expense.description}</span>
                    <span className="text-xs text-white/30 flex-shrink-0">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-sm text-white/70 font-mono">{formatCurrency(expense.amount)}</span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 sm:p-1 text-white/30 sm:text-white/20 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Ideas Board */}
      {onViewIdea && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide">Ideas & Research</h3>
            {onAddIdea && (
              <Button variant="ghost" size="sm" onClick={onAddIdea}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </Button>
            )}
          </div>
          {ideas.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-6">No ideas linked to this venture.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ideas.map((idea) => {
                const categoryConfig = IDEA_CATEGORY_CONFIG[idea.category];
                return (
                  <motion.button
                    key={idea.id}
                    onClick={() => onViewIdea(idea)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    {idea.image ? (
                      <img src={idea.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: categoryConfig.bg }}
                      >
                        {categoryConfig.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{idea.title}</p>
                      <p className="text-xs text-white/40">{categoryConfig.label.slice(0, -1)}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </motion.button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

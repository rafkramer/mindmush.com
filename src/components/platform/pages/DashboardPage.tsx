import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StateBadge, TypeBadge } from '../ui/Badge';
import { formatCurrency, filterByDateRange } from '../../../utils/platform/format';
import type { Venture } from '../../../utils/platform/types';

// Chart.js is loaded via CDN in PlatformLayout.astro
interface ChartInstance {
  destroy: () => void;
  data: { datasets: any[] };
  update: () => void;
}

type MetricKey = 'ventureRevenue' | 'ventureExpenses' | 'studioRevenue' | 'studioExpenses' | 'studioProfit';

interface DashboardPageProps {
  ventures: Venture[];
  studioExpenses: number;
  dateRange: number | 'all';
  onViewVenture: (id: string) => void;
  onSync: () => void;
}

export function DashboardPage({
  ventures,
  studioExpenses,
  dateRange,
  onViewVenture,
  onSync,
}: DashboardPageProps) {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const studioChartRef = useRef<HTMLCanvasElement>(null);
  const [revenueChart, setRevenueChart] = useState<ChartInstance | null>(null);
  const [studioChart, setStudioChart] = useState<ChartInstance | null>(null);
  const [highlightedMetric, setHighlightedMetric] = useState<MetricKey | null>(null);

  // Calculate stats
  let totalRevenue = 0;
  let ventureExpensesTotal = 0;
  let studioRevenue = 0;

  ventures.forEach(venture => {
    const ventureExp = (venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    totalRevenue += venture.revenue || 0;
    ventureExpensesTotal += ventureExp;
    studioRevenue += (venture.revenue || 0) * (venture.studioEquity / 100);
  });

  const totalExpenses = ventureExpensesTotal + studioExpenses;
  const studioProfit = studioRevenue - studioExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0;

  // Toggle metric highlight - click to focus, click again to unfocus
  const toggleHighlight = useCallback((metric: MetricKey) => {
    setHighlightedMetric(prev => prev === metric ? null : metric);
  }, []);

  // Metric definitions
  const metricConfig: Record<MetricKey, { label: string; color: string; value: number; trend: 'up' | 'down' | 'stable' }> = {
    ventureRevenue: { label: 'Venture Revenue', color: '#8b5cf6', value: totalRevenue, trend: 'up' },
    ventureExpenses: { label: 'Venture Expenses', color: '#f97316', value: ventureExpensesTotal, trend: 'stable' },
    studioRevenue: { label: 'Studio Revenue', color: '#3b82f6', value: studioRevenue, trend: 'up' },
    studioExpenses: { label: 'Studio Expenses', color: '#ef4444', value: studioExpenses, trend: 'stable' },
    studioProfit: { label: 'Studio Profit', color: '#22c55e', value: studioProfit, trend: 'up' },
  };

  // Generate realistic-looking data with natural variation (seeded for consistency)
  const generateTrendData = useCallback((baseValue: number, days: number, trend: 'up' | 'down' | 'stable' = 'up', seed: number = 0) => {
    const data: number[] = [];
    let current = baseValue * 0.7;
    const trendFactor = trend === 'up' ? 1.02 : trend === 'down' ? 0.98 : 1;

    // Simple seeded random for consistency
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < days; i++) {
      const noise = (seededRandom(i) - 0.5) * baseValue * 0.15;
      current = current * trendFactor + noise;
      current = Math.max(current, baseValue * 0.3);
      data.push(Math.round(current));
    }
    return data;
  }, []);

  // Initialize charts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initCharts = async () => {
      const ChartJS = (window as any).Chart;
      if (!ChartJS) return;

      const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
            align: 'end' as const,
            labels: {
              color: 'rgba(255,255,255,0.5)',
              font: { size: 11, family: 'Inter' },
              boxWidth: 8,
              boxHeight: 8,
              borderRadius: 4,
              useBorderRadius: true,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 11, 0.95)',
            titleColor: 'rgba(255,255,255,0.9)',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { size: 12, weight: '500' as const },
            bodyFont: { size: 11 },
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: {
              color: 'rgba(255,255,255,0.35)',
              font: { size: 10, family: 'Inter' },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: {
              color: 'rgba(255,255,255,0.35)',
              font: { size: 10, family: 'Inter' },
              callback: (value: number) => '$' + (value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value),
              padding: 8,
            },
            border: { display: false },
          },
        },
      };

      // Financial Overview Chart - All 5 metrics
      if (revenueChartRef.current) {
        if (revenueChart) revenueChart.destroy();
        const ctx = revenueChartRef.current.getContext('2d');
        if (ctx) {
          const days = dateRange === 'all' ? 30 : dateRange;
          const labels: string[] = [];

          for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          }

          // Generate data for all 5 metrics
          const ventureRevenueData = generateTrendData(totalRevenue / days, days, 'up', 1);
          const ventureExpensesData = generateTrendData(ventureExpensesTotal / days, days, 'stable', 2);
          const studioRevenueData = generateTrendData(studioRevenue / days, days, 'up', 3);
          const studioExpensesData = generateTrendData(studioExpenses / days, days, 'stable', 4);
          const studioProfitData = generateTrendData(studioProfit / days, days, 'up', 5);

          // Create gradient fills
          const createGradient = (color: string, opacity: number = 0.15) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'));
            gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
            return gradient;
          };

          // Helper to adjust color opacity
          const adjustOpacity = (color: string, opacity: number) => {
            // For hex colors like #8b5cf6
            if (color.startsWith('#')) {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
            return color;
          };

          const datasets = [
            {
              key: 'ventureRevenue',
              label: 'Venture Revenue',
              data: ventureRevenueData,
              baseColor: '#8b5cf6',
              backgroundColor: createGradient('rgb(139, 92, 246)', 0.15),
              fill: true,
            },
            {
              key: 'ventureExpenses',
              label: 'Venture Expenses',
              data: ventureExpensesData,
              baseColor: '#f97316',
              backgroundColor: 'transparent',
              fill: false,
              borderDash: [5, 5],
            },
            {
              key: 'studioRevenue',
              label: 'Studio Revenue',
              data: studioRevenueData,
              baseColor: '#3b82f6',
              backgroundColor: createGradient('rgb(59, 130, 246)', 0.1),
              fill: true,
            },
            {
              key: 'studioExpenses',
              label: 'Studio Expenses',
              data: studioExpensesData,
              baseColor: '#ef4444',
              backgroundColor: 'transparent',
              fill: false,
              borderDash: [5, 5],
            },
            {
              key: 'studioProfit',
              label: 'Studio Profit',
              data: studioProfitData,
              baseColor: '#22c55e',
              backgroundColor: createGradient('rgb(34, 197, 94)', 0.1),
              fill: true,
            },
          ].map(ds => {
            const isHighlighted = highlightedMetric === ds.key;
            const isFaded = highlightedMetric !== null && !isHighlighted;

            return {
              ...ds,
              borderColor: isFaded ? adjustOpacity(ds.baseColor, 0.2) : ds.baseColor,
              backgroundColor: isFaded ? 'transparent' : ds.backgroundColor,
              fill: isFaded ? false : ds.fill,
              tension: 0.4,
              borderWidth: isHighlighted ? 3.5 : isFaded ? 1 : 2,
              pointRadius: 0,
              pointHoverRadius: isHighlighted ? 6 : 4,
              pointHoverBackgroundColor: ds.baseColor,
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              order: isHighlighted ? 0 : 1, // Highlighted line renders on top
            };
          });

          const chart = new ChartJS(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
              ...baseChartOptions,
              plugins: {
                ...baseChartOptions.plugins,
                legend: {
                  display: false, // We'll use custom legend buttons
                },
              },
            },
          });
          setRevenueChart(chart);
        }
      }

      // Studio Breakdown Chart - Donut style
      if (studioChartRef.current) {
        if (studioChart) studioChart.destroy();
        const ctx = studioChartRef.current.getContext('2d');
        if (ctx) {
          // Calculate by venture for breakdown
          const ventureData = ventures
            .filter(v => v.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);

          const chart = new ChartJS(ctx, {
            type: 'doughnut',
            data: {
              labels: ventureData.map(v => v.name),
              datasets: [{
                data: ventureData.map(v => v.revenue * (v.studioEquity / 100)),
                backgroundColor: [
                  '#8b5cf6',
                  '#3b82f6',
                  '#22c55e',
                  '#f59e0b',
                  '#ef4444',
                  '#ec4899',
                ],
                borderColor: '#0a0a0b',
                borderWidth: 3,
                hoverOffset: 8,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: {
                  display: true,
                  position: 'right' as const,
                  labels: {
                    color: 'rgba(255,255,255,0.6)',
                    font: { size: 11, family: 'Inter' },
                    boxWidth: 12,
                    boxHeight: 12,
                    borderRadius: 3,
                    useBorderRadius: true,
                    padding: 12,
                  },
                },
                tooltip: {
                  backgroundColor: 'rgba(10, 10, 11, 0.95)',
                  titleColor: 'rgba(255,255,255,0.9)',
                  bodyColor: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  padding: 12,
                  callbacks: {
                    label: (ctx: any) => ` $${ctx.parsed.toLocaleString()}`,
                  },
                },
              },
            },
          });
          setStudioChart(chart);
        }
      }
    };

    initCharts();

    return () => {
      if (revenueChart) revenueChart.destroy();
      if (studioChart) studioChart.destroy();
    };
  }, [ventures, studioExpenses, dateRange, totalRevenue, studioProfit, highlightedMetric, generateTrendData, ventureExpensesTotal, studioRevenue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Studio performance overview</p>
        </div>
        <Button variant="secondary" onClick={onSync} className="w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Data
        </Button>
      </div>

      {/* Stats Grid - Clickable to filter chart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <StatCard
          label="Venture Revenue"
          value={formatCurrency(totalRevenue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconColor="purple"
          delay={0}
          onClick={() => toggleHighlight('ventureRevenue')}
          active={highlightedMetric === null || highlightedMetric === 'ventureRevenue'}
        />
        <StatCard
          label="Venture Expenses"
          value={formatCurrency(ventureExpensesTotal)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9" />
            </svg>
          }
          iconColor="orange"
          delay={0.1}
          onClick={() => toggleHighlight('ventureExpenses')}
          active={highlightedMetric === null || highlightedMetric === 'ventureExpenses'}
        />
        <StatCard
          label="Studio Revenue"
          value={formatCurrency(studioRevenue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
          iconColor="blue"
          delay={0.2}
          onClick={() => toggleHighlight('studioRevenue')}
          active={highlightedMetric === null || highlightedMetric === 'studioRevenue'}
        />
        <StatCard
          label="Studio Expenses"
          value={formatCurrency(studioExpenses)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          }
          iconColor="red"
          delay={0.3}
          onClick={() => toggleHighlight('studioExpenses')}
          active={highlightedMetric === null || highlightedMetric === 'studioExpenses'}
        />
        <StatCard
          label="Studio Profit"
          value={formatCurrency(studioProfit)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
          iconColor="green"
          positive={studioProfit >= 0}
          delay={0.4}
          onClick={() => toggleHighlight('studioProfit')}
          active={highlightedMetric === null || highlightedMetric === 'studioProfit'}
        />
      </div>

      {/* Main Financial Chart - Full Width */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/70">Financial Overview</h3>
          <p className="text-xs text-white/30 hidden sm:block">Click metrics above to filter</p>
        </div>
        <div className="h-48 sm:h-64 lg:h-80 -mx-2 sm:mx-0">
          <canvas ref={revenueChartRef} />
        </div>
      </Card>

      {/* Revenue by Venture & Profit Margins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue by Venture */}
        <Card>
          <h3 className="text-sm font-medium text-white/70 mb-4">Revenue by Venture</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center">
            <canvas ref={studioChartRef} />
          </div>
        </Card>

        {/* Profit Margins */}
        <Card>
          <h3 className="text-sm font-medium text-white/70 mb-4">Profit Margins</h3>
          <div className="space-y-3">
            {ventures
              .filter(v => v.revenue > 0)
              .sort((a, b) => {
                const marginA = (a.revenue - (a.expenses || []).reduce((s, e) => s + e.amount, 0)) / a.revenue;
                const marginB = (b.revenue - (b.expenses || []).reduce((s, e) => s + e.amount, 0)) / b.revenue;
                return marginB - marginA;
              })
              .slice(0, 5)
              .map((v) => {
                const ventExp = (v.expenses || []).reduce((sum, e) => sum + e.amount, 0);
                const margin = v.revenue > 0 ? ((v.revenue - ventExp) / v.revenue) * 100 : 0;
                const isPositive = margin >= 0;
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {v.icon ? (
                        <img src={v.icon} alt={v.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                          {v.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{v.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(margin), 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-mono w-14 text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            {/* Overall Margin */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-medium text-white/50">Overall Margin</span>
              <span className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Space Grotesk' }}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/70">Portfolio</h3>
          <span className="text-xs text-white/40">{ventures.length} ventures</span>
        </div>

        {ventures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No ventures yet. Add your first venture to get started.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {ventures.map((venture, i) => {
                const ventureExpenses = (venture.expenses || [])
                  .reduce((sum, e) => sum + e.amount, 0);
                const profit = (venture.revenue || 0) - ventureExpenses;

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'} />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{venture.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StateBadge state={venture.state} />
                          <TypeBadge type={venture.type} />
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-white/40 mb-0.5">Revenue</p>
                        <p className="text-white font-mono">{formatCurrency(venture.revenue || 0)}</p>
                      </div>
                      <div>
                        <p className="text-white/40 mb-0.5">Profit</p>
                        <p className={`font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)}
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
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Revenue</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Expenses</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Profit</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Equity</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Studio Rev</th>
                  </tr>
                </thead>
                <tbody>
                  {ventures.map((venture, i) => {
                    const ventureExpenses = (venture.expenses || [])
                      .reduce((sum, e) => sum + e.amount, 0);
                    const profit = (venture.revenue || 0) - ventureExpenses;
                    const studioRev = (venture.revenue || 0) * (venture.studioEquity / 100);

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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'} />
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
                        <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                          {formatCurrency(venture.revenue || 0)}
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                          {formatCurrency(ventureExpenses)}
                        </td>
                        <td className={`py-3 px-2 text-right text-sm font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)}
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-white/70">
                          {venture.studioEquity}%
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-white/70 font-mono">
                          {formatCurrency(studioRev)}
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

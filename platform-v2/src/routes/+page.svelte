<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { ventures } from '$lib/stores/ventures';
  import { studioExpenses } from '$lib/stores/expenses';
  import { formatCurrency, formatDateRange, getDateRange } from '$lib/utils/format';
  import { syncAllVentures } from '$lib/utils/api';
  import { toast } from '$lib/stores/toast';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StateBadge from '$lib/components/ui/StateBadge.svelte';
  import { goto } from '$app/navigation';
  import {
    DollarSign,
    Building2,
    Wallet,
    TrendingUp,
    RefreshCw,
    Smartphone,
    Gamepad2
  } from 'lucide-svelte';

  let dateRange = $state<7 | 30 | 'all'>(7);
  let syncing = $state(false);

  // Computed stats
  let stats = $derived.by(() => {
    const { start, end } = getDateRange(dateRange);
    let totalRevenue = 0;
    let totalExpenses = 0;
    let studioRevenue = 0;

    $ventures.forEach(v => {
      const ventureExpenses = v.expenses
        .filter(e => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      totalRevenue += v.revenue || 0;
      totalExpenses += ventureExpenses;
      studioRevenue += (v.revenue || 0) * (v.studioEquity / 100);
    });

    const studioExpenseTotal = $studioExpenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    totalExpenses += studioExpenseTotal;
    const studioProfit = studioRevenue - studioExpenseTotal;

    return { totalRevenue, studioRevenue, totalExpenses, studioProfit };
  });

  let dateRangeDisplay = $derived.by(() => {
    if (dateRange === 'all') return 'All Time';
    const { start, end } = getDateRange(dateRange);
    return formatDateRange(start, end);
  });

  async function handleSync() {
    syncing = true;
    const result = await syncAllVentures();
    syncing = false;

    if (result.errors > 0) {
      toast.show(`Synced ${result.updated} ventures, ${result.errors} errors`, 'error');
    } else if (result.updated > 0) {
      toast.show(`Synced ${result.updated} ventures successfully`, 'success');
    } else {
      toast.show('No API-connected ventures to sync', 'error');
    }
  }

  function goToVenture(id: string) {
    goto(`/ventures/${id}`);
  }
</script>

<div class="animate-fade-in">
  <!-- Filter Bar -->
  <div class="flex justify-between items-center mb-6 p-1.5 bg-white/[0.025] rounded-2xl border border-white/[0.05]">
    <div class="flex gap-1">
      {#each [7, 30, 'all'] as range}
        <button
          onclick={() => dateRange = range as typeof dateRange}
          class="px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 {dateRange === range ? 'bg-indigo-500 text-white' : 'text-white/45 hover:text-white hover:bg-white/5'}"
        >
          {range === 'all' ? 'All Time' : `${range} Days`}
        </button>
      {/each}
    </div>
    <div class="px-4 text-xs text-white/45">
      {dateRangeDisplay}
    </div>
  </div>

  <!-- Header -->
  <div class="flex justify-between items-start mb-7">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p class="text-sm text-white/45 mt-1">Studio performance overview</p>
    </div>
    <Button variant="secondary" onclick={handleSync} disabled={syncing}>
      <RefreshCw size={16} class={syncing ? 'animate-spin' : ''} />
      {syncing ? 'Syncing...' : 'Sync Data'}
    </Button>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-4 gap-4 mb-7">
    <StatCard
      label="Total Revenue"
      value={formatCurrency(stats.totalRevenue)}
      icon={DollarSign}
      color="purple"
    />
    <StatCard
      label="Studio Revenue"
      value={formatCurrency(stats.studioRevenue)}
      icon={Building2}
      color="blue"
    />
    <StatCard
      label="Total Expenses"
      value={formatCurrency(stats.totalExpenses)}
      icon={Wallet}
      color="red"
    />
    <StatCard
      label="Studio Profit"
      value={formatCurrency(stats.studioProfit)}
      icon={TrendingUp}
      color="green"
      valueClass={stats.studioProfit >= 0 ? 'text-green-400' : 'text-red-400'}
    />
  </div>

  <!-- Portfolio Table -->
  <Card>
    <div class="flex justify-between items-center px-6 py-5 border-b border-white/[0.05]">
      <h3 class="font-semibold">Portfolio</h3>
      <span class="text-xs text-white/45 bg-white/[0.035] px-2.5 py-1 rounded-full">
        {$ventures.length} ventures
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-black/20">
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Venture</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Type</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">State</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Revenue</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Expenses</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Profit</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Studio %</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Studio Rev</th>
          </tr>
        </thead>
        <tbody>
          {#if $ventures.length === 0}
            <tr>
              <td colspan="8" class="text-center py-12 text-white/45 text-sm">
                No ventures yet. Add your first venture to get started.
              </td>
            </tr>
          {:else}
            {#each $ventures as venture}
              {@const expenses = venture.expenses.reduce((sum, e) => sum + e.amount, 0)}
              {@const profit = (venture.revenue || 0) - expenses}
              {@const studioRev = (venture.revenue || 0) * (venture.studioEquity / 100)}
              <tr
                class="border-t border-white/[0.05] hover:bg-white/[0.02] cursor-pointer transition-colors"
                onclick={() => goToVenture(venture.id)}
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border {!venture.icon ? 'bg-gradient-to-br' : ''} {venture.type === 'game' && !venture.icon ? 'from-amber-500/20 to-orange-500/25' : ''} {venture.type === 'app' && !venture.icon ? 'from-blue-500/20 to-indigo-500/25' : ''} {venture.type === 'game' ? 'border-amber-500/20' : 'border-blue-500/20'}"
                    >
                      {#if venture.icon}
                        <img src={venture.icon} alt={venture.name} class="w-full h-full object-cover" />
                      {:else if venture.type === 'game'}
                        <Gamepad2 size={16} class="text-amber-300" />
                      {:else}
                        <Smartphone size={16} class="text-blue-300" />
                      {/if}
                    </div>
                    <span class="text-sm font-medium text-white">{venture.name}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge variant={venture.type === 'game' ? 'orange' : 'blue'}>
                    {venture.type === 'game' ? 'Game' : 'App'}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <StateBadge state={venture.state} />
                </td>
                <td class="px-6 py-4 text-sm font-mono">{formatCurrency(venture.revenue || 0)}</td>
                <td class="px-6 py-4 text-sm font-mono">{formatCurrency(expenses)}</td>
                <td class="px-6 py-4 text-sm font-mono" class:text-green-400={profit >= 0} class:text-red-400={profit < 0}>
                  {formatCurrency(profit)}
                </td>
                <td class="px-6 py-4 text-sm">{venture.studioEquity}%</td>
                <td class="px-6 py-4 text-sm font-mono">{formatCurrency(studioRev)}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </Card>
</div>

<script lang="ts">
  import type { Venture } from '$lib/stores/ventures';
  import { settings } from '$lib/stores/settings';
  import { formatCurrency } from '$lib/utils/format';
  import Badge from './ui/Badge.svelte';
  import StateBadge from './ui/StateBadge.svelte';
  import { Smartphone, Gamepad2 } from 'lucide-svelte';

  interface Props {
    venture: Venture;
    onclick?: () => void;
  }

  let { venture, onclick }: Props = $props();

  let ventureExpenses = $derived(venture.expenses.reduce((sum, e) => sum + e.amount, 0));
  let profit = $derived((venture.revenue || 0) - ventureExpenses);

  // API status
  let apiStatus = $derived.by(() => {
    if (venture.state === 'building' || venture.state === 'killed') {
      return { status: 'disabled', text: 'API disabled' };
    }
    if (venture.type === 'game') {
      if (venture.bundleId && $settings.applovinApiKey) {
        return { status: 'connected', text: 'AppLovin' };
      }
      return { status: 'disconnected', text: 'Not configured' };
    }
    if (venture.superwallKey) {
      return { status: 'connected', text: 'Superwall' };
    }
    return { status: 'disconnected', text: 'Not configured' };
  });
</script>

<button
  {onclick}
  class="relative w-full text-left bg-gradient-to-br from-white/[0.025] to-white/[0.015] border border-white/[0.05] rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-500/10 group"
>
  <!-- Top gradient line on hover -->
  <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

  <!-- Glow effect on hover -->
  <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border {!venture.icon ? 'bg-gradient-to-br' : 'bg-white/5'} {venture.type === 'game' && !venture.icon ? 'from-amber-500/20 to-orange-500/25' : ''} {venture.type === 'app' && !venture.icon ? 'from-blue-500/20 to-indigo-500/25' : ''} {venture.type === 'game' ? 'border-amber-500/20' : 'border-blue-500/20'} {venture.icon ? 'border-white/10' : ''}"
      >
        {#if venture.icon}
          <img src={venture.icon} alt={venture.name} class="w-full h-full object-cover" />
        {:else if venture.type === 'game'}
          <Gamepad2 size={24} class="text-amber-300" />
        {:else}
          <Smartphone size={24} class="text-blue-300" />
        {/if}
      </div>

      <div class="flex gap-1.5">
        <Badge variant={venture.type === 'game' ? 'orange' : 'blue'}>
          {venture.type === 'game' ? 'Game' : 'App'}
        </Badge>
        <StateBadge state={venture.state} />
      </div>
    </div>

    <!-- Info -->
    <h3 class="text-lg font-semibold text-white mb-1">{venture.name}</h3>
    <p class="text-xs text-white/45 mb-1">
      {venture.type === 'game' ? 'Mobile Game' : 'Consumer App'}
    </p>

    <!-- API Status -->
    <div class="flex items-center gap-1.5 text-[11px] mt-2 {apiStatus.status === 'connected' ? 'text-green-400' : apiStatus.status === 'disconnected' ? 'text-red-400' : 'text-white/45'}">
      <span class="w-1.5 h-1.5 rounded-full {apiStatus.status === 'connected' ? 'bg-green-400 shadow-md shadow-green-400' : apiStatus.status === 'disconnected' ? 'bg-red-400' : 'bg-white/45'}"></span>
      {apiStatus.text}
    </div>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 border-t border-white/[0.05] bg-black/20">
    <div class="p-4 text-center border-r border-white/[0.05]">
      <div class="text-[10px] text-white/45 uppercase tracking-wider mb-1">
        {venture.type === 'game' ? 'Revenue' : 'Proceeds'}
      </div>
      <div class="font-mono text-xl font-semibold text-white">
        {formatCurrency(venture.revenue || 0)}
      </div>
    </div>
    <div class="p-4 text-center">
      <div class="text-[10px] text-white/45 uppercase tracking-wider mb-1">Profit</div>
      <div class="font-mono text-xl font-semibold"
        class:text-green-400={profit >= 0}
        class:text-red-400={profit < 0}
      >
        {formatCurrency(profit)}
      </div>
    </div>
  </div>
</button>

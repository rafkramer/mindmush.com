<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { ComponentType } from 'svelte';

  interface Props {
    label: string;
    value: string;
    icon?: ComponentType;
    color?: 'purple' | 'green' | 'red' | 'orange' | 'blue';
    valueClass?: string;
    subtitle?: string;
  }

  let { label, value, icon: Icon, color = 'purple', valueClass = '', subtitle = '' }: Props = $props();

  const colors = {
    purple: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/15 text-indigo-300',
    green: 'bg-gradient-to-br from-green-500/20 to-emerald-500/15 text-green-300',
    red: 'bg-gradient-to-br from-red-500/20 to-rose-500/15 text-red-300',
    orange: 'bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-amber-300',
    blue: 'bg-gradient-to-br from-blue-500/20 to-sky-500/15 text-blue-300'
  };
</script>

<div class="relative bg-gradient-to-br from-white/[0.025] to-white/[0.015] border border-white/[0.05] rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:border-white/[0.08] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group">
  <!-- Shine effect -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>

  <div class="flex items-start gap-4">
    {#if Icon}
      <div class={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', colors[color])}>
        <Icon size={22} />
      </div>
    {/if}

    <div class="flex-1 min-w-0">
      <p class="text-xs font-medium text-white/45 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p class={cn('font-mono text-2xl font-semibold tracking-tight', valueClass)}>
        {value}
      </p>
      {#if subtitle}
        <p class="text-[11px] text-white/45 mt-1">{subtitle}</p>
      {/if}
    </div>
  </div>
</div>

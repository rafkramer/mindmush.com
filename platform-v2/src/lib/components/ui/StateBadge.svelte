<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    state: 'building' | 'live' | 'scaling' | 'passive' | 'killed';
    class?: string;
  }

  let { state, class: className = '' }: Props = $props();

  const states = {
    building: 'bg-blue-500/15 text-blue-400',
    live: 'bg-green-500/12 text-green-400',
    scaling: 'bg-indigo-500/15 text-indigo-400',
    passive: 'bg-amber-500/12 text-amber-400',
    killed: 'bg-red-500/12 text-red-400'
  };

  const labels = {
    building: 'Building',
    live: 'Live',
    scaling: 'Scaling',
    passive: 'Passive',
    killed: 'Killed'
  };
</script>

<span
  class={cn(
    'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
    states[state],
    className
  )}
>
  {labels[state]}
</span>

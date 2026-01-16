<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    variant?: 'default' | 'purple' | 'green' | 'orange' | 'blue' | 'red';
    class?: string;
  }

  let { variant = 'default', class: className = '', children }: Props & { children?: any } = $props();

  const variants = {
    default: 'bg-white/[0.035] text-white/75',
    purple: 'bg-indigo-500/15 text-indigo-400',
    green: 'bg-green-500/12 text-green-400',
    orange: 'bg-amber-500/12 text-amber-400',
    blue: 'bg-blue-500/15 text-blue-400',
    red: 'bg-red-500/12 text-red-400'
  };
</script>

<span
  class={cn(
    'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
    variants[variant],
    className
  )}
>
  {@render children?.()}
</span>

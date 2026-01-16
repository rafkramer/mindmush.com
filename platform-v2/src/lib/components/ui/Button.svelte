<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
  }

  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    disabled = false,
    type = 'button',
    onclick,
    children
  }: Props & { children?: any } = $props();

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5',
    secondary: 'bg-white/[0.025] text-white/75 border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] hover:text-white',
    ghost: 'bg-transparent text-white/45 hover:bg-white/[0.025] hover:text-white',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500'
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };
</script>

<button
  {type}
  {disabled}
  class={cn(
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  )}
  onclick={onclick}
>
  {@render children?.()}
</button>

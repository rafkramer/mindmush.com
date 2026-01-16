<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    type?: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    hint?: string;
    required?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    class?: string;
    id?: string;
    min?: number;
    max?: number;
    oninput?: (e: Event) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label = '',
    hint = '',
    required = false,
    readonly = false,
    disabled = false,
    class: className = '',
    id = '',
    min,
    max,
    oninput
  }: Props = $props();
</script>

<div class="space-y-2">
  {#if label}
    <label for={id} class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">
      {label}
    </label>
  {/if}

  <input
    {type}
    {id}
    {placeholder}
    {required}
    {readonly}
    {disabled}
    {min}
    {max}
    bind:value
    {oninput}
    class={cn(
      'w-full px-4 py-3.5 bg-white/[0.035] border border-white/[0.05] rounded-xl text-white text-sm',
      'placeholder:text-white/45 transition-all duration-200',
      'hover:border-white/[0.08]',
      'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white/[0.06]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'read-only:opacity-70',
      className
    )}
  />

  {#if hint}
    <p class="text-[11px] text-white/45">{hint}</p>
  {/if}
</div>

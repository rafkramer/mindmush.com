<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options: Option[];
    label?: string;
    class?: string;
    id?: string;
    onchange?: (e: Event) => void;
  }

  let {
    value = $bindable(''),
    options,
    label = '',
    class: className = '',
    id = '',
    onchange
  }: Props = $props();
</script>

<div class="space-y-2">
  {#if label}
    <label for={id} class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">
      {label}
    </label>
  {/if}

  <select
    {id}
    bind:value
    {onchange}
    class={cn(
      'w-full px-4 py-3.5 bg-white/[0.035] border border-white/[0.05] rounded-xl text-white text-sm',
      'cursor-pointer appearance-none transition-all duration-200',
      'hover:border-white/[0.08]',
      'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25',
      'bg-no-repeat bg-right-4',
      className
    )}
    style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27rgba(255,255,255,0.4)%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27%3E%3C/path%3E%3C/svg%3E'); background-position: right 12px center; background-size: 16px; padding-right: 40px;"
  >
    {#each options as option}
      <option value={option.value} class="bg-[#0a0a0a] text-white">
        {option.label}
      </option>
    {/each}
  </select>
</div>

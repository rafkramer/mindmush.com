<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    onclose: () => void;
  }

  let { open = $bindable(false), title = '', size = 'md', onclose, children }: Props & { children?: any } = $props();

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-6"
    transition:fade={{ duration: 150 }}
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div
      class={cn(
        'relative w-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]',
        sizes[size]
      )}
      transition:fly={{ y: 20, duration: 200 }}
    >
      <!-- Header -->
      {#if title}
        <div class="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <h3 class="text-lg font-semibold text-white">{title}</h3>
          <button
            onclick={onclose}
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.035] text-white/45 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>
      {/if}

      <!-- Content -->
      {@render children?.()}
    </div>
  </div>
{/if}

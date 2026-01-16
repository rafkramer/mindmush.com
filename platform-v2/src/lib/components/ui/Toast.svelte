<script lang="ts">
  import { toast } from '$lib/stores/toast';
  import { fly } from 'svelte/transition';
  import { CheckCircle, AlertCircle } from 'lucide-svelte';
</script>

<div class="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
  {#each $toast as item (item.id)}
    <div
      class="flex items-center gap-3 px-5 py-3.5 bg-[#0a0a0a] border rounded-xl shadow-2xl min-w-[300px] {item.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'}"
      transition:fly={{ x: 100, duration: 200 }}
    >
      {#if item.type === 'success'}
        <CheckCircle size={20} class="text-green-400 shrink-0" />
      {:else}
        <AlertCircle size={20} class="text-red-400 shrink-0" />
      {/if}
      <span class="text-sm text-white/90">{item.message}</span>
    </div>
  {/each}
</div>

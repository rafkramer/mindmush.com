<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';

  let { children } = $props();

  // Auth guard
  $effect(() => {
    if (browser && !$auth.currentUser && page.url.pathname !== '/login') {
      goto('/login');
    }
  });

  let isLoginPage = $derived(page.url.pathname === '/login');
</script>

<!-- Background effects -->
<div class="noise"></div>
<div class="glow glow-1"></div>
<div class="glow glow-2"></div>

{#if isLoginPage}
  {@render children()}
{:else if $auth.currentUser}
  <div class="min-h-screen">
    <Sidebar />
    <main class="ml-[260px] p-8 min-h-screen">
      {@render children()}
    </main>
  </div>
{/if}

<Toast />

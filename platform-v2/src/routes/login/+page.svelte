<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { ArrowRight } from 'lucide-svelte';

  let username = $state('');
  let password = $state('');
  let error = $state(false);
  let loading = $state(false);

  // Redirect if already logged in
  $effect(() => {
    if (browser && $auth.currentUser) {
      goto('/');
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = false;
    loading = true;

    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));

    const success = auth.login(username, password);

    if (success) {
      goto('/');
    } else {
      error = true;
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-6 relative z-10">
  <div class="w-full max-w-md animate-fade-in-up">
    <div class="relative bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-12 shadow-2xl shadow-black/50">
      <!-- Top accent line -->
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

      <!-- Logo -->
      <div class="mb-2">
        <span class="text-[11px] font-bold tracking-[0.3em] text-indigo-400">MINDMUSH</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-semibold tracking-tight bg-gradient-to-b from-white to-white/75 bg-clip-text text-transparent mb-8">
        Platform
      </h1>

      <!-- Error message -->
      {#if error}
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 animate-shake">
          Invalid username or password
        </div>
      {/if}

      <!-- Form -->
      <form onsubmit={handleSubmit} class="space-y-5">
        <Input
          id="username"
          label="Username"
          placeholder="Enter username"
          bind:value={username}
          required
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter password"
          bind:value={password}
          required
        />

        <Button type="submit" class="w-full mt-6" disabled={loading}>
          {#if loading}
            <span class="animate-pulse">Signing in...</span>
          {:else}
            <span>Sign In</span>
            <ArrowRight size={16} />
          {/if}
        </Button>
      </form>
    </div>
  </div>
</div>

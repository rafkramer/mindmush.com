<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { toast } from '$lib/stores/toast';
  import { testApplovinApi } from '$lib/utils/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { Eye, EyeOff, Layers, LayoutGrid } from 'lucide-svelte';

  let apiKey = $state($settings.applovinApiKey);
  let showKey = $state(false);
  let testing = $state(false);
  let apiStatus = $state<'none' | 'connected' | 'error'>($settings.applovinApiKey ? 'connected' : 'none');

  async function testConnection() {
    if (!apiKey) {
      toast.show('Please enter an API key first', 'error');
      return;
    }

    testing = true;
    const result = await testApplovinApi(apiKey);
    testing = false;

    if (result.success) {
      apiStatus = 'connected';
      toast.show('API connection successful', 'success');
    } else {
      apiStatus = 'error';
      toast.show(`API error: ${result.error}`, 'error');
    }
  }

  function saveKey() {
    settings.update({ applovinApiKey: apiKey });
    toast.show('AppLovin API key saved', 'success');
  }
</script>

<div class="animate-fade-in">
  <!-- Header -->
  <div class="mb-7">
    <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
    <p class="text-sm text-white/45 mt-1">API Configuration</p>
  </div>

  <div class="space-y-5">
    <!-- AppLovin Card -->
    <div class="bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/[0.08] transition-all">
      <div class="flex items-center gap-5 p-6 border-b border-white/[0.05]">
        <div class="w-14 h-14 rounded-xl bg-amber-500/12 flex items-center justify-center">
          <Layers size={28} class="text-amber-400" />
        </div>

        <div class="flex-1">
          <h3 class="text-lg font-semibold">AppLovin MAX</h3>
          <p class="text-sm text-white/45">Global API key for all mobile games. Revenue fetched by Bundle ID.</p>
        </div>

        <div class="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl">
          <span class="w-2 h-2 rounded-full {apiStatus === 'connected' ? 'bg-green-400 shadow-lg shadow-green-400' : apiStatus === 'error' ? 'bg-red-400' : 'bg-white/45'}"></span>
          <span class="text-xs {apiStatus === 'connected' ? 'text-green-400' : apiStatus === 'error' ? 'text-red-400' : 'text-white/45'}">
            {apiStatus === 'none' ? 'Not configured' : apiStatus === 'connected' ? 'Connected' : 'Connection failed'}
          </span>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-2 mb-5">
          <label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">
            Report Key
          </label>
          <div class="relative">
            <input
              type={showKey ? 'text' : 'password'}
              class="w-full px-4 py-3.5 pr-12 bg-white/[0.035] border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
              placeholder="Enter your AppLovin Report Key"
              bind:value={apiKey}
            />
            <button
              onclick={() => showKey = !showKey}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
            >
              {#if showKey}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <Button variant="secondary" onclick={testConnection} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onclick={saveKey}>
            Save Key
          </Button>
        </div>
      </div>
    </div>

    <!-- Superwall Card -->
    <div class="bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden opacity-70">
      <div class="flex items-center gap-5 p-6 border-b border-white/[0.05]">
        <div class="w-14 h-14 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <LayoutGrid size={28} class="text-indigo-400" />
        </div>

        <div class="flex-1">
          <h3 class="text-lg font-semibold">Superwall</h3>
          <p class="text-sm text-white/45">API keys configured per consumer app. Each app has its own key for proceeds tracking.</p>
        </div>
      </div>

      <div class="p-6">
        <p class="text-sm text-white/45 px-4 py-3 bg-white/[0.035] rounded-xl">
          Superwall API keys are set individually when creating or editing a consumer app venture.
        </p>
      </div>
    </div>
  </div>
</div>

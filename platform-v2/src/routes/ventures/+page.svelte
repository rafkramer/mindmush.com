<script lang="ts">
  import { ventures, type Venture } from '$lib/stores/ventures';
  import { settings } from '$lib/stores/settings';
  import { toast } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import VentureCard from '$lib/components/VentureCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { Plus, Smartphone, Gamepad2 } from 'lucide-svelte';

  let stateFilter = $state<Venture['state'] | 'all'>('all');
  let showAddModal = $state(false);

  // Form state
  let newVenture = $state({
    name: '',
    type: 'app' as 'app' | 'game',
    state: 'building' as Venture['state'],
    revenue: 0,
    studioEquity: 100,
    bundleId: '',
    superwallKey: '',
    icon: ''
  });

  let filteredVentures = $derived(
    stateFilter === 'all'
      ? $ventures
      : $ventures.filter(v => v.state === stateFilter)
  );

  const stateOptions = [
    { value: 'all', label: 'All' },
    { value: 'building', label: 'Building' },
    { value: 'live', label: 'Live' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'passive', label: 'Passive' },
    { value: 'killed', label: 'Killed' }
  ];

  const ventureStateOptions = [
    { value: 'building', label: 'Building (No API)' },
    { value: 'live', label: 'Live' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'passive', label: 'Passive' },
    { value: 'killed', label: 'Killed (No API)' }
  ];

  function handleIconUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newVenture.icon = event.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  function resetForm() {
    newVenture = {
      name: '',
      type: 'app',
      state: 'building',
      revenue: 0,
      studioEquity: 100,
      bundleId: '',
      superwallKey: '',
      icon: ''
    };
  }

  function addVenture() {
    if (!newVenture.name.trim()) {
      toast.show('Please enter a venture name', 'error');
      return;
    }

    ventures.add({
      name: newVenture.name.trim(),
      type: newVenture.type,
      state: newVenture.state,
      revenue: newVenture.revenue,
      studioEquity: Math.min(100, Math.max(0, newVenture.studioEquity)),
      bundleId: newVenture.type === 'game' ? newVenture.bundleId : undefined,
      superwallKey: newVenture.type === 'app' ? newVenture.superwallKey : undefined,
      icon: newVenture.icon || undefined
    });

    toast.show('Venture added successfully', 'success');
    showAddModal = false;
    resetForm();
  }

  function goToVenture(id: string) {
    goto(`/ventures/${id}`);
  }
</script>

<div class="animate-fade-in">
  <!-- Header -->
  <div class="flex justify-between items-start mb-7">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Ventures</h1>
      <p class="text-sm text-white/45 mt-1">Manage your portfolio</p>
    </div>
    <Button onclick={() => showAddModal = true}>
      <Plus size={16} />
      Add Venture
    </Button>
  </div>

  <!-- State Filter -->
  <div class="flex gap-2 mb-6 flex-wrap">
    {#each stateOptions as option}
      {@const isActive = stateFilter === option.value}
      <button
        onclick={() => stateFilter = option.value as typeof stateFilter}
        class="px-4 py-2 text-xs font-medium rounded-full border transition-all duration-200 {isActive ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/45 hover:border-white/20 hover:text-white'}"
      >
        {option.label}
      </button>
    {/each}
  </div>

  <!-- Ventures Grid -->
  {#if filteredVentures.length === 0}
    <div class="text-center py-16 text-white/45">
      <p>No ventures found. Add your first venture to get started.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each filteredVentures as venture (venture.id)}
        <VentureCard {venture} onclick={() => goToVenture(venture.id)} />
      {/each}
    </div>
  {/if}
</div>

<!-- Add Venture Modal -->
<Modal bind:open={showAddModal} title="Add New Venture" size="lg" onclose={() => showAddModal = false}>
  <div class="p-6 space-y-5">
    <!-- Icon & Name Row -->
    <div class="flex gap-4">
      <div>
        <label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Icon</label>
        <input type="file" accept="image/*" class="hidden" id="iconUpload" onchange={handleIconUpload} />
        <label
          for="iconUpload"
          class="w-20 h-20 rounded-2xl bg-white/[0.035] border-2 border-dashed border-white/[0.05] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
        >
          {#if newVenture.icon}
            <img src={newVenture.icon} alt="Icon" class="w-full h-full object-cover rounded-2xl" />
          {:else}
            <Plus size={20} class="text-white/45" />
            <span class="text-[9px] text-white/45 uppercase tracking-wider">Upload</span>
          {/if}
        </label>
      </div>
      <div class="flex-1">
        <Input
          id="ventureName"
          label="Venture Name"
          placeholder="Enter venture name"
          bind:value={newVenture.name}
        />
      </div>
    </div>

    <!-- Type Selector -->
    <div>
      <label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Type</label>
      <div class="grid grid-cols-2 gap-3">
        <label class="cursor-pointer">
          <input type="radio" bind:group={newVenture.type} value="app" class="hidden" />
          <div class="flex flex-col items-center gap-2 p-5 rounded-xl border transition-all {newVenture.type === 'app' ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/45'}">
            <Smartphone size={24} class={newVenture.type === 'app' ? 'text-indigo-400' : ''} />
            <span class="text-sm font-medium">Consumer App</span>
            <span class="text-[10px] uppercase tracking-wider {newVenture.type === 'app' ? 'text-indigo-400' : ''}">Superwall</span>
          </div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" bind:group={newVenture.type} value="game" class="hidden" />
          <div class="flex flex-col items-center gap-2 p-5 rounded-xl border transition-all {newVenture.type === 'game' ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/45'}">
            <Gamepad2 size={24} class={newVenture.type === 'game' ? 'text-indigo-400' : ''} />
            <span class="text-sm font-medium">Mobile Game</span>
            <span class="text-[10px] uppercase tracking-wider {newVenture.type === 'game' ? 'text-indigo-400' : ''}">AppLovin</span>
          </div>
        </label>
      </div>
    </div>

    <!-- State & Equity -->
    <div class="grid grid-cols-2 gap-4">
      <Select
        id="ventureState"
        label="State"
        options={ventureStateOptions}
        bind:value={newVenture.state}
      />
      <Input
        id="studioEquity"
        type="number"
        label="Studio Ownership (%)"
        placeholder="100"
        min={0}
        max={100}
        bind:value={newVenture.studioEquity}
      />
    </div>

    <!-- Revenue -->
    <Input
      id="revenue"
      type="number"
      label="Current Revenue ($)"
      placeholder="0"
      min={0}
      bind:value={newVenture.revenue}
      hint="Enter existing revenue if migrating from another tracking system."
    />

    <!-- API Config -->
    {#if newVenture.type === 'game'}
      <Input
        id="bundleId"
        label="Bundle ID"
        placeholder="com.studio.gamename"
        bind:value={newVenture.bundleId}
        hint="Required for AppLovin revenue tracking. Must match exactly."
      />
    {:else}
      <Input
        id="superwallKey"
        label="Superwall API Key"
        placeholder="pk_..."
        bind:value={newVenture.superwallKey}
        hint="Required for proceeds tracking. Get this from Superwall dashboard."
      />
    {/if}
  </div>

  <!-- Footer -->
  <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">
    <Button variant="ghost" onclick={() => { showAddModal = false; resetForm(); }}>
      Cancel
    </Button>
    <Button onclick={addVenture}>
      Add Venture
    </Button>
  </div>
</Modal>

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { ventures, type Venture, type VenturePartner } from '$lib/stores/ventures';
  import { auth } from '$lib/stores/auth';
  import { settings } from '$lib/stores/settings';
  import { toast } from '$lib/stores/toast';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { syncVenture } from '$lib/utils/api';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StateBadge from '$lib/components/ui/StateBadge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    ArrowLeft,
    RefreshCw,
    Edit,
    DollarSign,
    Wallet,
    TrendingUp,
    Building2,
    Plus,
    Trash2,
    Smartphone,
    Gamepad2
  } from 'lucide-svelte';

  let syncing = $state(false);
  let showEditModal = $state(false);
  let showExpenseModal = $state(false);

  // Get venture from URL param
  let venture = $derived(ventures.get(page.params.id));

  // Redirect if venture not found
  $effect(() => {
    if (!venture) {
      goto('/ventures');
    }
  });

  // Edit form state
  let editForm = $state<Partial<Venture>>({});

  // Expense form
  let newExpense = $state({ description: '', amount: 0 });

  // Computed values
  let ventureExpenses = $derived(venture?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0);
  let profit = $derived((venture?.revenue || 0) - ventureExpenses);
  let studioRev = $derived((venture?.revenue || 0) * ((venture?.studioEquity || 0) / 100));

  // API Status
  let apiStatus = $derived.by(() => {
    if (!venture) return { status: 'none', text: '' };
    if (venture.state === 'building' || venture.state === 'killed') {
      return { status: 'disabled', text: `API sync disabled for ${venture.state} ventures` };
    }
    if (venture.type === 'game') {
      if (venture.bundleId && $settings.applovinApiKey) {
        return { status: 'connected', text: `AppLovin API connected • Bundle: ${venture.bundleId}` };
      }
      if (!venture.bundleId) {
        return { status: 'disconnected', text: 'Bundle ID not configured' };
      }
      return { status: 'disconnected', text: 'AppLovin API key not configured in Settings' };
    }
    if (venture.superwallKey) {
      return { status: 'connected', text: 'Superwall API connected' };
    }
    return { status: 'disconnected', text: 'Superwall API key not configured' };
  });

  // Partners with users
  let partners = $derived.by(() => {
    if (!venture) return [];
    return venture.partners.map(p => {
      const user = auth.getUser(p.userId);
      return { ...p, username: user?.username || 'Unknown' };
    });
  });

  const ventureStateOptions = [
    { value: 'building', label: 'Building' },
    { value: 'live', label: 'Live' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'passive', label: 'Passive' },
    { value: 'killed', label: 'Killed' }
  ];

  const ventureTypeOptions = [
    { value: 'app', label: 'Consumer App' },
    { value: 'game', label: 'Mobile Game' }
  ];

  async function handleSync() {
    if (!venture) return;
    syncing = true;
    const result = await syncVenture(venture.id);
    syncing = false;

    if (result.success) {
      toast.show(`Revenue updated: ${formatCurrency(result.revenue || 0)}`, 'success');
    } else {
      toast.show(result.error || 'Sync failed', 'error');
    }
  }

  function openEditModal() {
    if (!venture) return;
    editForm = { ...venture };
    showEditModal = true;
  }

  function saveVenture() {
    if (!venture || !editForm.name?.trim()) {
      toast.show('Please enter a venture name', 'error');
      return;
    }

    ventures.update(venture.id, {
      name: editForm.name.trim(),
      type: editForm.type,
      state: editForm.state,
      revenue: editForm.revenue,
      studioEquity: Math.min(100, Math.max(0, editForm.studioEquity || 100)),
      bundleId: editForm.type === 'game' ? editForm.bundleId : undefined,
      superwallKey: editForm.type === 'app' ? editForm.superwallKey : undefined
    });

    toast.show('Venture updated successfully', 'success');
    showEditModal = false;
  }

  function deleteVenture() {
    if (!venture || !confirm('Are you sure you want to delete this venture?')) return;
    ventures.delete(venture.id);
    toast.show('Venture deleted', 'success');
    goto('/ventures');
  }

  function addExpense() {
    if (!venture || !newExpense.description.trim() || newExpense.amount <= 0) {
      toast.show('Please fill in all fields', 'error');
      return;
    }

    ventures.addExpense(venture.id, {
      description: newExpense.description.trim(),
      amount: newExpense.amount,
      date: new Date().toISOString()
    });

    toast.show('Expense added', 'success');
    showExpenseModal = false;
    newExpense = { description: '', amount: 0 };
  }

  function deleteExpense(expenseId: string) {
    if (!venture) return;
    ventures.deleteExpense(venture.id, expenseId);
    toast.show('Expense deleted', 'success');
  }
</script>

{#if venture}
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-5 mb-6">
      <button
        onclick={() => goto('/ventures')}
        class="w-11 h-11 rounded-xl bg-white/[0.025] border border-white/[0.05] flex items-center justify-center text-white/45 hover:bg-white/[0.04] hover:text-white transition-all"
      >
        <ArrowLeft size={20} />
      </button>

      <div class="w-16 h-16 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0 {!venture.icon ? 'bg-gradient-to-br' : 'bg-white/5'} {venture.type === 'game' && !venture.icon ? 'from-amber-500/20 to-orange-500/25' : ''} {venture.type === 'app' && !venture.icon ? 'from-blue-500/20 to-indigo-500/25' : ''} {venture.type === 'game' ? 'border-amber-500/20' : 'border-blue-500/20'} {venture.icon ? 'border-white/10' : ''}"
      >
        {#if venture.icon}
          <img src={venture.icon} alt={venture.name} class="w-full h-full object-cover" />
        {:else if venture.type === 'game'}
          <Gamepad2 size={28} class="text-amber-300" />
        {:else}
          <Smartphone size={28} class="text-blue-300" />
        {/if}
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl font-semibold">{venture.name}</h1>
          <Badge variant={venture.type === 'game' ? 'orange' : 'blue'}>
            {venture.type === 'game' ? 'Game' : 'App'}
          </Badge>
          <StateBadge state={venture.state} />
        </div>
        <p class="text-sm text-white/45 mt-1">
          {venture.type === 'game' ? 'Mobile Game' : 'Consumer App'}
        </p>
      </div>

      <div class="flex gap-2.5">
        <Button variant="secondary" onclick={handleSync} disabled={syncing}>
          <RefreshCw size={16} class={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
        <Button onclick={openEditModal}>
          <Edit size={16} />
          Edit
        </Button>
      </div>
    </div>

    <!-- API Status Banner -->
    <div class="px-5 py-4 rounded-xl mb-6 flex items-center gap-3 text-sm border {apiStatus.status === 'connected' ? 'bg-green-500/10 border-green-500/20 text-green-400' : apiStatus.status === 'disconnected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white/45'}">
      <span class="w-2 h-2 rounded-full shrink-0 {apiStatus.status === 'connected' ? 'bg-green-400 shadow-lg shadow-green-400' : apiStatus.status === 'disconnected' ? 'bg-red-400' : 'bg-white/45'}"></span>
      {apiStatus.text}
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <StatCard
        label={venture.type === 'game' ? 'Revenue' : 'Proceeds'}
        value={formatCurrency(venture.revenue || 0)}
        icon={DollarSign}
        color="purple"
      />
      <StatCard
        label="Expenses"
        value={formatCurrency(ventureExpenses)}
        icon={Wallet}
        color="red"
      />
      <StatCard
        label="Profit"
        value={formatCurrency(profit)}
        icon={TrendingUp}
        color="green"
        valueClass={profit >= 0 ? 'text-green-400' : 'text-red-400'}
      />
      <StatCard
        label="Studio Revenue"
        value={formatCurrency(studioRev)}
        icon={Building2}
        color="blue"
      />
    </div>

    <!-- Detail Grid -->
    <div class="grid grid-cols-2 gap-5">
      <!-- Partner Equity -->
      <Card>
        <div class="px-6 py-5 border-b border-white/[0.05]">
          <h3 class="font-semibold">Partner Equity</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-black/20">
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Partner</th>
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Equity</th>
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Share of Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-white/[0.05]">
                <td class="px-6 py-3.5 text-sm font-medium">Studio (MINDMUSH)</td>
                <td class="px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-white/[0.035] rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: {venture.studioEquity}%"></div>
                    </div>
                    <span class="text-sm font-medium text-indigo-400">{venture.studioEquity}%</span>
                  </div>
                </td>
                <td class="px-6 py-3.5 text-sm font-mono">{formatCurrency(profit * (venture.studioEquity / 100))}</td>
              </tr>
              {#each partners as partner}
                <tr class="border-t border-white/[0.05]">
                  <td class="px-6 py-3.5 text-sm">{partner.username}</td>
                  <td class="px-6 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="flex-1 h-1.5 bg-white/[0.035] rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: {partner.equity}%"></div>
                      </div>
                      <span class="text-sm font-medium text-indigo-400">{partner.equity}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-3.5 text-sm font-mono">{formatCurrency(profit * (partner.equity / 100))}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Expenses -->
      <Card>
        <div class="flex justify-between items-center px-6 py-5 border-b border-white/[0.05]">
          <h3 class="font-semibold">Venture Expenses</h3>
          <Button variant="secondary" size="sm" onclick={() => showExpenseModal = true}>
            <Plus size={14} />
            Add
          </Button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-black/20">
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Description</th>
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Amount</th>
                <th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {#if venture.expenses.length === 0}
                <tr>
                  <td colspan="4" class="text-center py-8 text-white/45 text-sm">
                    No expenses recorded.
                  </td>
                </tr>
              {:else}
                {#each venture.expenses as expense}
                  <tr class="border-t border-white/[0.05] group hover:bg-white/[0.02]">
                    <td class="px-6 py-3.5 text-sm">{expense.description}</td>
                    <td class="px-6 py-3.5 text-sm font-mono">{formatCurrency(expense.amount)}</td>
                    <td class="px-6 py-3.5 text-sm text-white/45">{formatDate(expense.date)}</td>
                    <td class="px-6 py-3.5">
                      <button
                        onclick={() => deleteExpense(expense.id)}
                        class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>

  <!-- Edit Modal -->
  <Modal bind:open={showEditModal} title="Edit Venture" size="lg" onclose={() => showEditModal = false}>
    <div class="p-6 space-y-5">
      <Input
        id="editName"
        label="Venture Name"
        bind:value={editForm.name}
      />

      <div class="grid grid-cols-2 gap-4">
        <Select
          id="editType"
          label="Type"
          options={ventureTypeOptions}
          bind:value={editForm.type}
        />
        <Select
          id="editState"
          label="State"
          options={ventureStateOptions}
          bind:value={editForm.state}
        />
      </div>

      {#if editForm.type === 'game'}
        <Input
          id="editBundleId"
          label="Bundle ID (for AppLovin)"
          placeholder="com.studio.gamename"
          bind:value={editForm.bundleId}
        />
      {:else}
        <Input
          id="editSuperwallKey"
          label="Superwall API Key"
          placeholder="pk_..."
          bind:value={editForm.superwallKey}
        />
      {/if}

      <div class="grid grid-cols-2 gap-4">
        <Input
          id="editEquity"
          type="number"
          label="Studio Ownership (%)"
          min={0}
          max={100}
          bind:value={editForm.studioEquity}
        />
        <Input
          id="editRevenue"
          type="number"
          label="Revenue ($)"
          min={0}
          bind:value={editForm.revenue}
        />
      </div>
    </div>

    <div class="flex justify-between px-6 py-5 border-t border-white/[0.05] bg-black/20">
      <Button variant="danger" onclick={deleteVenture}>
        Delete
      </Button>
      <div class="flex gap-3">
        <Button variant="ghost" onclick={() => showEditModal = false}>
          Cancel
        </Button>
        <Button onclick={saveVenture}>
          Save
        </Button>
      </div>
    </div>
  </Modal>

  <!-- Add Expense Modal -->
  <Modal bind:open={showExpenseModal} title="Add Venture Expense" onclose={() => showExpenseModal = false}>
    <div class="p-6 space-y-5">
      <Input
        id="expenseDesc"
        label="Description"
        placeholder="e.g., Marketing campaign"
        bind:value={newExpense.description}
      />
      <Input
        id="expenseAmount"
        type="number"
        label="Amount ($)"
        placeholder="0"
        min={0}
        bind:value={newExpense.amount}
      />
    </div>

    <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">
      <Button variant="ghost" onclick={() => showExpenseModal = false}>
        Cancel
      </Button>
      <Button onclick={addExpense}>
        Add Expense
      </Button>
    </div>
  </Modal>
{/if}

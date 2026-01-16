<script lang="ts">
  import { studioExpenses, type StudioExpense } from '$lib/stores/expenses';
  import { toast } from '$lib/stores/toast';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { Plus, Wallet, Calendar, Trash2 } from 'lucide-svelte';

  let showAddModal = $state(false);

  let newExpense = $state({
    description: '',
    category: 'operations' as StudioExpense['category'],
    amount: 0
  });

  const categoryOptions = [
    { value: 'operations', label: 'Operations' },
    { value: 'salaries', label: 'Salaries' },
    { value: 'tools', label: 'Tools & Software' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' }
  ];

  function addExpense() {
    if (!newExpense.description.trim() || newExpense.amount <= 0) {
      toast.show('Please fill in all fields', 'error');
      return;
    }

    studioExpenses.add({
      description: newExpense.description.trim(),
      category: newExpense.category,
      amount: newExpense.amount,
      date: new Date().toISOString()
    });

    toast.show('Studio cost added', 'success');
    showAddModal = false;
    newExpense = { description: '', category: 'operations', amount: 0 };
  }

  function deleteExpense(id: string) {
    studioExpenses.delete(id);
    toast.show('Expense deleted', 'success');
  }
</script>

<div class="animate-fade-in">
  <!-- Header -->
  <div class="flex justify-between items-start mb-7">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Studio</h1>
      <p class="text-sm text-white/45 mt-1">Operating costs & overhead</p>
    </div>
    <Button onclick={() => showAddModal = true}>
      <Plus size={16} />
      Add Expense
    </Button>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 gap-4 mb-7">
    <StatCard
      label="Total Studio Costs"
      value={formatCurrency($studioExpenses.total)}
      icon={Wallet}
      color="red"
    />
    <StatCard
      label="This Month"
      value={formatCurrency($studioExpenses.thisMonth)}
      icon={Calendar}
      color="orange"
    />
  </div>

  <!-- Expenses Table -->
  <Card>
    <div class="px-6 py-5 border-b border-white/[0.05]">
      <h3 class="font-semibold">All Expenses</h3>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-black/20">
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Description</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Category</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Amount</th>
            <th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          {#if $studioExpenses.length === 0}
            <tr>
              <td colspan="5" class="text-center py-12 text-white/45 text-sm">
                No studio expenses recorded.
              </td>
            </tr>
          {:else}
            {#each $studioExpenses as expense}
              <tr class="border-t border-white/[0.05] hover:bg-white/[0.02] group">
                <td class="px-6 py-4 text-sm">{expense.description}</td>
                <td class="px-6 py-4">
                  <Badge>{expense.category}</Badge>
                </td>
                <td class="px-6 py-4 text-sm font-mono">{formatCurrency(expense.amount)}</td>
                <td class="px-6 py-4 text-sm text-white/45">{formatDate(expense.date)}</td>
                <td class="px-6 py-4">
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

<!-- Add Expense Modal -->
<Modal bind:open={showAddModal} title="Add Studio Cost" onclose={() => showAddModal = false}>
  <div class="p-6 space-y-5">
    <Input
      id="description"
      label="Description"
      placeholder="e.g., Office rent"
      bind:value={newExpense.description}
    />
    <Select
      id="category"
      label="Category"
      options={categoryOptions}
      bind:value={newExpense.category}
    />
    <Input
      id="amount"
      type="number"
      label="Amount ($)"
      placeholder="0"
      min={0}
      bind:value={newExpense.amount}
    />
  </div>

  <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">
    <Button variant="ghost" onclick={() => showAddModal = false}>
      Cancel
    </Button>
    <Button onclick={addExpense}>
      Add Expense
    </Button>
  </div>
</Modal>

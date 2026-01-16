<script lang="ts">
  import { auth, type User } from '$lib/stores/auth';
  import { ventures } from '$lib/stores/ventures';
  import { toast } from '$lib/stores/toast';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { Plus, Edit } from 'lucide-svelte';

  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let editingUser = $state<User | null>(null);

  // Form state
  let newPartner = $state({
    username: '',
    password: '',
    role: 'partner' as 'admin' | 'partner',
    contract: ''
  });

  let editForm = $state({
    password: '',
    role: 'partner' as 'admin' | 'partner',
    contract: ''
  });

  const roleOptions = [
    { value: 'partner', label: 'Partner' },
    { value: 'admin', label: 'Admin' }
  ];

  // Get ventures for each user
  function getUserVentures(userId: number) {
    return $ventures.filter(v =>
      v.partners.some(p => p.userId === userId)
    ).map(v => {
      const partner = v.partners.find(p => p.userId === userId);
      return { name: v.name, equity: partner?.equity || 0 };
    });
  }

  function addPartner() {
    if (!newPartner.username.trim() || !newPartner.password) {
      toast.show('Please fill in all required fields', 'error');
      return;
    }

    // Check if username exists
    const exists = $auth.users.some(u => u.username === newPartner.username.trim());
    if (exists) {
      toast.show('Username already exists', 'error');
      return;
    }

    auth.addUser({
      username: newPartner.username.trim(),
      password: newPartner.password,
      role: newPartner.role,
      contract: newPartner.contract
    });

    toast.show('Partner added successfully', 'success');
    showAddModal = false;
    newPartner = { username: '', password: '', role: 'partner', contract: '' };
  }

  function openEditModal(user: User) {
    editingUser = user;
    editForm = {
      password: '',
      role: user.role,
      contract: user.contract || ''
    };
    showEditModal = true;
  }

  function savePartner() {
    if (!editingUser) return;

    const updates: Partial<User> = {
      role: editForm.role,
      contract: editForm.contract
    };

    if (editForm.password) {
      updates.password = editForm.password;
    }

    auth.updateUser(editingUser.id, updates);
    toast.show('Partner updated successfully', 'success');
    showEditModal = false;
    editingUser = null;
  }

  function deletePartner() {
    if (!editingUser) return;

    if (editingUser.username === 'admin') {
      toast.show('Cannot delete admin account', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this partner?')) return;

    // Remove partner from all ventures
    $ventures.forEach(v => {
      const filtered = v.partners.filter(p => p.userId !== editingUser?.id);
      if (filtered.length !== v.partners.length) {
        ventures.updatePartners(v.id, filtered);
      }
    });

    auth.deleteUser(editingUser.id);
    toast.show('Partner deleted', 'success');
    showEditModal = false;
    editingUser = null;
  }
</script>

<div class="animate-fade-in">
  <!-- Header -->
  <div class="flex justify-between items-start mb-7">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Partners</h1>
      <p class="text-sm text-white/45 mt-1">Manage team access</p>
    </div>
    <Button onclick={() => showAddModal = true}>
      <Plus size={16} />
      Add Partner
    </Button>
  </div>

  <!-- Partners List -->
  <div class="space-y-3">
    {#each $auth.users as user}
      {@const userVentures = getUserVentures(user.id)}
      <div class="flex items-center gap-5 p-5 bg-white/[0.025] border border-white/[0.05] rounded-2xl hover:border-white/[0.08] transition-all">
        <!-- Avatar -->
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold text-white shrink-0"
          class:bg-gradient-to-br={true}
          class:from-indigo-500={user.role === 'admin'}
          class:to-purple-500={user.role === 'admin'}
          class:from-green-500={user.role === 'partner'}
          class:to-emerald-500={user.role === 'partner'}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2.5 mb-1">
            <span class="font-medium text-white">{user.username}</span>
            <Badge variant={user.role === 'admin' ? 'purple' : 'green'}>
              {user.role}
            </Badge>
          </div>

          {#if userVentures.length > 0}
            <div class="flex flex-wrap gap-1.5">
              {#each userVentures as v}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.035] rounded-full text-[11px] text-white/75">
                  {v.name}
                  <span class="text-indigo-400 font-semibold">{v.equity}%</span>
                </span>
              {/each}
            </div>
          {:else}
            <p class="text-xs text-white/45">No ventures assigned</p>
          {/if}
        </div>

        <!-- Actions -->
        <Button variant="secondary" size="sm" onclick={() => openEditModal(user)}>
          <Edit size={14} />
          Edit
        </Button>
      </div>
    {/each}
  </div>
</div>

<!-- Add Partner Modal -->
<Modal bind:open={showAddModal} title="Add New Partner" onclose={() => showAddModal = false}>
  <div class="p-6 space-y-5">
    <Input
      id="username"
      label="Username"
      placeholder="Enter username"
      bind:value={newPartner.username}
    />
    <Input
      id="password"
      type="password"
      label="Password"
      placeholder="Enter password"
      bind:value={newPartner.password}
    />
    <Select
      id="role"
      label="Role"
      options={roleOptions}
      bind:value={newPartner.role}
    />
    <div class="space-y-2">
      <label for="newContract" class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">
        Contract Notes (optional)
      </label>
      <textarea
        id="newContract"
        class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm min-h-[100px] resize-y placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
        placeholder="Enter contract terms..."
        bind:value={newPartner.contract}
      ></textarea>
    </div>
  </div>

  <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">
    <Button variant="ghost" onclick={() => showAddModal = false}>
      Cancel
    </Button>
    <Button onclick={addPartner}>
      Add Partner
    </Button>
  </div>
</Modal>

<!-- Edit Partner Modal -->
<Modal bind:open={showEditModal} title="Edit Partner" onclose={() => showEditModal = false}>
  {#if editingUser}
    <div class="p-6 space-y-5">
      <Input
        id="editUsername"
        label="Username"
        value={editingUser.username}
        readonly
      />
      <Input
        id="editPassword"
        type="password"
        label="New Password (leave blank to keep)"
        placeholder="Enter new password"
        bind:value={editForm.password}
      />
      <Select
        id="editRole"
        label="Role"
        options={roleOptions}
        bind:value={editForm.role}
      />
      <div class="space-y-2">
        <label for="editContract" class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">
          Contract Notes
        </label>
        <textarea
          id="editContract"
          class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm min-h-[100px] resize-y placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
          placeholder="Enter contract terms..."
          bind:value={editForm.contract}
        ></textarea>
      </div>
    </div>

    <div class="flex justify-between px-6 py-5 border-t border-white/[0.05] bg-black/20">
      <Button variant="danger" onclick={deletePartner}>
        Delete
      </Button>
      <div class="flex gap-3">
        <Button variant="ghost" onclick={() => showEditModal = false}>
          Cancel
        </Button>
        <Button onclick={savePartner}>
          Save
        </Button>
      </div>
    </div>
  {/if}
</Modal>

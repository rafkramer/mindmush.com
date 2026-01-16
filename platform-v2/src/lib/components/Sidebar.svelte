<script lang="ts">
  import { page } from '$app/state';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import {
    LayoutGrid,
    Rocket,
    Users,
    Wallet,
    Settings,
    LogOut,
    FileText,
    DollarSign
  } from 'lucide-svelte';

  const adminNavItems = [
    { href: '/', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/ventures', icon: Rocket, label: 'Ventures' },
    { href: '/partners', icon: Users, label: 'Partners' },
    { href: '/expenses', icon: Wallet, label: 'Studio' },
    { href: '/settings', icon: Settings, label: 'Settings' }
  ];

  const partnerNavItems = [
    { href: '/', icon: LayoutGrid, label: 'My Portfolio' },
    { href: '/payouts', icon: DollarSign, label: 'Payouts' },
    { href: '/contract', icon: FileText, label: 'Contract' }
  ];

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  let navItems = $derived($auth.isAdmin ? adminNavItems : partnerNavItems);
</script>

<aside class="fixed left-0 top-0 w-[260px] h-screen bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/[0.05] flex flex-col z-50 p-6">
  <!-- Logo -->
  <div class="px-2 mb-6">
    <div class="text-[11px] font-bold tracking-[0.3em] text-indigo-400">MINDMUSH</div>
    <div class="text-[11px] text-white/45 tracking-wide mt-1">Internal Platform</div>
  </div>

  <!-- User Badge -->
  {#if $auth.currentUser}
    <div class="flex items-center gap-3 p-3.5 bg-white/[0.025] rounded-xl border border-white/[0.05] mb-6">
      <div class="w-10 h-10 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
        {$auth.currentUser.username.charAt(0).toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white truncate">{$auth.currentUser.username}</div>
        <div class="text-[11px] uppercase tracking-wider mt-0.5" class:text-indigo-400={$auth.currentUser.role === 'admin'} class:text-green-400={$auth.currentUser.role === 'partner'}>
          {$auth.currentUser.role}
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto">
    <div class="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em] mb-2.5 px-3">
      {$auth.isAdmin ? 'Management' : 'Overview'}
    </div>

    <div class="space-y-1">
      {#each navItems as item}
        {@const isActive = page.url.pathname === item.href || (item.href !== '/' && page.url.pathname.startsWith(item.href))}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 {isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' : 'text-white/45 hover:bg-white/5 hover:text-white'}"
        >
          <item.icon size={18} />
          {item.label}
        </a>
      {/each}
    </div>
  </nav>

  <!-- Logout -->
  <div class="pt-4 border-t border-white/[0.05] mt-auto">
    <button
      onclick={handleLogout}
      class="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-white/45 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  </div>
</aside>

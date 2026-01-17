import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider, useToast } from './ui/Toast';
import { Sidebar, type Page } from './Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VenturesPage } from './pages/VenturesPage';
import { VentureDetailPage } from './pages/VentureDetailPage';
import { PartnersPage } from './pages/PartnersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { SettingsPage } from './pages/SettingsPage';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { PartnerPayouts } from './pages/PartnerPayouts';
import { PartnerContract } from './pages/PartnerContract';
import { AddVentureModal } from './modals/AddVentureModal';
import { EditVentureModal } from './modals/EditVentureModal';
import { AddPartnerModal } from './modals/AddPartnerModal';
import { EditPartnerModal } from './modals/EditPartnerModal';
import { AddExpenseModal } from './modals/AddExpenseModal';
import { useAuth, useUsers } from '../../hooks/platform/useAuth';
import { useVentures } from '../../hooks/platform/useVentures';
import { useExpenses } from '../../hooks/platform/useExpenses';
import {
  getSettings,
  saveSettings,
  initializeData,
} from '../../utils/platform/storage';
import { filterByDateRange } from '../../utils/platform/format';
import type { Venture, User, Settings } from '../../utils/platform/types';
import type { VentureState, VentureType, ExpenseCategory } from '../../utils/platform/constants';

function PlatformContent() {
  const { showToast } = useToast();
  const { user, login, logout, loading: authLoading, isAdmin } = useAuth();
  const { users, addUser, updateUser, deleteUser, refresh: refreshUsers } = useUsers();
  const {
    ventures,
    addVenture,
    updateVenture,
    deleteVenture,
    addVentureExpense,
    deleteVentureExpense,
    refresh: refreshVentures,
  } = useVentures();
  const {
    expenses: studioExpenses,
    addExpense: addStudioExpense,
    deleteExpense: deleteStudioExpense,
    getTotal: getStudioExpenseTotal,
    getMonthlyTotal: getMonthlyExpenseTotal,
    refresh: refreshExpenses,
  } = useExpenses();

  // UI State
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [dateRange, setDateRange] = useState<number | 'all'>(7);
  const [currentVenture, setCurrentVenture] = useState<Venture | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({});

  // Modal State
  const [showAddVentureModal, setShowAddVentureModal] = useState(false);
  const [showEditVentureModal, setShowEditVentureModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showEditPartnerModal, setShowEditPartnerModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseType, setExpenseType] = useState<'venture' | 'studio'>('venture');

  // Initialize
  useEffect(() => {
    initializeData();
    setSettings(getSettings());
  }, []);

  // Set initial page based on role
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('partnerDashboard');
      }
    }
  }, [user, isAdmin]);

  // Keep currentVenture in sync with ventures array
  useEffect(() => {
    if (currentVenture) {
      const updated = ventures.find(v => v.id === currentVenture.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentVenture)) {
        setCurrentVenture(updated);
      }
    }
  }, [ventures, currentVenture]);

  // Navigation
  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setCurrentVenture(null);
  }, []);

  const handleViewVenture = useCallback((id: string) => {
    const venture = ventures.find(v => v.id === id);
    if (venture) {
      setCurrentVenture(venture);
      setCurrentPage(isAdmin ? 'ventureDetail' : 'partnerVentureDetail');
    }
  }, [ventures, isAdmin]);

  // Venture handlers
  const handleAddVenture = useCallback((ventureData: {
    name: string;
    type: VentureType;
    state: VentureState;
    revenue: number;
    studioEquity: number;
    bundleId?: string;
    superwallKey?: string;
    icon?: string | null;
  }) => {
    addVenture(ventureData);
    showToast('Venture added successfully');
  }, [addVenture, showToast]);

  const handleUpdateVenture = useCallback((updates: Partial<Venture>) => {
    if (currentVenture) {
      updateVenture(currentVenture.id, updates);
      setCurrentVenture({ ...currentVenture, ...updates });
      showToast('Venture updated successfully');
    }
  }, [currentVenture, updateVenture, showToast]);

  const handleDeleteVenture = useCallback(() => {
    if (currentVenture) {
      deleteVenture(currentVenture.id);
      setCurrentVenture(null);
      setCurrentPage('ventures');
      showToast('Venture deleted');
    }
  }, [currentVenture, deleteVenture, showToast]);

  // Partner handlers
  const handleAddPartner = useCallback((partnerData: {
    username: string;
    password: string;
    role: 'admin' | 'partner';
    contract?: string;
  }): boolean => {
    const result = addUser(partnerData);
    if (result) {
      showToast('Partner added successfully');
      return true;
    }
    showToast('Username already exists', 'error');
    return false;
  }, [addUser, showToast]);

  const handleUpdatePartner = useCallback((updates: Partial<User>) => {
    if (editingUser) {
      updateUser(editingUser.id, updates);
      showToast('Partner updated successfully');
    }
  }, [editingUser, updateUser, showToast]);

  const handleDeletePartner = useCallback(() => {
    if (editingUser) {
      deleteUser(editingUser.id);
      showToast('Partner deleted');
    }
  }, [editingUser, deleteUser, showToast]);

  // Expense handlers
  const handleAddExpense = useCallback((description: string, amount: number, category?: ExpenseCategory) => {
    if (expenseType === 'studio' && category) {
      addStudioExpense(description, amount, category);
      showToast('Studio expense added');
    } else if (currentVenture) {
      addVentureExpense(currentVenture.id, description, amount);
      showToast('Expense added');
    }
  }, [expenseType, addStudioExpense, addVentureExpense, currentVenture, showToast]);

  const handleDeleteVentureExpense = useCallback((expenseId: string) => {
    if (currentVenture) {
      deleteVentureExpense(currentVenture.id, expenseId);
      showToast('Expense deleted');
    }
  }, [currentVenture, deleteVentureExpense, showToast]);

  // Settings handlers
  const handleSaveSettings = useCallback((newSettings: Settings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings saved');
  }, [showToast]);

  const handleTestApi = useCallback(async (): Promise<boolean> => {
    const apiKey = settings.applovinApiKey;
    if (!apiKey) {
      showToast('Please enter an API key first', 'error');
      return false;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `https://r.applovin.com/maxReport?api_key=${apiKey}&start=${today}&end=${today}&format=json&columns=day,application`;
      const response = await fetch(url);
      if (response.ok) {
        showToast('API connection successful');
        return true;
      }
      throw new Error('Invalid response');
    } catch {
      showToast('API connection failed', 'error');
      return false;
    }
  }, [settings.applovinApiKey, showToast]);

  // Sync handlers
  const handleSync = useCallback(async () => {
    showToast('Syncing data from APIs...');
    // In a real app, this would fetch from APIs
    setTimeout(() => {
      refreshVentures();
      showToast('Data synced successfully');
    }, 1000);
  }, [refreshVentures, showToast]);

  const handleSyncVenture = useCallback(async () => {
    if (!currentVenture) return;
    showToast('Syncing venture data...');
    // In a real app, this would fetch from APIs
    setTimeout(() => {
      showToast('Venture synced successfully');
    }, 1000);
  }, [currentVenture, showToast]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login page
  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  // Calculate totals for dashboard
  const studioExpenseTotal = getStudioExpenseTotal(dateRange);

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            ventures={ventures}
            studioExpenses={studioExpenseTotal}
            dateRange={dateRange}
            onViewVenture={handleViewVenture}
            onSync={handleSync}
          />
        );
      case 'ventures':
        return (
          <VenturesPage
            ventures={ventures}
            onViewVenture={handleViewVenture}
            onAddVenture={() => setShowAddVentureModal(true)}
          />
        );
      case 'ventureDetail':
        return currentVenture ? (
          <VentureDetailPage
            venture={currentVenture}
            onBack={() => setCurrentPage('ventures')}
            onEdit={() => setShowEditVentureModal(true)}
            onAddExpense={() => {
              setExpenseType('venture');
              setShowAddExpenseModal(true);
            }}
            onDeleteExpense={handleDeleteVentureExpense}
            onSync={handleSyncVenture}
          />
        ) : null;
      case 'partners':
        return (
          <PartnersPage
            users={users}
            ventures={ventures}
            onAddPartner={() => setShowAddPartnerModal(true)}
            onEditPartner={(id) => {
              const u = users.find(user => user.id === id);
              if (u) {
                setEditingUser(u);
                setShowEditPartnerModal(true);
              }
            }}
          />
        );
      case 'expenses':
        return (
          <ExpensesPage
            expenses={studioExpenses}
            totalExpenses={studioExpenseTotal}
            monthlyExpenses={getMonthlyExpenseTotal()}
            onAddExpense={() => {
              setExpenseType('studio');
              setShowAddExpenseModal(true);
            }}
            onDeleteExpense={(id) => {
              deleteStudioExpense(id);
              showToast('Expense deleted');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onTestApi={handleTestApi}
          />
        );
      case 'partnerDashboard':
        return (
          <PartnerDashboard
            user={user}
            ventures={ventures}
            onViewVenture={handleViewVenture}
          />
        );
      case 'partnerPayouts':
        return <PartnerPayouts user={user} ventures={ventures} />;
      case 'partnerContract':
        return <PartnerContract user={user} ventures={ventures} />;
      case 'partnerVentureDetail':
        return currentVenture ? (
          <VentureDetailPage
            venture={currentVenture}
            onBack={() => setCurrentPage('partnerDashboard')}
            onEdit={() => {}}
            onAddExpense={() => {}}
            onDeleteExpense={() => {}}
            onSync={() => {}}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b]">
      {/* Sidebar */}
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Top Bar with Date Filter */}
        <div className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {[1, 7, 30, 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as number | 'all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  dateRange === range
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {range === 'all' ? 'All Time' : range === 1 ? '24h' : `${range}d`}
              </button>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + (currentVenture?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AddVentureModal
        isOpen={showAddVentureModal}
        onClose={() => setShowAddVentureModal(false)}
        onAdd={handleAddVenture}
      />
      <EditVentureModal
        isOpen={showEditVentureModal}
        onClose={() => setShowEditVentureModal(false)}
        venture={currentVenture}
        onSave={handleUpdateVenture}
        onDelete={handleDeleteVenture}
      />
      <AddPartnerModal
        isOpen={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        onAdd={handleAddPartner}
      />
      <EditPartnerModal
        isOpen={showEditPartnerModal}
        onClose={() => {
          setShowEditPartnerModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleUpdatePartner}
        onDelete={handleDeletePartner}
      />
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        type={expenseType}
        onAdd={handleAddExpense}
      />
    </div>
  );
}

export default function PlatformApp() {
  return (
    <ToastProvider>
      <PlatformContent />
    </ToastProvider>
  );
}

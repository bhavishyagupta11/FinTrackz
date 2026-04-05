import React, { createContext, useContext, useState, useEffect } from 'react';
import { transactions as initialTransactions } from '../data/mockData';
import {
  createSubscriptionFromTransaction,
  mergeSubscriptionSources,
} from '../utils/subscriptionManager';
import { buildSubscriptionKey, getNextBillingDate } from '../utils/subscriptionDetector';

// Create the global app context
const AppContext = createContext(null);
const TRANSACTION_SEED_VERSION = '2026-04-03-transactions-2026-v3';

function hasStaleSeedTransactions(savedTransactions) {
  const savedMap = new Map(savedTransactions.map(tx => [tx.id, tx]));

  return initialTransactions.some(seedTx => {
    const savedTx = savedMap.get(seedTx.id);
    if (!savedTx) return true;

    return (
      savedTx.date !== seedTx.date ||
      savedTx.description !== seedTx.description ||
      savedTx.category !== seedTx.category ||
      Number(savedTx.amount) !== Number(seedTx.amount) ||
      savedTx.type !== seedTx.type
    );
  });
}

function mergeSeedTransactions(savedTransactions) {
  const seedMap = new Map(initialTransactions.map(tx => [tx.id, tx]));
  const customTransactions = savedTransactions.filter(tx => !seedMap.has(tx.id));
  return [...initialTransactions, ...customTransactions];
}

// Load transactions from localStorage or use mock data
function loadTransactions() {
  try {
    const saved = localStorage.getItem('fd_transactions');
    const savedVersion = localStorage.getItem('fd_transactions_seed_version');

    if (!saved) return initialTransactions;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialTransactions;

    if (savedVersion !== TRANSACTION_SEED_VERSION || hasStaleSeedTransactions(parsed)) {
      return mergeSeedTransactions(parsed);
    }

    return parsed;
  } catch {
    return initialTransactions;
  }
}

function loadStoredValue(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  // Dark mode — persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('fd_dark') === 'true';
  });

  // Role: 'admin' or 'viewer'
  const [role, setRole] = useState(() => {
    return localStorage.getItem('fd_role') || 'viewer';
  });

  // Active page: existing core pages + newly added finance tools
  const [activePage, setActivePage] = useState('dashboard');

  // Transactions data
  const [transactions, setTransactions] = useState(loadTransactions);
  const [budgets, setBudgets] = useState(() => loadStoredValue('fd_budgets', {}));
  const [goals, setGoals] = useState(() => loadStoredValue('fd_goals', []));
  const [savedSubscriptions, setSavedSubscriptions] = useState(() => loadStoredValue('fd_saved_subscriptions', []));
  const [excludedSubscriptionKeys, setExcludedSubscriptionKeys] = useState(() => loadStoredValue('fd_excluded_subscription_keys', []));

  // Search query (used in transactions page)
  const [searchQuery, setSearchQuery] = useState('');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState({
    transactionId: null,
    subscriptionKey: null,
    category: null,
    budgetCategory: null,
    goalId: null,
  });

  // Filter: 'all' | 'income' | 'expense'
  const [filter, setFilter] = useState('all');

  // Mobile sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => loadStoredValue('fd_sidebar_collapsed', false));

  // Selected category (used by interactive charts like SpendingPieChart)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fd_dark', darkMode);
  }, [darkMode]);

  // Persist role
  useEffect(() => {
    localStorage.setItem('fd_role', role);
  }, [role]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem('fd_transactions', JSON.stringify(transactions));
    localStorage.setItem('fd_transactions_seed_version', TRANSACTION_SEED_VERSION);
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fd_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('fd_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fd_saved_subscriptions', JSON.stringify(savedSubscriptions));
  }, [savedSubscriptions]);

  useEffect(() => {
    localStorage.setItem('fd_excluded_subscription_keys', JSON.stringify(excludedSubscriptionKeys));
  }, [excludedSubscriptionKeys]);

  useEffect(() => {
    localStorage.setItem('fd_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleSidebarCollapsed = () => setSidebarCollapsed(prev => !prev);

  // Add transaction (admin only — UI only, no backend)
  const addTransaction = (tx) => {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
  };

  // Edit transaction (admin only — UI only)
  const editTransaction = (id, updates) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    setSavedSubscriptions(prev => prev.filter(item => item.transactionId !== id));
    setSearchFocus(prev => (
      prev.transactionId === id
        ? { ...prev, transactionId: null }
        : prev
    ));
  };

  const setBudgetForCategory = (category, amount) => {
    setBudgets(prev => ({
      ...prev,
      [category]: Number(amount) || 0,
    }));
  };

  const addGoal = (goal) => {
    setGoals(prev => [{ ...goal, id: Date.now() }, ...prev]);
  };

  const updateGoal = (id, updates) => {
    setGoals(prev => prev.map(goal => (
      goal.id === id ? { ...goal, ...updates } : goal
    )));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const clearSearchFocus = () => {
    setSearchFocus({
      transactionId: null,
      subscriptionKey: null,
      category: null,
      budgetCategory: null,
      goalId: null,
    });
  };

  const subscriptions = mergeSubscriptionSources(transactions, savedSubscriptions, excludedSubscriptionKeys);

  const addOrUpdateSubscription = (record) => {
    const frequency = record.frequency || 'monthly';
    const customIntervalDays = frequency === 'custom' ? Number(record.customIntervalDays || 30) : undefined;
    const amount = Number(record.amount || 0);
    const name = record.name;
    const lastPayment = record.lastPayment;
    const subscriptionKey = record.subscriptionKey || buildSubscriptionKey(name, amount);

    const normalizedRecord = {
      id: record.id || Date.now(),
      subscriptionKey,
      name,
      amount,
      frequency,
      customIntervalDays,
      lastPayment,
      nextBilling: record.nextBilling || getNextBillingDate(lastPayment, frequency, customIntervalDays),
      source: record.source,
      category: record.category || 'Entertainment',
      transactionId: record.transactionId ?? null,
    };

    setSavedSubscriptions(prev => {
      const existing = prev.find(item => item.id === normalizedRecord.id || item.subscriptionKey === subscriptionKey);
      if (!existing) return [normalizedRecord, ...prev.filter(item => item.subscriptionKey !== subscriptionKey)];

      return prev.map(item => (
        item.id === existing.id ? { ...existing, ...normalizedRecord } : item
      ));
    });

    setExcludedSubscriptionKeys(prev => prev.filter(key => key !== subscriptionKey));
  };

  const convertTransactionToSubscription = (transaction, source = 'manual') => {
    addOrUpdateSubscription(createSubscriptionFromTransaction(transaction, source));
  };

  const removeSubscription = (subscription) => {
    setSavedSubscriptions(prev => prev.filter(item => item.id !== subscription.id && item.subscriptionKey !== subscription.subscriptionKey));
    setExcludedSubscriptionKeys(prev => (
      prev.includes(subscription.subscriptionKey)
        ? prev
        : [...prev, subscription.subscriptionKey]
    ));
  };

  const value = {
    darkMode,
    toggleDarkMode,
    role,
    setRole,
    activePage,
    setActivePage,
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    budgets,
    setBudgetForCategory,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    subscriptions,
    savedSubscriptions,
    excludedSubscriptionKeys,
    addOrUpdateSubscription,
    convertTransactionToSubscription,
    removeSubscription,
    searchQuery,
    setSearchQuery,
    ledgerSearchQuery,
    setLedgerSearchQuery,
    searchFocus,
    setSearchFocus,
    clearSearchFocus,
    filter,
    setFilter,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    selectedCategory,
    setSelectedCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for easy access
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

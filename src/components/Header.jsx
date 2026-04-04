import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Sun, Moon, Menu, Search, Bell, X, LogOut, User, ShieldCheck, Eye, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildGlobalSearchData, globalSearch } from '../utils/globalSearch';
import { formatCurrency, getGoalLinkedAmount } from '../utils/finance';

const pageTitles = {
  dashboard: 'Overview',
  transactions: 'Ledger',
  insights: 'Analytics',
  budgets: 'Budgets',
  goals: 'Goals',
  subscriptions: 'Subscriptions',
};

const pagePlaceholders = {
  dashboard: 'Search anything...',
  transactions: 'Search ledger entries...',
  insights: 'Search categories...',
  budgets: 'Search budgets...',
  goals: 'Search goals...',
  subscriptions: 'Search subscriptions...',
};

// Click-outside hook
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function Header() {
  const {
    darkMode, toggleDarkMode,
    activePage, setActivePage,
    searchQuery, setSearchQuery,
    toggleSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    transactions,
    subscriptions,
    budgets,
    goals,
    role, setRole,
    setSearchFocus,
    setSelectedCategory,
    clearSearchFocus,
  } = useApp();

  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifRead,   setNotifRead]   = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const showGlobalSearch = activePage === 'dashboard';

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useClickOutside(notifRef,   () => setShowNotifs(false));
  useClickOutside(profileRef, () => setShowProfile(false));
  useClickOutside(searchRef,  () => setShowSearchResults(false));

  useEffect(() => {
    if (!showGlobalSearch) {
      setShowSearchResults(false);
    }
  }, [showGlobalSearch]);

  function handleSearch(e) {
    setSearchQuery(e.target.value);
    setShowSearchResults(Boolean(e.target.value.trim()));
  }

  function clearSearch() {
    setSearchQuery('');
    setShowSearchResults(false);
    clearSearchFocus();
  }

  const enrichedGoals = useMemo(() => (
    goals.map(goal => {
      const linkedAmount = getGoalLinkedAmount(goal, transactions);
      const totalSaved = Number(goal.currentSaved || 0) + linkedAmount;
      const remaining = Math.max(Number(goal.targetAmount || 0) - totalSaved, 0);
      return { ...goal, totalSaved, remaining };
    })
  ), [goals, transactions]);

  const globalSearchData = useMemo(() => (
    buildGlobalSearchData({
      transactions,
      subscriptions,
      goals: enrichedGoals,
      budgets,
    })
  ), [transactions, subscriptions, enrichedGoals, budgets]);

  const searchResults = useMemo(() => globalSearch(searchQuery, globalSearchData), [searchQuery, globalSearchData]);

  const groupedResults = useMemo(() => ([
    { key: 'subscriptions', label: 'Subscriptions', items: searchResults.subscriptions },
    { key: 'transactions', label: 'Transactions', items: searchResults.transactions },
    { key: 'categories', label: 'Categories', items: searchResults.categories },
    { key: 'budgets', label: 'Budgets', items: searchResults.budgets },
    { key: 'goals', label: 'Goals', items: searchResults.goals },
  ].filter(section => section.items.length > 0)), [searchResults]);

  function renderHighlightedText(text) {
    const source = String(text || '');
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) return source;

    const index = source.toLowerCase().indexOf(normalizedQuery.toLowerCase());
    if (index < 0) return source;

    return (
      <>
        {source.slice(0, index)}
        <mark className="bg-brand-100 dark:bg-brand-900/40 text-inherit rounded px-0.5">
          {source.slice(index, index + normalizedQuery.length)}
        </mark>
        {source.slice(index + normalizedQuery.length)}
      </>
    );
  }

  function handleResultSelect(section, item) {
    if (section === 'transactions') {
      setSelectedCategory(null);
      setActivePage('transactions');
      setSearchFocus({
        transactionId: item.id,
        subscriptionKey: null,
        category: null,
        budgetCategory: null,
        goalId: null,
      });
      setShowSearchResults(false);
      return;
    }

    if (section === 'subscriptions') {
      setSelectedCategory(null);
      setActivePage('subscriptions');
      setSearchFocus({
        transactionId: null,
        subscriptionKey: item.subscriptionKey,
        category: null,
        budgetCategory: null,
        goalId: null,
      });
      setShowSearchResults(false);
      return;
    }

    if (section === 'categories') {
      setActivePage('insights');
      setSelectedCategory(item.name);
      setSearchFocus({
        transactionId: null,
        subscriptionKey: null,
        category: item.name,
        budgetCategory: null,
        goalId: null,
      });
      setShowSearchResults(false);
      return;
    }

    if (section === 'budgets') {
      setSelectedCategory(null);
      setActivePage('budgets');
      setSearchFocus({
        transactionId: null,
        subscriptionKey: null,
        category: null,
        budgetCategory: item.category,
        goalId: null,
      });
      setShowSearchResults(false);
      return;
    }

    if (section === 'goals') {
      setSelectedCategory(null);
      setActivePage('goals');
      setSearchFocus({
        transactionId: null,
        subscriptionKey: null,
        category: null,
        budgetCategory: null,
        goalId: item.id,
      });
      setShowSearchResults(false);
    }
  }

  function renderResultMeta(section, item) {
    if (section === 'transactions') {
      return `${item.category} · ₹${item.amount.toFixed(2)} · ${new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    }
    if (section === 'subscriptions') {
      return `${formatCurrency(item.amount)} · ${item.source === 'admin' ? 'Admin Added' : item.source === 'manual' ? 'Manual' : 'Auto Detected'}`;
    }
    if (section === 'categories') {
      return `${formatCurrency(item.amount)} total spend`;
    }
    if (section === 'budgets') {
      return `Budget ${formatCurrency(item.budget)} · Spent ${formatCurrency(item.spent)}`;
    }
    return `${formatCurrency(item.totalSaved || 0)} saved of ${formatCurrency(item.targetAmount || 0)}`;
  }

  // Derive smart notifications from live transactions
  function buildNotifications() {
    const notes = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const income   = transactions.filter(t => t.type === 'income');

    if (expenses.length) {
      const top = [...expenses].sort((a, b) => b.amount - a.amount)[0];
      notes.push({
        id: 'top-expense',
        icon: '💸',
        title: 'Highest Expense',
        body: `₹${top.amount.toFixed(2)} on ${top.description}`,
        time: top.date,
      });
    }

    if (income.length) {
      const latest = [...income].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      notes.push({
        id: 'latest-income',
        icon: '💰',
        title: 'Latest Income',
        body: `+₹${latest.amount.toFixed(2)} — ${latest.description}`,
        time: latest.date,
      });
    }

    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const totalInc = income.reduce((s, t)   => s + t.amount, 0);
    if (totalExp > totalInc * 0.5) {
      notes.push({
        id: 'expense-alert',
        icon: '⚠️',
        title: 'Spending Alert',
        body: 'Expenses are over 50% of your income this period.',
        time: null,
      });
    }

    if (transactions.length) {
      const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      notes.push({
        id: 'recent-tx',
        icon: '🔔',
        title: 'Recent Transaction',
        body: `${recent.description} — ₹${recent.amount.toFixed(2)}`,
        time: recent.date,
      });
    }

    return notes;
  }

  const notifications = buildNotifications();
  const hasUnread = !notifRead && notifications.length > 0;

  function formatDate(d) {
    if (!d) return 'just now';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 lg:px-8 py-3.5">
      <div className="flex items-center gap-3">

        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Page title */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white shrink-0">
          {pageTitles[activePage]}
        </h1>

        {/* Search bar */}
        {showGlobalSearch && (
          <div ref={searchRef} className="flex-1 max-w-md ml-auto md:ml-6 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="header-search"
              type="text"
              placeholder={pagePlaceholders[activePage] || 'Search anything...'}
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowSearchResults(Boolean(searchQuery.trim()))}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-600 transition"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                {groupedResults.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-gray-500 dark:text-gray-400">
                    No results found. Try searching transactions, subscriptions, or categories.
                  </div>
                ) : (
                  <div className="max-h-[28rem] overflow-y-auto">
                    {groupedResults.map(section => (
                      <div key={section.key} className="border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50/80 dark:bg-gray-800/40">
                          {section.label}
                        </div>
                        <ul>
                          {section.items.map(item => (
                            <li key={item.id || item.subscriptionKey || item.name || item.category}>
                              <button
                                type="button"
                                onClick={() => handleResultSelect(section.key, item)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {renderHighlightedText(item.description || item.name || item.category)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {renderHighlightedText(renderResultMeta(section.key, item))}
                                </p>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right icons */}
        <div className={`flex items-center gap-2 ${showGlobalSearch ? 'ml-1' : 'ml-auto'}`}>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <button
              id="notif-btn"
              onClick={() => { setShowNotifs(v => !v); setNotifRead(true); }}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">Notifications</p>
                  <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
                    {notifications.length} alerts
                  </span>
                </div>

                <ul className="divide-y divide-gray-50 dark:divide-gray-800 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-lg leading-none mt-0.5 shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                      </div>
                      {n.time && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(n.time)}</span>
                      )}
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      No notifications yet
                    </li>
                  )}
                </ul>

                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => { setActivePage('transactions'); setShowNotifs(false); }}
                    className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1"
                  >
                    Open ledger <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile avatar */}
          <div ref={profileRef} className="relative">
            <button
              id="profile-btn"
              onClick={() => setShowProfile(v => !v)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all select-none"
              aria-label="Profile menu"
            >
              S
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-base font-bold shadow-sm shrink-0">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Sbhav</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">sbhav@fintrackz.app</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {role === 'admin'
                      ? <ShieldCheck size={13} className="text-brand-500" />
                      : <Eye size={13} className="text-gray-400" />
                    }
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      role === 'admin'
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {role === 'admin' ? 'Admin · Full Access' : 'Viewer · Read Only'}
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <ul className="py-1.5">
                  <li>
                    <button
                      onClick={() => { setActivePage('dashboard'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <User size={15} className="text-gray-400 shrink-0" />
                      My Overview
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setRole(role === 'admin' ? 'viewer' : 'admin'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <ShieldCheck size={15} className="text-gray-400 shrink-0" />
                      Switch to {role === 'admin' ? 'Viewer' : 'Admin'}
                    </button>
                  </li>
                </ul>

                {/* Sign out */}
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      alert('Sign out clicked — this is a frontend-only demo.');
                    }}
                    className="w-full flex items-center gap-3 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
                  >
                    <LogOut size={15} className="shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

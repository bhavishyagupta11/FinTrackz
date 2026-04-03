import React from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Subscriptions from './pages/Subscriptions';

// Inner app that consumes context
function AppInner() {
  const { activePage, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activePage === 'dashboard'     && <Dashboard />}
          {activePage === 'transactions'  && <Transactions />}
          {activePage === 'insights'      && <Insights />}
          {activePage === 'budgets'       && <Budgets />}
          {activePage === 'goals'         && <Goals />}
          {activePage === 'subscriptions' && <Subscriptions />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

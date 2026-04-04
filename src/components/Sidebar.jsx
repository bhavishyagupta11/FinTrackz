import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  WalletCards,
  Goal,
  Repeat,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard',     label: 'Overview',      icon: LayoutDashboard },
  { id: 'transactions',  label: 'Ledger',        icon: ArrowLeftRight  },
  { id: 'insights',      label: 'Analytics',     icon: Lightbulb       },
  { id: 'budgets',       label: 'Budgets',       icon: WalletCards     },
  { id: 'goals',         label: 'Goals',         icon: Goal            },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat          },
];

export default function Sidebar() {
  const {
    activePage,
    setActivePage,
    role,
    setRole,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
  } = useApp();

  const handleNav = (page) => {
    setActivePage(page);
    setSidebarOpen(false); // close on mobile after navigation
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        ${sidebarCollapsed ? 'lg:w-[78px]' : 'lg:w-64'} w-64 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        shadow-sm
        transform transition-[transform,width] duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center border-b border-gray-100 dark:border-gray-800 ${sidebarCollapsed ? 'justify-center px-3 py-5 lg:px-2' : 'justify-between px-6 py-5'}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} min-w-0`}>
          <img
            src="/logo.png"
            alt="FinTrackz Logo"
            className={`${sidebarCollapsed ? 'h-9 w-9' : 'h-9 w-9'} object-contain shrink-0`}
          />
          {!sidebarCollapsed && (
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
              FinTrackz
            </span>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
        {!sidebarCollapsed && (
          <p className="px-3 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Menu
          </p>
        )}
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              title={sidebarCollapsed ? label : undefined}
              className={`
                group relative w-full flex items-center rounded-xl text-sm font-medium
                transition-all duration-150 ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}
                ${active
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={18} className={active ? 'text-brand-600 dark:text-brand-400' : ''} />
              {!sidebarCollapsed && label}
              {active && !sidebarCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
              )}
              {sidebarCollapsed && (
                <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher */}
      <div className={`border-t border-gray-100 dark:border-gray-800 ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-4'}`}>
        {sidebarCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={() => setRole('viewer')}
              title="Viewer"
              className={`group relative w-full flex items-center justify-center rounded-xl py-2.5 transition-colors ${
                role === 'viewer'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Eye size={14} />
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                Viewer
              </span>
            </button>
            <button
              onClick={() => setRole('admin')}
              title="Admin"
              className={`group relative w-full flex items-center justify-center rounded-xl py-2.5 transition-colors ${
                role === 'admin'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <ShieldCheck size={14} />
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                Admin
              </span>
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
              Role
            </p>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRole('viewer')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors
                  ${role === 'viewer'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Eye size={13} /> Viewer
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors
                  ${role === 'admin'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <ShieldCheck size={13} /> Admin
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              {role === 'admin' ? 'Full access enabled' : 'Read-only mode'}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}

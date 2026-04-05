import React from 'react';
import { PiggyBank, Plus, Repeat } from 'lucide-react';

export default function QuickActions({ role, onAddTransaction, onAddSubscription, onSetBudget }) {
  const disabled = role !== 'admin';

  const actions = [
    { id: 'transaction', label: 'Add Transaction', icon: Plus, onClick: onAddTransaction },
    { id: 'subscription', label: 'Add Subscription', icon: Repeat, onClick: onAddSubscription },
    { id: 'budget', label: 'Set Budget', icon: PiggyBank, onClick: onSetBudget },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-950 dark:text-white">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map(({ id, label, icon: Icon, onClick }) => (
          <button
            key={id}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="group text-left rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-brand-200 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-brand-800 disabled:opacity-60 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-900">
              <Icon size={17} className="text-brand-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            {disabled && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Admin only</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

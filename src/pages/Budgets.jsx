import React, { useState } from 'react';
import { AlertTriangle, CircleDollarSign, PiggyBank } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import {
  formatCurrency,
  getBudgetInsights,
  getLatestTransactionMonth,
  getMonthLabel,
} from '../utils/finance';

const statusStyles = {
  safe: {
    card: 'border-gray-100 dark:border-gray-800',
    pill: 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400',
    text: 'Healthy',
  },
  warning: {
    card: 'border-amber-200 dark:border-amber-800/70',
    pill: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    text: 'Near limit',
  },
  danger: {
    card: 'border-red-200 dark:border-red-800/70',
    pill: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    text: 'Over budget',
  },
};

export default function Budgets() {
  const { transactions, budgets, setBudgetForCategory, role, searchFocus } = useApp();
  const [drafts, setDrafts] = useState(() => Object.fromEntries(
    Object.entries(budgets).map(([key, value]) => [key, String(value)])
  ));

  const monthKey = getLatestTransactionMonth(transactions, 'expense');
  const budgetRows = getBudgetInsights(transactions, budgets, monthKey);
  const monthLabel = getMonthLabel(monthKey);

  const totalBudget = budgetRows.reduce((sum, row) => sum + row.budget, 0);
  const totalSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
  const overBudgetCount = budgetRows.filter(row => row.status === 'danger').length;

  function handleDraftChange(category, value) {
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setDrafts(prev => ({ ...prev, [category]: value }));
    }
  }

  function handleSave(category) {
    setBudgetForCategory(category, drafts[category] || 0);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budgets</h2>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">{monthLabel}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <PiggyBank size={17} className="text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Planned</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <CircleDollarSign size={17} className="text-red-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <AlertTriangle size={17} className={overBudgetCount ? 'text-amber-500' : 'text-brand-500'} />
            <span className="text-xs font-semibold uppercase tracking-wide">Attention</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{overBudgetCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {budgetRows.map(row => {
          const styles = statusStyles[row.status];
          const usageLabel = row.budget > 0 ? `${Math.round(row.usage)}% used` : 'No budget set';

          return (
            <div
              key={row.category}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border shadow-sm ${styles.card} ${
                searchFocus.budgetCategory === row.category ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{row.category}</h3>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles.pill}`}>
                  {styles.text}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Budget</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(row.budget)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Spent</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(row.spent)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Remaining</p>
                  <p className={`font-semibold mt-1 ${row.remaining < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {formatCurrency(row.remaining)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Usage</span>
                  <span>{usageLabel}</span>
                </div>
                <ProgressBar value={row.budget > 0 ? row.usage : 0} tone={row.status} />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={drafts[row.category] ?? ''}
                  onChange={(event) => handleDraftChange(row.category, event.target.value)}
                  disabled={role !== 'admin'}
                  placeholder="Set monthly budget"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => handleSave(row.category)}
                  disabled={role !== 'admin'}
                  className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {role !== 'admin' && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Viewer mode is read-only.
        </div>
      )}
    </div>
  );
}

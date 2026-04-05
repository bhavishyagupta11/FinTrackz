import React from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import CategoryBadge from '../CategoryBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function RecentActivity({ transactions, onViewAll }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-950 dark:text-white">Recent Activity</h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline transition-colors"
        >
          View ledger <ArrowRight size={12} />
        </button>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {transactions.map(tx => (
          <li key={tx.id} className="flex items-center gap-3 py-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              tx.type === 'income'
                ? 'bg-brand-50 dark:bg-brand-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              {tx.type === 'income'
                ? <ArrowUpRight size={16} className="text-brand-600 dark:text-brand-400" />
                : <ArrowDownLeft size={16} className="text-red-500 dark:text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
              <div className="mt-1">
                <CategoryBadge category={tx.category} size="xs" />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(tx.date)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

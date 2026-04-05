import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CategoryBadge from './CategoryBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentTransactions() {
  const { transactions, setActivePage } = useApp();
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 6 transactions</p>
        </div>
        <button
          onClick={() => setActivePage('transactions')}
          className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-6">No transactions yet</p>
      ) : (
        <ul className="divide-y divide-gray-50 dark:divide-gray-800">
          {recent.map(tx => (
            <li key={tx.id} className="flex items-center gap-3 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-xl px-2 -mx-2 transition-colors">
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tx.type === 'income'
                  ? 'bg-brand-50 dark:bg-brand-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                {tx.type === 'income'
                  ? <ArrowUpRight size={16} className="text-brand-600 dark:text-brand-400" />
                  : <ArrowDownLeft size={16} className="text-red-500" />
                }
              </div>

              {/* Description & category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{tx.description}</p>
                <CategoryBadge category={tx.category} size="xs" />
              </div>

              {/* Amount & date */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(tx.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

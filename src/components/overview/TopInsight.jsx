import React from 'react';
import { Award, TrendingDown, TrendingUp } from 'lucide-react';
import SpendingPieChart from '../SpendingPieChart';
import { formatCurrency } from '../../utils/finance';

export default function TopInsight({ topCategory, comparisonText }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Award size={17} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Spending Insight</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">Where your highest expense concentration is happening</p>
          </div>
        </div>

        {topCategory ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top category</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{topCategory.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(topCategory.value)} spent in total
                </p>
              </div>
              <div className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                topCategory.trendUp
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                  : 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
              }`}>
                {topCategory.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {comparisonText}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No category trend available yet.</p>
        )}
      </div>

      <SpendingPieChart title="Expense Breakdown" subtitle="Secondary view of current category mix" />
    </div>
  );
}

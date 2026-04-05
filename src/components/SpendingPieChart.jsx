import React from 'react';
import { useApp } from '../context/AppContext';

// Color palette per category
const CATEGORY_COLORS = {
  Food:          '#22c55e',
  Shopping:      '#3b82f6',
  Travel:        '#f59e0b',
  Utilities:     '#8b5cf6',
  Entertainment: '#ec4899',
  Health:        '#06b6d4',
};

export default function SpendingPieChart({
  title = 'Expense Breakdown',
  subtitle = '',
}) {
  const { transactions, selectedCategory, setSelectedCategory } = useApp();

  // Compute category totals from live transactions (expenses only)
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(categoryTotals)
    .filter(([cat]) => cat !== 'Income')
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] || '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = data[0]?.value || 0;

  function handleCategoryClick(name) {
    setSelectedCategory(prev => prev === name ? null : name);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-950 dark:text-white">{title}</h2>
          <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:bg-gray-800/50 dark:text-gray-500">
            Categories
          </span>
        </div>
        {(selectedCategory || subtitle) && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedCategory ? `Category: ${selectedCategory}` : subtitle}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <ul className="space-y-3">
          {data.map(cat => {
            const isSelected = selectedCategory === cat.name;
            const isDimmed = selectedCategory && !isSelected;
            const width = maxValue > 0 ? `${(cat.value / maxValue) * 100}%` : '0%';

            return (
              <li
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`cursor-pointer rounded-2xl border px-4 py-3 transition-all duration-200 ${
                  isSelected
                    ? 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50/80 dark:hover:border-gray-800 dark:hover:bg-gray-800/40'
                } ${isDimmed ? 'opacity-45' : 'opacity-100'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={`truncate text-sm ${isSelected ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className={`shrink-0 text-sm ${isSelected ? 'font-semibold text-gray-950 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                    ₹{cat.value.toFixed(0)}
                  </span>
                </div>

                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width,
                      backgroundColor: cat.color,
                      opacity: isDimmed ? 0.45 : 0.9,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

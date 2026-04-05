import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Reusable summary card for Dashboard.
 * Props:
 *   title    — card label
 *   value    — formatted string (e.g. "$11,400")
 *   icon     — Lucide icon component
 *   color    — 'green' | 'red' | 'blue'
 *   trend    — optional trend percentage string (e.g. "+8.2%")
 *   trendUp  — boolean — true=up (green), false=down (red)
 */
export default function SummaryCard({ title, value, icon: Icon, color, trend, trendUp }) {
  const colorMap = {
    green: {
      bg:   'bg-brand-50 dark:bg-brand-900/20',
      icon: 'bg-brand-500',
      text: 'text-brand-600 dark:text-brand-400',
    },
    red: {
      bg:   'bg-red-50 dark:bg-red-900/20',
      icon: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
    },
    blue: {
      bg:   'bg-blue-50 dark:bg-blue-900/20',
      icon: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-0 max-h-0 opacity-0 overflow-hidden group-hover:max-h-8 group-hover:opacity-100 group-hover:mt-2 transition-all duration-300 ease-out text-xs font-medium ${trendUp ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend} vs last month
            </div>
          )}
        </div>
        <div className={`${c.bg} p-3 rounded-xl`}>
          <div className={`w-9 h-9 ${c.icon} rounded-lg flex items-center justify-center shadow-sm`}>
            <Icon size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

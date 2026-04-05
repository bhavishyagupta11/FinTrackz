import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function SmartInsights({ insights }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
          <Lightbulb size={17} className="text-brand-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Smart Insights</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Live observations generated from your current finances</p>
        </div>
      </div>

      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li
            key={`${insight.title}-${index}`}
            className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{insight.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

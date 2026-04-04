import React from 'react';

const toneClasses = {
  safe: 'bg-brand-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export default function ProgressBar({ value, tone = 'safe' }) {
  const normalized = Math.min(Math.max(value, 0), 100);

  return (
    <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${toneClasses[tone] || toneClasses.safe}`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

const toneStyles = {
  brand: {
    card: 'border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50/55 dark:border-brand-900/40 dark:from-brand-950 dark:via-gray-900 dark:to-emerald-950/20',
    panel: 'bg-white/80 dark:bg-white/5',
    accent: 'bg-brand-500',
    text: 'text-brand-600 dark:text-brand-400',
  },
  neutral: {
    card: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
    panel: 'bg-gray-50 dark:bg-gray-800/80',
    accent: 'bg-gray-900 dark:bg-gray-100',
    text: 'text-gray-600 dark:text-gray-300',
  },
  alert: {
    card: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
    panel: 'bg-red-50 dark:bg-red-950/30',
    accent: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
};

export default function MetricCard({ title, value, subtitle, delta, deltaUp = true, icon: Icon, tone = 'brand', className = '' }) {
  const styles = toneStyles[tone] || toneStyles.brand;

  return (
    <div className={`group rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-30px_rgba(15,23,42,0.24)] dark:hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] ${styles.card} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{title}</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
            <p className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-[2rem]">{value}</p>
            {delta ? (
              <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${deltaUp ? 'bg-brand-100/70 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-red-100/80 text-red-600 dark:bg-red-900/30 dark:text-red-300'}`}>
                {deltaUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{delta.replace(' vs last month', '')}</span>
              </div>
            ) : null}
          </div>
          {subtitle ? <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p> : null}
        </div>
        <div className={`${styles.panel} shrink-0 rounded-2xl p-2.5 ring-1 ring-black/[0.04] dark:ring-white/5`}>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.accent} shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]`}>
            <Icon size={18} className="text-white dark:text-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

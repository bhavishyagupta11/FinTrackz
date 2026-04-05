import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import EmptyState from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { TrendingDown, TrendingUp, Award, BarChart2, Activity } from 'lucide-react';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Custom tooltip for bar chart
function BarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500 dark:text-gray-400 capitalize">{p.name}:</span>
            <span className="font-bold" style={{ color: p.color }}>₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Insights() {
  const { transactions, selectedCategory, setSelectedCategory } = useApp();

  // ── Compute category spending from live transactions ──────────────────────
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const fullCategorySpending = Object.entries(categoryTotals)
    .filter(([cat]) => cat !== 'Income')
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const categorySpending = selectedCategory
    ? fullCategorySpending.filter(item => item.name === selectedCategory)
    : fullCategorySpending;

  const top = categorySpending[0];

  // ── Monthly breakdown for bar chart ──────────────────────────────────────
  const monthlyMap = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    if (!monthlyMap[key]) monthlyMap[key] = { year: d.getFullYear(), monthIdx: d.getMonth(), income: 0, expenses: 0 };
    if (t.type === 'income') monthlyMap[key].income += t.amount;
    else                     monthlyMap[key].expenses += t.amount;
  });

  const monthlyComparison = Object.values(monthlyMap)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthIdx - b.monthIdx)
    .map(({ monthIdx, income, expenses }) => ({
      month: MONTH_LABELS[monthIdx],
      income:   Math.round(income   * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    }));

  // ── Monthly avg expenses ──────────────────────────────────────────────────
  const totalExpenses = categorySpending.reduce((s, c) => s + c.value, 0);
  const numMonths     = Math.max(monthlyComparison.length, 1);
  const monthlyAvg    = (totalExpenses / numMonths).toFixed(2);

  // ── Spending trend: compare last month vs previous month ─────────────────
  let trendPct   = null;
  let trendUp    = false;
  if (monthlyComparison.length >= 2) {
    const last = monthlyComparison.at(-1).expenses;
    const prev = monthlyComparison.at(-2).expenses;
    if (prev > 0) {
      trendPct = (((last - prev) / prev) * 100).toFixed(1);
      trendUp = last > prev;
    }
  }


  // ── Empty state ───────────────────────────────────────────────────────────
  if (transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm py-16">
          <EmptyState message="No data" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page intro */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h2>
      </div>

      {selectedCategory && (
        <div className="flex items-center justify-between rounded-2xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/70 dark:bg-brand-900/10 px-4 py-3 text-sm">
          <span className="text-brand-700 dark:text-brand-300">
            Category: <strong>{selectedCategory}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Highest spending category */}
        <div className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-amber-200 dark:hover:border-amber-800 cursor-default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Award size={16} className="text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Top Spending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{top?.name ?? '—'}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium max-h-0 opacity-0 overflow-hidden group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-300 ease-out">
            {top ? `₹${top.value.toFixed(2)}` : '—'}
          </p>
        </div>

        {/* Monthly average */}
        <div className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-800 cursor-default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <BarChart2 size={16} className="text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Monthly Avg</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{monthlyAvg}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium max-h-0 opacity-0 overflow-hidden group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-300 ease-out">
            Per month
          </p>
        </div>

        {/* Spending trend */}
        <div className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-gray-200 dark:hover:border-gray-700 cursor-default">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trendUp ? 'bg-red-100 dark:bg-red-900/20' : 'bg-brand-100 dark:bg-brand-900/20'}`}>
              {trendUp
                ? <TrendingUp size={16} className="text-red-500" />
                : <TrendingDown size={16} className="text-brand-500" />
              }
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Trend</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {trendPct !== null ? `${trendUp ? '+' : ''}${trendPct}%` : '—'}
          </p>
          <p className={`text-sm font-medium max-h-0 opacity-0 overflow-hidden group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-300 ease-out ${trendUp ? 'text-red-500' : 'text-brand-600 dark:text-brand-400'}`}>
            {trendPct !== null
              ? trendUp ? 'Up' : 'Down'
              : '—'}
          </p>
        </div>
      </div>

      {/* Monthly comparison bar chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-brand-500" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Comparison</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-800" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<BarTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{value}</span>
              )}
            />
            <Bar dataKey="income"   fill="#22c55e" radius={[6, 6, 0, 0]} name="income"   />
            <Bar dataKey="expenses" fill="#f87171" radius={[6, 6, 0, 0]} name="expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

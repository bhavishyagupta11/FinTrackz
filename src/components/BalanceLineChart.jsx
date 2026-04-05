import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Custom tooltip for the line chart
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <p className="text-base font-bold text-brand-600 dark:text-brand-400">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
}

export default function BalanceLineChart() {
  const { transactions } = useApp();

  // Group transactions by year-month, compute net per month
  const monthlyNet = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`; // 0-indexed month
    if (!monthlyNet[key]) monthlyNet[key] = { year: d.getFullYear(), month: d.getMonth(), net: 0 };
    monthlyNet[key].net += t.type === 'income' ? t.amount : -t.amount;
  });

  // Sort by year-month and build running balance
  const sorted = Object.values(monthlyNet).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );

  let running = 0;
  const balanceHistory = sorted.map(({ year, month, net }) => {
    running += net;
    return {
      month: MONTH_LABELS[month],
      balance: Math.round(running * 100) / 100,
    };
  });

  // % change from first to last month
  const pct = balanceHistory.length >= 2
    ? (((balanceHistory.at(-1).balance - balanceHistory[0].balance) / Math.abs(balanceHistory[0].balance)) * 100).toFixed(1)
    : 0;
  const pctLabel = pct >= 0 ? `+${pct}%` : `${pct}%`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Balance Over Time</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Month-by-month trend</p>
        </div>
        <span className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full font-medium">
          {pctLabel}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={balanceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-800" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#22c55e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


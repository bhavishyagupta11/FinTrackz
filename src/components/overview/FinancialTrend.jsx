import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/finance';

function formatDelta(currentValue, previousValue) {
  if (previousValue === undefined || previousValue === null) return 'No prior month';
  if (previousValue === 0) return 'New baseline';

  const delta = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  const prefix = delta >= 0 ? '+' : '';
  return `${prefix}${delta.toFixed(1)}% vs previous month`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const currentValue = Number(point?.balance || 0);
  const previousValue = point?.previousBalance;
  const changeLabel = formatDelta(currentValue, previousValue);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.3)] backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-950 dark:text-white">
        {formatCurrency(currentValue)}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {changeLabel}
      </p>
    </div>
  );
}

export default function FinancialTrend({ data }) {
  const enrichedData = data.map((point, index) => ({
    ...point,
    previousBalance: index > 0 ? data[index - 1].balance : null,
    isLatest: index === data.length - 1,
  }));

  const latestPoint = enrichedData.at(-1);
  const monthToMonthChange = enrichedData.length >= 2
    ? enrichedData.at(-1).balance - enrichedData.at(-2).balance
    : 0;

  return (
    <div className="overflow-hidden rounded-[30px] border border-brand-100 bg-gradient-to-br from-white via-white to-brand-50/60 p-5 shadow-[0_20px_80px_-48px_rgba(34,197,94,0.35)] dark:border-brand-900/40 dark:from-gray-900 dark:via-gray-900 dark:to-brand-950/20 dark:shadow-none sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">Money Graph</h2>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
          monthToMonthChange >= 0
            ? 'bg-brand-100/80 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            : 'bg-red-100/80 text-red-600 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {monthToMonthChange >= 0 ? 'Uptrend' : 'Downtrend'}
        </span>
      </div>

      <div className="min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={248}>
          <AreaChart data={enrichedData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="overviewTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.28} />
                <stop offset="55%" stopColor="#34d399" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="overviewTrendStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" strokeOpacity={0.28} className="dark:stroke-gray-800" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={value => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="url(#overviewTrendStroke)"
              strokeWidth={3}
              fill="url(#overviewTrendFill)"
              dot={({ cx, cy, payload }) => (
                payload.isLatest ? (
                  <g>
                    <circle cx={cx} cy={cy} r={10} fill="#22c55e" fillOpacity="0.14" />
                    <circle cx={cx} cy={cy} r={5.5} fill="#22c55e" stroke="#ffffff" strokeWidth={2} />
                  </g>
                ) : (
                  <circle cx={cx} cy={cy} r={0} fill="transparent" />
                )
              )}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

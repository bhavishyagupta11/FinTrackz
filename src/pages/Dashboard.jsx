import React, { useMemo, useState } from 'react';
import { Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/finance';
import SpendingPieChart from '../components/SpendingPieChart';
import MetricCard from '../components/overview/MetricCard';
import FinancialTrend from '../components/overview/FinancialTrend';
import RecentActivity from '../components/overview/RecentActivity';
import QuickActions from '../components/overview/QuickActions';
import AddTransactionModal from '../components/AddTransactionModal';
import SubscriptionModal from '../components/SubscriptionModal';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlySeries(transactions) {
  const monthlyMap = {};

  transactions.forEach(item => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        year: date.getFullYear(),
        month: date.getMonth(),
        income: 0,
        expenses: 0,
      };
    }

    if (item.type === 'income') monthlyMap[key].income += item.amount;
    else monthlyMap[key].expenses += item.amount;
  });

  const sorted = Object.values(monthlyMap).sort((a, b) => (
    a.year !== b.year ? a.year - b.year : a.month - b.month
  ));

  let runningBalance = 0;
  return sorted.map(item => {
    const cashFlow = item.income - item.expenses;
    runningBalance += cashFlow;
    return {
      key: `${item.year}-${item.month}`,
      month: MONTH_LABELS[item.month],
      income: item.income,
      expenses: item.expenses,
      cashFlow,
      balance: Math.round(runningBalance * 100) / 100,
    };
  });
}

function calculateDelta(current, previous) {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return {
    value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last month`,
    up: pct >= 0,
  };
}

export default function Dashboard() {
  const { transactions, role, setActivePage, addOrUpdateSubscription } = useApp();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalIncome - totalExpense;
  const cashFlow = netWorth;
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const monthlySeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);
  const latestMonth = monthlySeries.at(-1);
  const previousMonth = monthlySeries.at(-2);

  const netWorthDelta = calculateDelta(latestMonth?.balance || 0, previousMonth?.balance || 0);
  const cashFlowDelta = calculateDelta(latestMonth?.cashFlow || 0, previousMonth?.cashFlow || 0);
  const incomeDelta = calculateDelta(latestMonth?.income || 0, previousMonth?.income || 0);
  const expenseDelta = calculateDelta(latestMonth?.expenses || 0, previousMonth?.expenses || 0);

  function handleSubscriptionSave(subscription) {
    addOrUpdateSubscription({
      ...subscription,
      source: 'admin',
    });
    setShowSubscriptionModal(false);
  }

  const isEmpty = transactions.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-1 pb-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Overview</h2>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Updated today</p>
      </div>

      {/* Empty state — no transactions at all */}
      {isEmpty ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-900">
          <EmptyState message="No transactions yet" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Net Worth"
              value={formatCurrency(netWorth)}
              subtitle=""
              delta={netWorthDelta?.value}
              deltaUp={netWorthDelta?.up ?? true}
              icon={Landmark}
              tone="brand"
              className="lg:col-span-2"
            />
            <MetricCard
              title="Cash Flow"
              value={formatCurrency(cashFlow)}
              subtitle=""
              delta={cashFlowDelta?.value}
              deltaUp={cashFlowDelta?.up ?? true}
              icon={Wallet}
              tone={cashFlow >= 0 ? 'neutral' : 'alert'}
              className="lg:col-span-2"
            />
            <MetricCard
              title="Income"
              value={formatCurrency(totalIncome)}
              subtitle="Money in"
              delta={incomeDelta?.value}
              deltaUp={incomeDelta?.up ?? true}
              icon={TrendingUp}
              tone="neutral"
              className="lg:col-span-2"
            />
            <MetricCard
              title="Expenses"
              value={formatCurrency(totalExpense)}
              subtitle="Money out"
              delta={expenseDelta?.value}
              deltaUp={!(expenseDelta?.up ?? false)}
              icon={TrendingDown}
              tone="alert"
              className="lg:col-span-2"
            />
          </div>

          <div className="min-w-0 space-y-6">
            <FinancialTrend data={monthlySeries} />

            <div className="w-full">
              <QuickActions
                role={role}
                onAddTransaction={() => setShowTransactionModal(true)}
                onAddSubscription={() => setShowSubscriptionModal(true)}
                onSetBudget={() => setActivePage('budgets')}
              />
            </div>

            <div className="w-full">
              <SpendingPieChart
                title="Expense Breakdown"
                subtitle=""
              />
            </div>

            <div className="w-full">
              <RecentActivity
                transactions={recentTransactions}
                onViewAll={() => setActivePage('transactions')}
              />
            </div>
          </div>
        </>
      )}

      {showTransactionModal && (
        <AddTransactionModal onClose={() => setShowTransactionModal(false)} />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal
          open={showSubscriptionModal}
          subscription={{ source: 'admin' }}
          source="admin"
          onClose={() => setShowSubscriptionModal(false)}
          onSave={handleSubscriptionSave}
        />
      )}
    </div>
  );
}

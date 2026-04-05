import React from 'react';
import { AlertTriangle, CalendarClock, Pencil, Plus, Repeat, Trash2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/finance';
import {
  formatSubscriptionFrequency,
  formatSubscriptionName,
} from '../utils/subscriptionDetector';
import SubscriptionModal from '../components/SubscriptionModal';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Subscriptions() {
  const { subscriptions, role, addOrUpdateSubscription, removeSubscription, searchFocus } = useApp();
  const [editingSubscription, setEditingSubscription] = React.useState(null);
  const totalMonthlySpend = subscriptions.reduce((sum, item) => sum + Number(item.amount), 0);
  const highCostCount = subscriptions.filter(item => Number(item.amount) >= 150).length;

  function handleSave(subscription) {
    addOrUpdateSubscription({
      ...subscription,
      source: 'admin',
    });
    setEditingSubscription(null);
  }

  function getSourceLabel(source) {
    if (source === 'admin') return 'Admin Added';
    if (source === 'manual') return 'Manual';
    return 'Auto Detected';
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscriptions</h2>
        </div>
        {role === 'admin' && (
          <button
            type="button"
            onClick={() => setEditingSubscription({ source: 'admin' })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Plus size={15} />
            Add Subscription
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <Repeat size={17} className="text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <Wallet size={17} className="text-red-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthlySpend)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <AlertTriangle size={17} className={highCostCount ? 'text-amber-500' : 'text-brand-500'} />
            <span className="text-xs font-semibold uppercase tracking-wide">High Cost</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{highCostCount}</p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No subscriptions</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {subscriptions.map(item => {
              const highCost = Number(item.amount) >= 150;
              const isHighlighted = searchFocus.subscriptionKey === item.subscriptionKey;

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border shadow-sm ${
                    highCost ? 'border-amber-200 dark:border-amber-800/70' : 'border-gray-100 dark:border-gray-800'
                  } ${isHighlighted ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatSubscriptionName(item.name)}
                        </h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          item.source === 'admin'
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                            : item.source === 'manual'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {getSourceLabel(item.source)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatSubscriptionFrequency(item.frequency)} billing cycle
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        highCost
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {highCost ? 'Expensive' : 'Tracked'}
                      </span>
                      {role === 'admin' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingSubscription(item)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSubscription(item)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Monthly Cost</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Last Payment</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatDate(item.lastPayment)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Next Billing</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatDate(item.nextBilling)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarClock size={15} className="text-brand-500" />
                    Monthly billing cycle
                  </div>

                  {item.sampleDescriptions?.length > 0 && (
                    <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 px-4 py-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Merchant Variants</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.sampleDescriptions.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <SubscriptionModal
        open={Boolean(editingSubscription)}
        subscription={editingSubscription}
        source="admin"
        onClose={() => setEditingSubscription(null)}
        onSave={handleSave}
      />
    </div>
  );
}

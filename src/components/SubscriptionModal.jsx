import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const initialForm = {
  name: '',
  amount: '',
  frequency: 'monthly',
  customIntervalDays: '',
  lastPayment: '',
  nextBilling: '',
};

export default function SubscriptionModal({ open, subscription, source = 'admin', onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subscription) {
      setForm(initialForm);
      setError('');
      return;
    }

    setForm({
      name: subscription.name || '',
      amount: String(subscription.amount ?? ''),
      frequency: subscription.frequency || 'monthly',
      customIntervalDays: subscription.customIntervalDays ? String(subscription.customIntervalDays) : '',
      lastPayment: subscription.lastPayment || '',
      nextBilling: subscription.nextBilling || '',
    });
    setError('');
  }, [subscription]);

  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Subscription name is required.');
      return;
    }

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      setError('Enter a valid recurring amount.');
      return;
    }

    if (!form.lastPayment) {
      setError('Last payment date is required.');
      return;
    }

    if (form.frequency === 'custom' && (!Number(form.customIntervalDays) || Number(form.customIntervalDays) <= 0)) {
      setError('Enter valid custom billing days.');
      return;
    }

    onSave({
      ...subscription,
      name: form.name.trim().toLowerCase(),
      amount: Number(form.amount),
      frequency: form.frequency,
      customIntervalDays: form.frequency === 'custom' ? Number(form.customIntervalDays) : undefined,
      lastPayment: form.lastPayment,
      nextBilling: form.nextBilling || undefined,
      source,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {subscription?.id ? 'Edit Subscription' : 'Add Subscription'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Monthly Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={event => setForm(prev => ({ ...prev, amount: event.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Billing Cycle</label>
            <select
              value={form.frequency}
              onChange={event => setForm(prev => ({ ...prev, frequency: event.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {form.frequency === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Custom Days</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.customIntervalDays}
                onChange={event => setForm(prev => ({ ...prev, customIntervalDays: event.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Last Payment</label>
            <input
              type="date"
              value={form.lastPayment}
              onChange={event => setForm(prev => ({ ...prev, lastPayment: event.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Next Billing (Optional)</label>
            <input
              type="date"
              value={form.nextBilling}
              onChange={event => setForm(prev => ({ ...prev, nextBilling: event.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Leave blank to auto-calculate from the billing cycle.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

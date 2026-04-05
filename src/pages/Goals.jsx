import React, { useState } from 'react';
import { Pencil, Plus, Target, Trash2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import { formatCurrency, getGoalLinkedAmount } from '../utils/finance';

const initialForm = {
  name: '',
  targetAmount: '',
  currentSaved: '',
  autoTrack: false,
};

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, transactions, role, searchFocus } = useApp();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const enrichedGoals = goals.map(goal => {
    const linkedAmount = getGoalLinkedAmount(goal, transactions);
    const totalSaved = Number(goal.currentSaved || 0) + linkedAmount;
    const remaining = Math.max(Number(goal.targetAmount || 0) - totalSaved, 0);
    const progress = Number(goal.targetAmount || 0) > 0
      ? (totalSaved / Number(goal.targetAmount)) * 100
      : 0;

    return {
      ...goal,
      linkedAmount,
      totalSaved,
      remaining,
      progress,
      complete: totalSaved >= Number(goal.targetAmount || 0),
    };
  });

  const totalTarget = enrichedGoals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
  const totalSaved = enrichedGoals.reduce((sum, goal) => sum + goal.totalSaved, 0);
  const completedGoals = enrichedGoals.filter(goal => goal.complete).length;

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Goal name is required.');
      return;
    }

    const targetAmount = Number(form.targetAmount);
    const currentSaved = Number(form.currentSaved || 0);

    if (!targetAmount || targetAmount <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    if (currentSaved < 0) {
      setError('Saved amount cannot be negative.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      targetAmount,
      currentSaved,
      autoTrack: form.autoTrack,
    };

    if (editingId) updateGoal(editingId, payload);
    else addGoal(payload);

    resetForm();
  }

  function handleEdit(goal) {
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentSaved: String(goal.currentSaved),
      autoTrack: Boolean(goal.autoTrack),
    });
    setEditingId(goal.id);
    setError('');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Goals</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <Target size={17} className="text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Target</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalTarget)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <Wallet size={17} className="text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Saved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSaved)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
            <Pencil size={17} className="text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-brand-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Edit Goal' : 'Create Goal'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                disabled={role !== 'admin'}
                onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Laptop, Emergency Fund, Trip"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Target Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.targetAmount}
                disabled={role !== 'admin'}
                onChange={(event) => setForm(prev => ({ ...prev, targetAmount: event.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Current Saved
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.currentSaved}
                disabled={role !== 'admin'}
                onChange={(event) => setForm(prev => ({ ...prev, currentSaved: event.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-400 transition disabled:opacity-60"
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
              <input
                type="checkbox"
                checked={form.autoTrack}
                disabled={role !== 'admin'}
                onChange={(event) => setForm(prev => ({ ...prev, autoTrack: event.target.checked }))}
                className="mt-1 accent-brand-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">Auto-track matching income</span>
              </span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={role !== 'admin'}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium transition-colors"
              >
                {editingId ? 'Save Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {enrichedGoals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No goals</h3>
            </div>
          ) : enrichedGoals.map(goal => (
            <div
              key={goal.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm ${
                searchFocus.goalId === goal.id ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      goal.complete
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {goal.complete ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(goal)}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      aria-label={`Delete ${goal.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(Math.round(goal.progress), 100)}%</span>
                </div>
                <ProgressBar value={goal.progress} tone={goal.complete ? 'safe' : 'warning'} />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Manual Saved</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(goal.currentSaved)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Linked Savings</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(goal.linkedAmount)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Remaining</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(goal.remaining)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {role !== 'admin' && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Viewer mode is read-only.
        </div>
      )}
    </div>
  );
}

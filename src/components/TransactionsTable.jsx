import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUp, ChevronDown, Plus, Edit2, Trash2,
  ArrowUpRight, ArrowDownLeft, Download, Repeat,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from './EmptyState';
import AddTransactionModal from './AddTransactionModal';
import CategoryBadge from './CategoryBadge';
import DeleteConfirmModal from './DeleteConfirmModal';
import { buildSubscriptionKey } from '../utils/subscriptionDetector';

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronUp size={13} className="text-gray-300 dark:text-gray-600" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-brand-500" />
    : <ChevronDown size={13} className="text-brand-500" />;
}

export default function TransactionsTable() {
  const {
    transactions,
    ledgerSearchQuery,
    filter,
    setFilter,
    role,
    editTransaction,
    deleteTransaction,
    subscriptions,
    convertTransactionToSubscription,
    searchFocus,
  } = useApp();

  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [pendingDeleteTx, setPendingDeleteTx] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);

  // Close export dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter by type
  let filtered = transactions.filter(tx => {
    if (filter === 'income')  return tx.type === 'income';
    if (filter === 'expense') return tx.type === 'expense';
    return true;
  });

  // Filter by search query — matches description, category, type, and date
  if (ledgerSearchQuery.trim()) {
    const q = ledgerSearchQuery.toLowerCase();
    filtered = filtered.filter(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric',
      }).toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)    ||
        tx.type.toLowerCase().includes(q)         ||
        dateStr.includes(q)                       ||
        tx.date.includes(q)   // raw yyyy-mm-dd match
      );
    });
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'date') {
      va = new Date(va); vb = new Date(vb);
    }
    if (sortField === 'amount') {
      va = Number(va); vb = Number(vb);
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleEdit(tx) {
    setEditingTx(tx);
    setShowModal(true);
  }

  function handleDeleteClick(tx) {
    setPendingDeleteTx(tx);
  }

  function confirmDelete() {
    if (!pendingDeleteTx) return;
    deleteTransaction(pendingDeleteTx.id);
    setPendingDeleteTx(null);
  }

  // --- Export helpers ---
  function triggerDownload(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'];
    const rows = filtered.map(tx => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      tx.type,
      tx.amount.toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(csv, 'transactions.csv', 'text/csv;charset=utf-8;');
    setShowExport(false);
  }

  function exportJSON() {
    const data = filtered.map(({ id, date, description, category, type, amount }) => ({
      id, date, description, category, type, amount,
    }));
    triggerDownload(JSON.stringify(data, null, 2), 'transactions.json', 'application/json');
    setShowExport(false);
  }

  const filterTabs = [
    { key: 'all',     label: 'All' },
    { key: 'income',  label: 'Income' },
    { key: 'expense', label: 'Expenses' },
  ];

  const subscriptionKeys = new Set(subscriptions.map(item => item.subscriptionKey));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Header and Toolbar */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ledger History</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">A complete log of your income and expenses.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
              {filterTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === t.key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Right side: export + admin add */}
            <div className="flex items-center gap-2">
              {/* Export dropdown */}
              <div ref={exportRef} className="relative">
                <button
                  onClick={() => setShowExport(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <Download size={14} /> Export
                </button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-20">
                    <button
                      onClick={exportCSV}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Download CSV
                    </button>
                    <button
                      onClick={exportJSON}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800"
                    >
                      Download JSON
                    </button>
                  </div>
                )}
              </div>

              {/* Admin: Add button */}
              {role === 'admin' && (
                <button
                  onClick={() => { setEditingTx(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                >
                  <Plus size={15} /> Add Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16">
          <EmptyState message="No transactions match your search." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {[
                  { key: 'date',        label: 'Date' },
                  { key: 'description', label: 'Description' },
                  { key: 'category',    label: 'Category' },
                  { key: 'amount',      label: 'Amount' },
                  { key: 'type',        label: 'Type' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(tx => {
                const subscriptionKey = buildSubscriptionKey(tx.description, tx.amount);
                const alreadySubscription = subscriptionKeys.has(subscriptionKey);

                const isHighlighted = searchFocus.transactionId === tx.id;

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${isHighlighted ? 'bg-brand-50/70 dark:bg-brand-900/20' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-100">
                      {tx.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={tx.category} />
                    </td>
                    <td className={`px-5 py-3.5 font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                        tx.type === 'income'
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'income'
                          ? <ArrowUpRight size={11} />
                          : <ArrowDownLeft size={11} />
                        }
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(tx)}
                              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tx)}
                              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                        {tx.type === 'expense' && (
                          <button
                            onClick={() => convertTransactionToSubscription(tx, role === 'admin' ? 'admin' : 'manual')}
                            disabled={alreadySubscription}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60"
                          >
                            <Repeat size={12} />
                            {alreadySubscription ? 'Tracked' : 'Convert to Subscription'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Row count */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          Showing {filtered.length} of {transactions.length} transactions
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <AddTransactionModal
          tx={editingTx}
          onClose={() => setShowModal(false)}
        />
      )}

      <DeleteConfirmModal
        open={!!pendingDeleteTx}
        title="Delete this transaction?"
        message={
          pendingDeleteTx
            ? `Are you sure you want to delete "${pendingDeleteTx.description}"? This will immediately update your ledger, overview totals, and any linked subscription derived from this transaction.`
            : ''
        }
        onCancel={() => setPendingDeleteTx(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
      />
    </div>
  );
}

import React from 'react';
import { Search } from 'lucide-react';
import TransactionsTable from '../components/TransactionsTable';
import { useApp } from '../context/AppContext';

export default function Transactions() {
  const { ledgerSearchQuery, setLedgerSearchQuery } = useApp();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page intro */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ledger Entries</h2>
      </div>

      {/* Inline search (also connected to header search via context) */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search ledger entries..."
          value={ledgerSearchQuery}
          onChange={e => setLedgerSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-400 transition shadow-sm"
        />
      </div>

      {/* Full table */}
      <TransactionsTable />
    </div>
  );
}

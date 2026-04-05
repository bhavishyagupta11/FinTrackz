import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Inbox size={24} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-base font-semibold text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

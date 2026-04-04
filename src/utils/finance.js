export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getMonthKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function getLatestTransactionMonth(transactions, type = 'expense') {
  const pool = type ? transactions.filter(tx => tx.type === type) : transactions;
  const latest = [...pool].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (!latest) {
    return getMonthKey(new Date().toISOString());
  }

  return getMonthKey(latest.date);
}

export function getExpenseCategories(transactions) {
  return [...new Set(
    transactions
      .filter(tx => tx.type === 'expense' && tx.category !== 'Income')
      .map(tx => tx.category)
  )].sort((a, b) => a.localeCompare(b));
}

export function getSpentByCategoryForMonth(transactions, monthKey) {
  return transactions
    .filter(tx => tx.type === 'expense' && getMonthKey(tx.date) === monthKey)
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
}

export function getBudgetInsights(transactions, budgets, monthKey) {
  const categories = getExpenseCategories(transactions);
  const spentMap = getSpentByCategoryForMonth(transactions, monthKey);

  return categories.map(category => {
    const budget = Number(budgets?.[category] || 0);
    const spent = Number(spentMap[category] || 0);
    const remaining = budget - spent;
    const usage = budget > 0 ? (spent / budget) * 100 : 0;

    let status = 'safe';
    if (budget > 0 && spent > budget) status = 'danger';
    else if (budget > 0 && usage >= 80) status = 'warning';

    return {
      category,
      budget,
      spent,
      remaining,
      usage,
      status,
    };
  });
}

export function getGoalLinkedAmount(goal, transactions) {
  if (!goal?.autoTrack) return 0;

  const term = goal.name.trim().toLowerCase();
  if (!term) return 0;

  return transactions
    .filter(tx => tx.type === 'income' && tx.description.toLowerCase().includes(term))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

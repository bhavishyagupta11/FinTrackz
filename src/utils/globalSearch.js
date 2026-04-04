import { getBudgetInsights, getLatestTransactionMonth } from './finance.js';

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function parseAmountQuery(query) {
  const match = normalizeText(query).match(/^(>=|<=|>|<)?\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  return {
    operator: match[1] || '=',
    value: Number(match[2]),
  };
}

function matchesAmount(amount, amountQuery) {
  if (!amountQuery) return false;

  if (amountQuery.operator === '>') return amount > amountQuery.value;
  if (amountQuery.operator === '>=') return amount >= amountQuery.value;
  if (amountQuery.operator === '<') return amount < amountQuery.value;
  if (amountQuery.operator === '<=') return amount <= amountQuery.value;
  return Math.round(amount) === Math.round(amountQuery.value) || String(amount).includes(String(amountQuery.value));
}

function matchesDate(value, query) {
  const date = new Date(value);
  const normalizedQuery = normalizeText(query);
  const monthName = MONTH_NAMES[date.getMonth()];
  const formatted = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toLowerCase();

  if (normalizedQuery === 'this month') {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  return monthName.includes(normalizedQuery) || formatted.includes(normalizedQuery);
}

function includesText(values, query) {
  return values.some(value => normalizeText(value).includes(normalizeText(query)));
}

function limitResults(items, limit = 5) {
  return items.slice(0, limit);
}

export function buildGlobalSearchData({ transactions, subscriptions, goals, budgets }) {
  const categoryMap = transactions
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {});

  const categories = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const budgetMonthKey = getLatestTransactionMonth(transactions, 'expense');
  const budgetRows = getBudgetInsights(transactions, budgets, budgetMonthKey);

  return {
    transactions,
    subscriptions,
    categories,
    budgets: budgetRows,
    goals,
  };
}

export function globalSearch(query, data) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return {
      transactions: [],
      subscriptions: [],
      categories: [],
      budgets: [],
      goals: [],
    };
  }

  const amountQuery = parseAmountQuery(normalizedQuery);

  const transactions = limitResults(
    data.transactions
      .filter(item => (
        includesText([item.description, item.category, item.type], normalizedQuery) ||
        matchesAmount(Number(item.amount), amountQuery) ||
        matchesDate(item.date, normalizedQuery)
      ))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  );

  const subscriptions = limitResults(
    data.subscriptions
      .filter(item => (
        includesText([item.name, item.category, item.source], normalizedQuery) ||
        matchesAmount(Number(item.amount), amountQuery) ||
        matchesDate(item.lastPayment, normalizedQuery) ||
        matchesDate(item.nextBilling, normalizedQuery)
      ))
      .sort((a, b) => Number(b.amount) - Number(a.amount))
  );

  const categories = limitResults(
    data.categories
      .filter(item => (
        includesText([item.name], normalizedQuery) ||
        matchesAmount(Number(item.amount), amountQuery)
      ))
      .sort((a, b) => b.amount - a.amount)
  );

  const budgets = limitResults(
    data.budgets
      .filter(item => (
        includesText([item.category], normalizedQuery) ||
        matchesAmount(Number(item.budget), amountQuery) ||
        matchesAmount(Number(item.spent), amountQuery) ||
        matchesAmount(Number(item.remaining), amountQuery)
      ))
      .sort((a, b) => Math.abs(b.spent) - Math.abs(a.spent))
  );

  const goals = limitResults(
    data.goals
      .filter(item => (
        includesText([item.name], normalizedQuery) ||
        matchesAmount(Number(item.targetAmount), amountQuery) ||
        matchesAmount(Number(item.totalSaved), amountQuery) ||
        matchesAmount(Number(item.remaining), amountQuery)
      ))
      .sort((a, b) => Number(b.targetAmount) - Number(a.targetAmount))
  );

  return {
    transactions,
    subscriptions,
    categories,
    budgets,
    goals,
  };
}

import {
  buildSubscriptionKey,
  detectSubscriptions,
  getCanonicalMerchant,
  getNextBillingDate,
} from './subscriptionDetector.js';

function toStoredSubscription(record) {
  const frequency = record.frequency || 'monthly';
  const amount = Number(record.amount ?? record.averageMonthlyCost ?? 0);
  const lastPayment = record.lastPayment || record.lastPaymentDate || new Date().toISOString().split('T')[0];
  const customIntervalDays = frequency === 'custom' ? Number(record.customIntervalDays || 30) : undefined;

  return {
    id: record.id || Date.now(),
    subscriptionKey: record.subscriptionKey || buildSubscriptionKey(record.name, amount),
    name: record.name,
    amount,
    frequency,
    customIntervalDays,
    lastPayment,
    nextBilling: record.nextBilling || getNextBillingDate(lastPayment, frequency, customIntervalDays),
    source: record.source,
    category: record.category || 'Entertainment',
    transactionId: record.transactionId ?? null,
  };
}

export function createSubscriptionFromTransaction(transaction, source = 'manual') {
  const name = getCanonicalMerchant(transaction.description);

  return toStoredSubscription({
    name,
    amount: transaction.amount,
    frequency: 'monthly',
    lastPayment: transaction.date,
    source,
    category: transaction.category,
    transactionId: transaction.id,
  });
}

export function mergeSubscriptionSources(transactions, storedSubscriptions, excludedKeys) {
  const excluded = new Set(excludedKeys || []);
  const customByKey = new Map();

  (storedSubscriptions || []).forEach(record => {
    const normalized = toStoredSubscription(record);
    customByKey.set(normalized.subscriptionKey, normalized);
  });

  const autoSubscriptions = detectSubscriptions(transactions)
    .filter(item => !excluded.has(item.subscriptionKey) && !customByKey.has(item.subscriptionKey))
    .map(item => ({
      id: item.id,
      subscriptionKey: item.subscriptionKey,
      name: item.name,
      amount: item.averageMonthlyCost,
      frequency: item.frequency,
      customIntervalDays: item.frequency === 'custom' ? item.intervalDays : undefined,
      lastPayment: item.lastPaymentDate,
      nextBilling: item.nextPaymentDate,
      source: 'auto',
      category: item.category,
      transactionId: null,
      displayName: item.displayName,
      sampleDescriptions: item.sampleDescriptions,
    }));

  const customSubscriptions = [...customByKey.values()]
    .filter(item => !excluded.has(item.subscriptionKey))
    .map(item => ({
      ...item,
      displayName: item.name,
      sampleDescriptions: [],
    }));

  return [...customSubscriptions, ...autoSubscriptions]
    .sort((a, b) => Number(b.amount) - Number(a.amount));
}

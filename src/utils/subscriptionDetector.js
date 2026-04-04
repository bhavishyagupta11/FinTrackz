const WEEKLY_MIN_DAYS = 6;
const WEEKLY_MAX_DAYS = 8;
const MONTHLY_MIN_DAYS = 25;
const MONTHLY_MAX_DAYS = 35;
const MIN_CONFIDENCE = 60;
const KEYWORD_SCORE = 10;
const RECURRENCE_SCORE = 40;
const AMOUNT_SCORE = 30;
const NAME_SCORE = 20;

const KEYWORDS = [
  'premium',
  'subscription',
  'membership',
  'plan',
  'billing',
  'renewal',
  'streaming',
];

const STOP_WORDS = new Set([
  'com',
  'india',
  'ab',
  'pvt',
  'ltd',
  'inc',
  'llc',
  'the',
  'and',
]);

export function normalizeMerchantName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeMerchant(name) {
  return normalizeMerchantName(name)
    .split(' ')
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

export function getCanonicalMerchant(name) {
  const tokens = tokenizeMerchant(name);
  return tokens[0] || normalizeMerchantName(name);
}

export function buildSubscriptionKey(name, amount) {
  return `${getCanonicalMerchant(name)}-${Math.round(Number(amount || 0) * 100)}`;
}

function compareMerchantNames(left, right) {
  const leftTokens = tokenizeMerchant(left);
  const rightTokens = tokenizeMerchant(right);

  if (!leftTokens.length || !rightTokens.length) {
    return { isSimilar: false, score: 0 };
  }

  const overlap = leftTokens.filter(token => rightTokens.includes(token));
  const union = [...new Set([...leftTokens, ...rightTokens])];
  const similarity = overlap.length / union.length;

  return {
    isSimilar: similarity >= 0.34 || leftTokens.some(token => rightTokens.join(' ').includes(token)) || rightTokens.some(token => leftTokens.join(' ').includes(token)),
    score: similarity,
  };
}

function getAmountConsistency(items) {
  const amounts = items.map(item => Number(item.amount));
  const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const withinTolerance = amounts.every(amount => Math.abs(amount - average) / average <= 0.1);

  return {
    average,
    withinTolerance,
  };
}

function getIntervals(items) {
  return items.slice(1).map((item, index) => {
    const previous = new Date(items[index].date);
    const current = new Date(item.date);
    return Math.round((current - previous) / (1000 * 60 * 60 * 24));
  });
}

function findCadenceSequence(items, minDays, maxDays, frequency) {
  let bestSequence = [];

  for (let startIndex = 0; startIndex < items.length; startIndex += 1) {
    const sequence = [items[startIndex]];
    let lastIncluded = items[startIndex];

    for (let index = startIndex + 1; index < items.length; index += 1) {
      const gap = Math.round((new Date(items[index].date) - new Date(lastIncluded.date)) / (1000 * 60 * 60 * 24));
      if (gap >= minDays && gap <= maxDays) {
        sequence.push(items[index]);
        lastIncluded = items[index];
      }
    }

    if (sequence.length > bestSequence.length) {
      bestSequence = sequence;
    }
  }

  if (bestSequence.length < 2) {
    return { frequency: null, averageInterval: null, items: [] };
  }

  const intervals = getIntervals(bestSequence);
  return {
    frequency,
    averageInterval: Math.round(intervals.reduce((sum, days) => sum + days, 0) / intervals.length),
    items: bestSequence,
  };
}

function analyzeFrequency(items) {
  const monthly = findCadenceSequence(items, MONTHLY_MIN_DAYS, MONTHLY_MAX_DAYS, 'monthly');
  const weekly = findCadenceSequence(items, WEEKLY_MIN_DAYS, WEEKLY_MAX_DAYS, 'weekly');

  if (monthly.items.length >= weekly.items.length && monthly.items.length >= 2) {
    return monthly;
  }

  if (weekly.items.length >= 2) {
    return weekly;
  }

  return { frequency: null, averageInterval: null, items: [] };
}

function toMonthlyCost(averageAmount, frequency) {
  if (frequency === 'weekly') return averageAmount * 52 / 12;
  return averageAmount;
}

function predictNextDate(lastPaymentDate, averageInterval) {
  const next = new Date(lastPaymentDate);
  next.setDate(next.getDate() + averageInterval);
  return next.toISOString().split('T')[0];
}

export function getIntervalDays(frequency, customIntervalDays) {
  if (frequency === 'weekly') return 7;
  if (frequency === 'custom') return Number(customIntervalDays) || 30;
  return 30;
}

export function getNextBillingDate(lastPaymentDate, frequency = 'monthly', customIntervalDays) {
  return predictNextDate(lastPaymentDate, getIntervalDays(frequency, customIntervalDays));
}

function buildGroups(transactions) {
  const groups = [];

  transactions
    .filter(tx => tx.type === 'expense')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(tx => {
      const matchingGroup = groups.find(group => {
        const nameMatch = compareMerchantNames(group.merchantSeed, tx.description);
        const amountDelta = Math.abs(group.averageAmount - tx.amount) / Math.max(group.averageAmount, tx.amount);
        return nameMatch.isSimilar && amountDelta <= 0.1;
      });

      if (matchingGroup) {
        matchingGroup.items.push(tx);
        matchingGroup.averageAmount =
          matchingGroup.items.reduce((sum, item) => sum + Number(item.amount), 0) / matchingGroup.items.length;
        matchingGroup.nameScores.push(compareMerchantNames(matchingGroup.merchantSeed, tx.description).score);
        return;
      }

      groups.push({
        merchantSeed: tx.description,
        items: [tx],
        averageAmount: Number(tx.amount),
        nameScores: [1],
      });
    });

  return groups;
}

export function detectSubscriptions(transactions) {
  return buildGroups(transactions)
    .map(group => {
      const groupedItems = [...group.items].sort((a, b) => new Date(a.date) - new Date(b.date));
      if (groupedItems.length < 2) return null;

      const frequency = analyzeFrequency(groupedItems);
      const items = frequency.items.length ? frequency.items : groupedItems;
      const amountConsistency = getAmountConsistency(items);
      const averageNameScore = group.nameScores.reduce((sum, score) => sum + score, 0) / group.nameScores.length;
      const normalizedName = getCanonicalMerchant(group.merchantSeed);
      const keywordMatched = KEYWORDS.some(keyword => normalizeMerchantName(group.merchantSeed).includes(keyword));

      let confidence = 0;
      if (frequency.frequency && items.length >= 2) confidence += RECURRENCE_SCORE;
      if (amountConsistency.withinTolerance) confidence += AMOUNT_SCORE;
      if (averageNameScore >= 0.34) confidence += NAME_SCORE;
      if (keywordMatched) confidence += KEYWORD_SCORE;

      if (items.length < 3 && frequency.frequency === 'monthly') {
        confidence -= 10;
      }

      if (!frequency.frequency || !amountConsistency.withinTolerance || confidence < MIN_CONFIDENCE) {
        return null;
      }

      const lastPaymentDate = items.at(-1).date;
      const nextPaymentDate = predictNextDate(lastPaymentDate, frequency.averageInterval);
      const representative = [...items].sort((a, b) => a.description.length - b.description.length)[0];

      return {
        id: `${normalizedName}-${Math.round(amountConsistency.average * 100)}`,
        subscriptionKey: buildSubscriptionKey(normalizedName, amountConsistency.average),
        name: normalizedName,
        displayName: representative.description,
        normalizedMerchant: normalizedName,
        averageAmount: amountConsistency.average,
        averageMonthlyCost: toMonthlyCost(amountConsistency.average, frequency.frequency),
        frequency: frequency.frequency,
        intervalDays: frequency.averageInterval,
        lastPaymentDate,
        nextPaymentDate,
        confidenceScore: Math.min(confidence, 100),
        occurrences: items.length,
        category: representative.category,
        sampleDescriptions: [...new Set(items.map(item => item.description))],
        source: 'auto',
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.averageMonthlyCost - a.averageMonthlyCost);
}

export function formatSubscriptionFrequency(frequency) {
  if (frequency === 'weekly') return 'Weekly';
  if (frequency === 'custom') return 'Custom';
  if (frequency === 'monthly') return 'Monthly';
  return 'Recurring';
}

export function formatSubscriptionName(name) {
  if (!name) return 'Unknown';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

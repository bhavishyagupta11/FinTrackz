// Mock transactions data — 20 static records
export const transactions = [
  { id: 1,  date: '2026-01-05', description: 'Grocery Store',      category: 'Food',          amount: 85.50,  type: 'expense' },
  { id: 2,  date: '2026-01-07', description: 'Salary',             category: 'Income',        amount: 3500.00,type: 'income'  },
  { id: 3,  date: '2026-01-09', description: 'Netflix',            category: 'Entertainment', amount: 200.00, type: 'expense' },
  { id: 21, date: '2026-01-10', description: 'Spotify Premium',    category: 'Entertainment', amount: 90.00,  type: 'expense' },
  { id: 4,  date: '2026-01-12', description: 'Electricity Bill',   category: 'Utilities',     amount: 120.00, type: 'expense' },
  { id: 24, date: '2026-01-15', description: 'Netflix Subscription', category: 'Entertainment', amount: 200.00, type: 'expense' },
  { id: 5,  date: '2026-01-15', description: 'Flight to NYC',      category: 'Travel',        amount: 340.00, type: 'expense' },
  { id: 6,  date: '2026-01-18', description: 'Freelance Project',  category: 'Income',        amount: 750.00, type: 'income'  },
  { id: 7,  date: '2026-01-20', description: 'Amazon Shopping',    category: 'Shopping',      amount: 210.00, type: 'expense' },
  { id: 8,  date: '2026-01-22', description: 'Restaurant Dinner',  category: 'Food',          amount: 65.00,  type: 'expense' },
  { id: 9,  date: '2026-02-01', description: 'Gym Membership',     category: 'Health',        amount: 45.00,  type: 'expense' },
  { id: 10, date: '2026-02-03', description: 'Salary',             category: 'Income',        amount: 3500.00,type: 'income'  },
  { id: 11, date: '2026-02-06', description: 'Doctor Visit',       category: 'Health',        amount: 90.00,  type: 'expense' },
  { id: 22, date: '2026-02-10', description: 'SPOTIFY AB',         category: 'Entertainment', amount: 90.00,  type: 'expense' },
  { id: 12, date: '2026-02-10', description: 'Online Course',      category: 'Shopping',      amount: 29.99,  type: 'expense' },
  { id: 13, date: '2026-02-14', description: 'Valentine Dinner',   category: 'Food',          amount: 95.00,  type: 'expense' },
  { id: 25, date: '2026-02-15', description: 'NETFLIX.COM',        category: 'Entertainment', amount: 200.00, type: 'expense' },
  { id: 14, date: '2026-02-18', description: 'Internet Bill',      category: 'Utilities',     amount: 60.00,  type: 'expense' },
  { id: 15, date: '2026-02-22', description: 'Bonus',              category: 'Income',        amount: 500.00, type: 'income'  },
  { id: 16, date: '2026-03-01', description: 'Salary',             category: 'Income',        amount: 3500.00,type: 'income'  },
  { id: 17, date: '2026-03-05', description: 'Hotel Stay',         category: 'Travel',        amount: 220.00, type: 'expense' },
  { id: 23, date: '2026-03-10', description: 'Spotify India',      category: 'Entertainment', amount: 90.00,  type: 'expense' },
  { id: 18, date: '2026-03-10', description: 'Coffee Beans',       category: 'Food',          amount: 22.00,  type: 'expense' },
  { id: 26, date: '2026-03-15', description: 'Netflix India',      category: 'Entertainment', amount: 200.00, type: 'expense' },
  { id: 19, date: '2026-03-15', description: 'New Headphones',     category: 'Shopping',      amount: 180.00, type: 'expense' },
  { id: 20, date: '2026-03-20', description: 'Spotify',            category: 'Entertainment', amount: 90.00,  type: 'expense' },
];

// 12-month balance history for line chart
export const balanceHistory = [
  { month: 'Apr', balance: 4200 },
  { month: 'May', balance: 5100 },
  { month: 'Jun', balance: 4700 },
  { month: 'Jul', balance: 6200 },
  { month: 'Aug', balance: 5900 },
  { month: 'Sep', balance: 7400 },
  { month: 'Oct', balance: 6800 },
  { month: 'Nov', balance: 8100 },
  { month: 'Dec', balance: 7600 },
  { month: 'Jan', balance: 9200 },
  { month: 'Feb', balance: 10100 },
  { month: 'Mar', balance: 11400 },
];

// Spending by category for pie chart (expenses only)
export const categorySpending = [
  { name: 'Food',          value: 267.50, color: '#22c55e' },
  { name: 'Shopping',      value: 419.99, color: '#3b82f6' },
  { name: 'Travel',        value: 560.00, color: '#f59e0b' },
  { name: 'Utilities',     value: 180.00, color: '#8b5cf6' },
  { name: 'Entertainment', value:  25.98, color: '#ec4899' },
  { name: 'Health',        value: 135.00, color: '#06b6d4' },
];

// Monthly comparison data for bar chart in Insights
export const monthlyComparison = [
  { month: 'Jan', income: 4250, expenses: 836.49 },
  { month: 'Feb', income: 4000, expenses: 224.99 },
  { month: 'Mar', income: 3500, expenses: 431.99 },
];

// Category taglines — friendly messages per category
export const categoryTaglines = {
  Food:          "Eating fresh and healthy is a smart investment 🥗",
  Shopping:      "Keep an eye on lifestyle spending — every rupee counts 🛍️",
  Travel:        "Memories are valuable, but budget wisely ✈️",
  Utilities:     "Essentials first — you're managing necessities well 💡",
  Entertainment: "A little fun is healthy — you're in good balance 🎬",
  Health:        "Investing in your health is always worth it 💪",
  Income:        "Great job — your income is growing steadily 🚀",
};

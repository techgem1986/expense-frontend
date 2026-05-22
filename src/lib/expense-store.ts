// Local storage backed expense store for the redesigned UI
// Alongside the existing API-based store, this provides seed data for the UI

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number; // negative = expense, positive = income
  date: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export const CATEGORIES = [
  'Infrastructure',
  'Lifestyle',
  'Food',
  'Transport',
  'Entertainment',
  'Health',
  'Income',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

const EXPENSES_KEY = 'ledger.expenses.v1';
const BUDGETS_KEY = 'ledger.budgets.v1';

// Helper: days ago ISO string
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Seed data: 10 transactions across last 10 days
const SEED_EXPENSES: Expense[] = [
  { id: '1', title: 'Cloud Server', category: 'Infrastructure', amount: -340.0, date: daysAgo(1) },
  { id: '2', title: 'Groceries', category: 'Food', amount: -85.5, date: daysAgo(2) },
  { id: '3', title: 'Freelance Pay', category: 'Income', amount: 2500.0, date: daysAgo(2) },
  { id: '4', title: 'Netflix', category: 'Entertainment', amount: -15.99, date: daysAgo(3) },
  { id: '5', title: 'Gym Membership', category: 'Health', amount: -50.0, date: daysAgo(4) },
  { id: '6', title: 'Uber', category: 'Transport', amount: -24.0, date: daysAgo(5) },
  { id: '7', title: 'Dinner Out', category: 'Food', amount: -62.0, date: daysAgo(6) },
  { id: '8', title: 'AWS Credits', category: 'Infrastructure', amount: -180.0, date: daysAgo(7) },
  { id: '9', title: 'Design Sprint', category: 'Income', amount: 1200.0, date: daysAgo(8) },
  { id: '10', title: 'Spotify', category: 'Entertainment', amount: -9.99, date: daysAgo(9) },
];

const SEED_BUDGETS: Budget[] = [
  { category: 'Food', limit: 600 },
  { category: 'Infrastructure', limit: 3000 },
  { category: 'Entertainment', limit: 150 },
  { category: 'Transport', limit: 200 },
  { category: 'Health', limit: 200 },
];

// Initialize localStorage with seeds if not present
function init() {
  if (!localStorage.getItem(EXPENSES_KEY)) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(SEED_EXPENSES));
  }
  if (!localStorage.getItem(BUDGETS_KEY)) {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(SEED_BUDGETS));
  }
}

init();

export function getExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addExpense(expense: Omit<Expense, 'id' | 'date'>): void {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: window.crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  expenses.unshift(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  window.dispatchEvent(new Event('ledger:update'));
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter((e) => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  window.dispatchEvent(new Event('ledger:update'));
}

export function upsertBudget(budget: Budget): void {
  const budgets = getBudgets();
  const idx = budgets.findIndex((b) => b.category === budget.category);
  if (idx >= 0) {
    budgets[idx] = budget;
  } else {
    budgets.push(budget);
  }
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  window.dispatchEvent(new Event('ledger:update'));
}

export function deleteBudget(category: string): void {
  const budgets = getBudgets().filter((b) => b.category !== category);
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  window.dispatchEvent(new Event('ledger:update'));
}

export function formatCurrency(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useExpenses(): Expense[] {
  try {
    // Read current state
    return getExpenses();
  } catch {
    return [];
  }
}

export function useBudgets(): Budget[] {
  try {
    return getBudgets();
  } catch {
    return [];
  }
}

// Get total spent per category from expenses
export function getSpentByCategory(): Record<string, number> {
  const expenses = getExpenses();
  const spent: Record<string, number> = {};
  for (const e of expenses) {
    if (e.amount < 0) {
      const cat = e.category;
      spent[cat] = (spent[cat] || 0) + Math.abs(e.amount);
    }
  }
  return spent;
}

// Get total income
export function getTotalIncome(): number {
  return getExpenses()
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
}

// Get total expenses
export function getTotalExpenses(): number {
  return getExpenses()
    .filter((e) => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
}

// Get last 14 days of spending for AreaChart
export function getLast14DaysSpending(): { day: string; spend: number }[] {
  const expenses = getExpenses();
  const result: { day: string; spend: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    const spend = expenses
      .filter((e) => e.amount < 0 && e.date >= dayStart && e.date < dayEnd)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    result.push({ day: dayStr, spend });
  }
  return result;
}

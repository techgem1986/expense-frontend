import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns/format';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import DashboardCard from '../components/ui/DashboardCard';
import EmptyState from '../components/ui/EmptyState';
import {
  ChartCardSkeleton,
  ListCardSkeleton,
  StatCardSkeleton,
  TableCardSkeleton,
} from '../components/ui/Skeleton';
import VolumeAreaChart from '../components/dashboard/VolumeAreaChart';
import CategoryBreakdownChart from '../components/dashboard/CategoryBreakdownChart';
import ResponseBarsChart from '../components/dashboard/ResponseBarsChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import BudgetHealthList, { BudgetHealthItem } from '../components/dashboard/BudgetHealthList';
import RecentRecordsTable, { RecentRecord } from '../components/dashboard/RecentRecordsTable';
import ActivityFeed, { ActivityItem } from '../components/dashboard/ActivityFeed';
import SetupWizard from '../components/setup/SetupWizard';
import {
  accountAPI,
  alertAPI,
  analyticsAPI,
  budgetAPI,
  categoryAPI,
  recurringTransactionAPI,
  transactionAPI,
} from '../services/api';
import { AlertResponse, AnalyticsResponse, BudgetResponse, TransactionResponse } from '../types';
import { Account } from '../types/account';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const MONTH_RANGES = [6, 12, 24];

/** Compact, currency-agnostic axis label (e.g. 12k, 1.4L). */
const compactNumber = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
};

const computeDelta = (current: number, previous: number) => {
  if (!Number.isFinite(previous) || previous === 0) return undefined;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return {
    value: `${Math.abs(pct).toFixed(1)}%`,
    direction: (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    comparison: 'vs last month',
  };
};

const Dashboard: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeMonths, setRangeMonths] = useState(12);
  const [showSetup, setShowSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [analyticsRes, accountsRes, budgetsRes, txRes, alertsRes] = await Promise.allSettled([
      analyticsAPI.getAnalytics(),
      accountAPI.getAll(),
      budgetAPI.getAll(0, 50),
      transactionAPI.getAll(0, 8, 'createdAt,desc'),
      alertAPI.getAll(0, 6),
    ]);

    if (analyticsRes.status === 'fulfilled') {
      setAnalytics(analyticsRes.value.data?.data ?? null);
    } else {
      setError(getErrorMessage(analyticsRes.reason, 'Failed to load analytics'));
      setAnalytics(null);
    }

    if (accountsRes.status === 'fulfilled') {
      const data = accountsRes.value.data?.data?.content || accountsRes.value.data?.data || [];
      setAccounts(Array.isArray(data) ? data : []);
    }

    if (budgetsRes.status === 'fulfilled') {
      setBudgets(budgetsRes.value.data?.data?.content || []);
    }

    if (txRes.status === 'fulfilled') {
      setTransactions(txRes.value.data?.data?.content || []);
    }

    if (alertsRes.status === 'fulfilled') {
      const data = alertsRes.value.data?.data?.content || alertsRes.value.data?.data || [];
      setAlerts(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  }, []);

  const checkSetupStatus = useCallback(async () => {
    const [accRes, catRes, recRes] = await Promise.allSettled([
      accountAPI.getAll(0, 5),
      categoryAPI.getAll(0, 5),
      recurringTransactionAPI.getAll(0, 5),
    ]);

    const size = (result: PromiseSettledResult<{ data?: { data?: unknown } }>) => {
      if (result.status !== 'fulfilled') return 0;
      const body = result.value.data?.data as { content?: unknown[] } | unknown[] | undefined;
      const content = (body as { content?: unknown[] })?.content ?? body;
      return Array.isArray(content) ? content.length : 0;
    };

    try {
      if (size(accRes) + size(catRes) + size(recRes) === 0) setShowSetup(true);
    } finally {
      setCheckingSetup(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    checkSetupStatus();
  }, [fetchAll, checkSetupStatus]);

  const handleWizardComplete = () => {
    setShowSetup(false);
    localStorage.setItem('setupWizardDismissed', 'true');
    fetchAll();
  };

  const handleWizardSkip = () => {
    setShowSetup(false);
    localStorage.setItem('setupWizardDismissed', 'true');
  };

  const monthlySpending = analytics?.monthlySpending ?? [];
  const totalIncome = analytics?.totalIncome ?? 0;
  const totalExpenses = analytics?.totalExpenses ?? 0;
  const netBalance = analytics?.netBalance ?? 0;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const lastMonth = monthlySpending[monthlySpending.length - 1];
  const prevMonth = monthlySpending[monthlySpending.length - 2];

  const incomeDelta =
    lastMonth && prevMonth ? computeDelta(lastMonth.income, prevMonth.income) : undefined;
  const expenseDelta =
    lastMonth && prevMonth ? computeDelta(lastMonth.expenses, prevMonth.expenses) : undefined;
  const netDelta =
    lastMonth && prevMonth ? computeDelta(lastMonth.balance, prevMonth.balance) : undefined;

  const windowedMonths = monthlySpending.slice(-rangeMonths);

  const volumeData = windowedMonths.map((m) => ({
    date: m.month,
    value: convertAmount(m.expenses),
  }));

  const barsData = windowedMonths.map((m) => ({
    date: m.month,
    Income: convertAmount(m.income),
    Expenses: convertAmount(m.expenses),
  }));

  const trendData = windowedMonths.map((m) => ({
    date: m.month,
    value: convertAmount(m.balance),
  }));

  const breakdownItems = (analytics?.spendingByCategory ?? [])
    .slice()
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item) => ({
      label: item.categoryName,
      value: convertAmount(item.totalAmount),
      percentage: item.percentage,
    }));

  const budgetItems: BudgetHealthItem[] = budgets.map((budget) => ({
    id: budget.id,
    name: budget.name,
    spent: convertAmount(budget.currentSpent),
    limit: convertAmount(budget.limitAmount),
    percentage: budget.spentPercentage,
    isOver: budget.isOverBudget,
  }));

  const recentRecords: RecentRecord[] = transactions.map((tx) => ({
    id: tx.id,
    primaryLabel: tx.description || tx.category?.name || 'Transaction',
    secondaryLabel: tx.category?.name || '—',
    category: tx.type,
    timeMetric: format(new Date(tx.transactionDate), 'MMM d'),
    status: tx.type === 'INCOME' ? 'Income' : tx.type === 'TRANSFER' ? 'Transfer' : 'Expense',
    statusTone: tx.type === 'INCOME' ? 'success' : tx.type === 'TRANSFER' ? 'info' : 'neutral',
  }));

  const activityItems: ActivityItem[] = [
    ...transactions.map((tx) => ({
      id: `tx-${tx.id}`,
      message:
        tx.type === 'INCOME'
          ? `Income of ${formatAmount(convertAmount(tx.amount))} recorded`
          : tx.type === 'TRANSFER'
            ? `Transfer of ${formatAmount(convertAmount(tx.amount))} completed`
            : `Expense of ${formatAmount(convertAmount(tx.amount))} recorded`,
      timestamp: tx.createdAt,
      icon: <Receipt className="h-3.5 w-3.5" />,
    })),
    ...alerts.map((alert) => ({
      id: `alert-${alert.id}`,
      message: alert.message,
      timestamp: alert.createdAt,
      icon: <Bell className="h-3.5 w-3.5" />,
    })),
  ];

  const activeAccounts = accounts.filter((account) => account.isActive !== false);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={['Overview']}
        title="Dashboard"
        description="Income, spending and budget health at a glance."
        actions={
          <>
            <label className="sr-only" htmlFor="dashboard-range">
              Time range
            </label>
            <select
              id="dashboard-range"
              value={rangeMonths}
              onChange={(event) => setRangeMonths(Number(event.target.value))}
              className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {MONTH_RANGES.map((months) => (
                <option key={months} value={months}>
                  Last {months} months
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={fetchAll}
              className="btn-secondary h-9 gap-1.5 px-3 text-xs"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Refresh
            </button>
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <span>{error}</span>
          <button type="button" onClick={fetchAll} className="btn-danger h-8 px-3 text-xs">
            Retry
          </button>
        </div>
      )}

      {showSetup && !checkingSetup && (
        <SetupWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
      )}

      {loading && !analytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCardSkeleton className="lg:col-span-2" />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ListCardSkeleton />
            <TableCardSkeleton className="lg:col-span-2" />
            <ListCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total income"
              value={formatAmount(convertAmount(totalIncome))}
              delta={incomeDelta}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              label="Total expenses"
              value={formatAmount(convertAmount(totalExpenses))}
              delta={expenseDelta ? { ...expenseDelta, invert: true } : undefined}
              icon={<Receipt className="h-4 w-4" />}
            />
            <StatCard
              label="Net balance"
              value={formatAmount(convertAmount(netBalance))}
              delta={netDelta}
              icon={<Wallet className="h-4 w-4" />}
            />
            <StatCard
              label="Savings rate"
              value={`${savingsRate.toFixed(1)}%`}
              delta={netDelta}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Analytics grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DashboardCard
              title="Spending volume"
              description={`Expenses recorded per month, last ${rangeMonths} months.`}
              className="lg:col-span-2"
            >
              {volumeData.length > 0 ? (
                <VolumeAreaChart
                  data={volumeData}
                  valueFormatter={(value) => formatAmount(value)}
                  yTickFormatter={compactNumber}
                />
              ) : (
                <EmptyState
                  title="No spending recorded"
                  description="Monthly expenses will appear here once you add transactions."
                />
              )}
            </DashboardCard>

            <DashboardCard title="Spending by category" description="Share of total expenses.">
              {breakdownItems.length > 0 ? (
                <CategoryBreakdownChart
                  items={breakdownItems}
                  valueFormatter={(value) => formatAmount(value)}
                />
              ) : (
                <EmptyState
                  title="No categories yet"
                  description="Categorise transactions to see the split."
                />
              )}
            </DashboardCard>

            <DashboardCard title="Income vs expenses" description="Monthly totals side by side.">
              {barsData.length > 0 ? (
                <ResponseBarsChart
                  data={barsData}
                  series={[
                    { key: 'Income', label: 'Income' },
                    { key: 'Expenses', label: 'Expenses' },
                  ]}
                  valueFormatter={compactNumber}
                />
              ) : (
                <EmptyState
                  title="No monthly data"
                  description="Add transactions to compare income and expenses."
                />
              )}
            </DashboardCard>

            <DashboardCard title="Net flow trend" description="Monthly income minus expenses.">
              {trendData.length > 0 ? (
                <TrendLineChart
                  data={trendData}
                  showLabels={trendData.length <= 12}
                  valueFormatter={compactNumber}
                />
              ) : (
                <EmptyState
                  title="No trend yet"
                  description="Net flow appears after your first month of activity."
                />
              )}
            </DashboardCard>

            <DashboardCard title="Budget health" description="Utilisation of active budgets.">
              {budgetItems.length > 0 ? (
                <BudgetHealthList items={budgetItems} formatAmount={formatAmount} />
              ) : (
                <EmptyState
                  title="No budgets set"
                  description="Create a budget to track utilisation."
                />
              )}
            </DashboardCard>

            <DashboardCard
              title="Recent transactions"
              description="Latest activity from your ledger."
              className="lg:col-span-2"
              action={
                <Link
                  to="/transactions"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              {recentRecords.length > 0 ? (
                <RecentRecordsTable records={recentRecords} />
              ) : (
                <EmptyState
                  title="No transactions yet"
                  description="Your most recent records will appear here."
                />
              )}
            </DashboardCard>

            <DashboardCard title="Activity" description="Latest ledger and alert events.">
              {activityItems.length > 0 ? (
                <ActivityFeed items={activityItems} max={6} />
              ) : (
                <EmptyState
                  title="No activity yet"
                  description="Ledger events will appear here as you use the app."
                />
              )}
            </DashboardCard>

            <DashboardCard
              title="Account balances"
              description="Active accounts and their current balances."
              className="lg:col-span-3"
            >
              {activeAccounts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {activeAccounts.slice(0, 8).map((account) => (
                    <div
                      key={account.id}
                      className="rounded-lg border border-border bg-white/[0.02] p-3"
                    >
                      <p className="truncate text-xs text-muted-foreground">{account.name}</p>
                      <p className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
                        {formatAmount(convertAmount(account.currentBalance))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No accounts yet"
                  description="Add an account to see balances here."
                />
              )}
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

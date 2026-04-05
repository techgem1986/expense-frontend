import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Download,
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { accountAPI } from '../../services/api';
import { Account } from '../../types/account';
import DateRangeFilter, {
  getCurrentMonthStart,
  getCurrentMonthEnd,
  getPreviousMonthStart,
  getPreviousMonthEnd,
  getNextMonthStart,
  getNextMonthEnd,
} from '../ui/DateRangeFilter';
import { analyticsAPI, exportAPI } from '../../services/api';
import { AnalyticsResponse } from '../../types';
import { getErrorMessage } from '../../services/errorUtils';
import { useCurrency } from '../../contexts/CurrencyContext';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
];

const Dashboard: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Date range state - default to current month
  const [startDate, setStartDate] = useState(getCurrentMonthStart);
  const [endDate, setEndDate] = useState(getCurrentMonthEnd);

  const fetchAnalytics = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getAnalytics(start, end);
      if (response.data && response.data.data) {
        setAnalytics(response.data.data);
      } else {
        setAnalytics(null);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch analytics'));
      setAnalytics(null);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountAPI.getAll();
      if (response.data && response.data.data) {
        const data = response.data.data.content || response.data.data || [];
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(startDate, endDate);
    fetchAccounts();
    setLoading(false);
  }, [fetchAnalytics, fetchAccounts, startDate, endDate]);

  const handleApplyDateRange = () => {
    fetchAnalytics(startDate, endDate);
  };

  const handlePreviousMonth = () => {
    setStartDate(getPreviousMonthStart());
    setEndDate(getPreviousMonthEnd());
  };

  const handleNextMonth = () => {
    setStartDate(getNextMonthStart());
    setEndDate(getNextMonthEnd());
  };

  const formatDisplayDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Comprehensive Export functionality
  const handleExportComprehensiveReport = async (format: 'excel' | 'pdf') => {
    try {
      // Extract year and month from current date range
      const currentMonth = new Date(startDate);
      const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

      let response;
      if (format === 'excel') {
        response = await exportAPI.exportComprehensiveReport(yearMonth);
      } else {
        response = await exportAPI.exportDashboardPDF(yearMonth);
      }

      // Create download link
      let blob, filename;
      if (format === 'excel') {
        blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        filename = `comprehensive_financial_report_${yearMonth}.xlsx`;
      } else {
        blob = new Blob([response.data], {
          type: 'application/pdf',
        });
        filename = `financial_dashboard_${yearMonth}.pdf`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export report. Please try again.');
    }
  };

  // Prepare chart data
  const spendingByCategory = analytics?.spendingByCategory || [];
  const categoryChartData = spendingByCategory.map((s) => ({
    name: s.categoryName,
    value: s.totalAmount,
  }));

  const monthlyData = analytics?.monthlySpending || [];
  const monthlyChartData = monthlyData.map((m) => ({
    month: m.month,
    Income: m.income,
    Expenses: m.expenses,
  }));

  const saveRate =
    analytics?.totalIncome && analytics.totalIncome > 0
      ? (((analytics.totalIncome - analytics.totalExpenses) / analytics.totalIncome) * 100).toFixed(
          1,
        )
      : '0';

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No analytics data available</p>
          <p className="text-sm mt-2">Start adding transactions to see your financial insights</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your income, expenses, and financial goals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Button variant="primary" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleExportComprehensiveReport('excel')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                    Excel Report
                  </button>
                  <button
                    onClick={() => handleExportComprehensiveReport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
                    PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <Card padding="md">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyDateRange}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      </Card>

      {/* Account Balances */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Account Balances
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current balance across all your accounts
            </p>
          </div>
        </div>
        {accounts.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No accounts found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {accounts
              .filter((account) => account.isActive)
              .map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                      <Wallet className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {account.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p
                      className={`text-sm font-bold ${
                        account.currentBalance >= 0
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {formatAmount(convertAmount(account.currentBalance))}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="mt-2 text-2xl font-bold text-success-600 dark:text-success-400">
                {formatAmount(convertAmount(analytics.totalIncome))}
              </p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-success-600 dark:text-success-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="mt-2 text-2xl font-bold text-danger-600 dark:text-danger-400">
                {formatAmount(convertAmount(analytics.totalExpenses))}
              </p>
            </div>
            <div className="p-3 bg-danger-100 dark:bg-danger-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-danger-600 dark:text-danger-400">
            <ArrowDownRight className="w-4 h-4" />
            <span>Expenses</span>
          </div>
        </Card>

        {/* Net Balance */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  analytics.netBalance >= 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-600 dark:text-danger-400'
                }`}
              >
                {formatAmount(convertAmount(analytics.netBalance))}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl ${
                analytics.netBalance >= 0
                  ? 'bg-success-100 dark:bg-success-900/30'
                  : 'bg-danger-100 dark:bg-danger-900/30'
              }`}
            >
              <DollarSign
                className={`w-6 h-6 ${
                  analytics.netBalance >= 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-600 dark:text-danger-400'
                }`}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Balance</span>
          </div>
        </Card>

        {/* Save Rate */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Save Rate</p>
              <p className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
                {saveRate}%
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <PieChartIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Savings Rate</span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        <Card>
          <Card.Header
            title="Spending by Category"
            subtitle="Distribution of expenses across categories"
          />
          <div className="h-80">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatAmount(convertAmount(Number(value) || 0))}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Income vs Expenses - Bar Chart */}
        <Card>
          <Card.Header
            title="Monthly Income vs Expenses"
            subtitle="Comparison over the last 12 months"
          />
          <div className="h-80">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                    tickFormatter={(value) => formatAmount(convertAmount(value))}
                  />
                  <Tooltip
                    formatter={(value) => formatAmount(convertAmount(Number(value) || 0))}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Spending Breakdown Details */}
      {spendingByCategory.length > 0 && (
        <Card>
          <Card.Header
            title="Spending Breakdown"
            subtitle="Detailed view of expenses by category"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendingByCategory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.categoryName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatAmount(convertAmount(item.totalAmount))}
                    </p>
                  </div>
                </div>
                <Badge variant="primary">{(item.percentage ?? 0).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;

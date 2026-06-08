import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';
import Header from '../components/ui/Header';
import AnimatedAmount from '../components/ui/AnimatedAmount';
import SetupWizard from '../components/setup/SetupWizard';
import { analyticsAPI, accountAPI, categoryAPI, recurringTransactionAPI } from '../services/api';
import { AnalyticsResponse } from '../types';
import { Account } from '../types/account';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const getProgressColor = (pct: number) => {
  if (pct > 90) return 'bg-neon-pink';
  if (pct > 60) return 'bg-neon-purple';
  return 'bg-neon-cyan';
};

const Dashboard: React.FC = () => {
  const { formatAmount, convertAmount, getSymbol } = useCurrency();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getAnalytics();
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

  // Check if user needs setup wizard
  const checkSetupStatus = useCallback(async () => {
    try {
      // Check accounts
      const accRes = await accountAPI.getAll(0, 5);
      const accData = accRes.data?.data?.content || accRes.data?.data || [];
      const hasAccounts = Array.isArray(accData) ? accData.length > 0 : false;

      // Check user-specific categories
      let hasCategories = false;
      try {
        const catRes = await categoryAPI.getAll(0, 5);
        const catData = catRes.data?.data?.content || catRes.data?.data || [];
        hasCategories = Array.isArray(catData) ? catData.length > 0 : false;
      } catch {
        // Categories endpoint might not be available
      }

      // Check recurring transactions
      let hasRecurring = false;
      try {
        const recRes = await recurringTransactionAPI.getAll(0, 5);
        const recData = recRes.data?.data?.content || recRes.data?.data || [];
        hasRecurring = Array.isArray(recData) ? recData.length > 0 : false;
      } catch {
        // Recurring endpoint might not be available
      }

      // Show wizard only if ALL three (accounts, categories, recurring) are missing
      // i.e. brand new user with no data at all
      if (!hasAccounts && !hasCategories && !hasRecurring) {
        setShowSetup(true);
      }
    } catch {
      // If check fails, just show the normal dashboard
    } finally {
      setCheckingSetup(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchAccounts(), checkSetupStatus()]).finally(() =>
      setLoading(false),
    );
  }, [fetchAnalytics, fetchAccounts, checkSetupStatus]);

  const handleWizardComplete = () => {
    setShowSetup(false);
    localStorage.setItem('setupWizardDismissed', 'true');
    // Refresh data
    fetchAnalytics();
    fetchAccounts();
  };

  const handleWizardSkip = () => {
    setShowSetup(false);
    localStorage.setItem('setupWizardDismissed', 'true');
  };

  const totalIncome = analytics?.totalIncome || 0;
  const totalExpenses = analytics?.totalExpenses || 0;
  const netVelocity = analytics?.netBalance || 0;
  const savingsTargetPct = totalIncome > 0 ? (netVelocity / totalIncome) * 100 : 0;
  const monthlyData = (analytics?.monthlySpending || []).map((m) => ({
    day: m.month,
    spend: m.expenses,
  }));
  const spendingByCategory = analytics?.spendingByCategory || [];
  const activeAccounts = accounts.filter((a) => a.isActive !== false);

  return (
    <div>
      <Header title="System Liquidity" subtitle="Fiscal Epoch: May 20, 2026" />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Setup Wizard for new users */}
      {showSetup && !checkingSetup && (
        <SetupWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
      )}

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Hero: Net Velocity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="col-span-12 lg:col-span-8 card p-8 animate-glow relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-neon-cyan/10 blur-[80px] pointer-events-none" />
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">
              TOTAL NET VELOCITY
            </p>
            <AnimatedAmount value={netVelocity} className="text-4xl sm:text-5xl" />
            <div className="mt-6 h-36">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="60%" stopColor="#00f5ff" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f0f12',
                        border: '1px solid rgba(0,245,255,0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value) => [`${getSymbol()}${Number(value).toFixed(2)}`, 'Spend']}
                    />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="#00f5ff"
                      strokeWidth={2}
                      fill="url(#cyanGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                  No data
                </div>
              )}
            </div>
          </motion.div>

          {/* 3 Stat Cards Stack */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 border-l-4 border-l-neon-cyan flex-1"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">
                Inflow
              </p>
              <AnimatedAmount value={totalIncome} className="text-4xl sm:text-5xl text-neon-cyan" />
              <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                <TrendingUp className="w-3 h-3 text-neon-cyan" />
                <span className="text-neon-cyan">Income</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-6 border-l-4 border-l-neon-pink flex-1"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Burn</p>
              <AnimatedAmount
                value={-totalExpenses}
                className="text-4xl sm:text-5xl text-neon-pink"
              />
              <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                <TrendingDown className="w-3 h-3 text-neon-pink" />
                <span className="text-neon-pink">Expenses</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 border-l-4 border-l-neon-purple flex-1"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">
                Savings Target
              </p>
              <span className="font-display font-bold text-4xl sm:text-5xl text-neon-purple">
                {savingsTargetPct.toFixed(1)}%
              </span>
              <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                <Target className="w-3 h-3 text-neon-purple" />
                <span className="text-neon-purple">of total inflow</span>
              </div>
            </motion.div>
          </div>

          {/* Account Balances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-12 lg:col-span-7 card p-8"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">
              Account Balances
            </p>
            {activeAccounts.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-4">No accounts found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-neon-cyan/10">
                        <Wallet className="w-4 h-4 text-neon-cyan" />
                      </div>
                      <p className="text-sm text-white/80 truncate">{acc.name}</p>
                    </div>
                    <span
                      className={`font-display font-bold text-sm ${acc.currentBalance >= 0 ? 'text-neon-cyan' : 'text-neon-pink'}`}
                    >
                      {formatAmount(convertAmount(acc.currentBalance))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Allocation Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-5 card p-8"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-6">
              Category Split
            </p>
            {spendingByCategory.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-4">No spending data</p>
            ) : (
              <div className="space-y-4">
                {spendingByCategory.map((item) => {
                  const pct = Math.min(item.percentage, 100);
                  return (
                    <div key={item.categoryName}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-white/80">{item.categoryName}</span>
                        <span className="text-xs text-white/40 font-display font-bold">
                          {formatAmount(convertAmount(item.totalAmount))}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                          className={`progress-bar-fill ${getProgressColor(pct)}`}
                          style={{
                            boxShadow:
                              pct > 90
                                ? '0 0 10px rgba(255,0,122,0.6)'
                                : pct > 60
                                  ? '0 0 10px rgba(157,0,255,0.6)'
                                  : '0 0 10px rgba(0,245,255,0.4)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

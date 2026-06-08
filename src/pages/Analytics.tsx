import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Header from '../components/ui/Header';
import { analyticsAPI } from '../services/api';
import { AnalyticsResponse } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const PIE_COLORS = ['#00f5ff', '#9d00ff', '#ff007a', '#ffd700', '#00ff88', '#ff8800', '#888888'];

const Analytics: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const monthlyChartData = (analytics?.monthlySpending || []).map((m) => ({
    month: m.month,
    Income: m.income,
    Burn: m.expenses,
  }));

  const pieData = (analytics?.spendingByCategory || [])
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((s) => ({ name: s.categoryName, value: s.totalAmount }));

  return (
    <div>
      <Header title="Analytics Engine" subtitle="Deep insight protocols" />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Income vs Burn Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="col-span-12 lg:col-span-7 card p-8"
          >
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">Income vs Burn</h2>
            <div className="h-72">
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="month"
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
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      formatter={(value: any) => [formatAmount(convertAmount(Number(value))), '']}
                    />
                    <Bar dataKey="Income" fill="#00f5ff" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Burn" fill="#ff007a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                  No data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Split Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-5 card p-8"
          >
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">Category Split</h2>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      stroke="none"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f0f12',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value: any) => [formatAmount(convertAmount(Number(value))), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                  No data available
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-white/60 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

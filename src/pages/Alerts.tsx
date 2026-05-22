import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, DollarSign } from 'lucide-react';
import Header from '../components/ui/Header';
import { alertAPI } from '../services/api';
import { AlertResponse } from '../types';
import { getErrorMessage } from '../services/errorUtils';

const alertTypeConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  BUDGET_THRESHOLD: {
    bg: 'bg-yellow-400/10',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    label: 'Budget Warning',
  },
  BUDGET_EXCEEDED: {
    bg: 'bg-neon-pink/10',
    icon: <DollarSign className="w-4 h-4 text-neon-pink" />,
    label: 'Budget Exceeded',
  },
  INFO: {
    bg: 'bg-neon-cyan/10',
    icon: <Info className="w-4 h-4 text-neon-cyan" />,
    label: 'Info',
  },
};

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await alertAPI.getAll();
      const data = response.data?.data?.content || response.data?.data || [];
      setAlerts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch alerts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkRead = async (id: number) => {
    try {
      await alertAPI.markAsRead(id);
      fetchAlerts();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertAPI.markAllAsRead();
      fetchAlerts();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await alertAPI.delete(id);
      fetchAlerts();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete alert'));
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div>
      <Header
        title="Alert Center"
        subtitle="System notifications and budget warnings"
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Unread count pill */}
      <div className="flex items-center gap-3 mb-6">
        <div className="px-4 py-2 rounded-full glass-panel text-xs text-white/40 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" />
          <span>{alerts.length} total</span>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
            {unreadCount} unread
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
        </div>
      ) : (
        <div className="card p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-white/10 mb-3" />
              <p className="text-white/20 text-sm">No alerts</p>
            </div>
          ) : (
            <div className="space-y-1">
              {alerts.map((alert, i) => {
                const config = alertTypeConfig[alert.type] || alertTypeConfig.INFO;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group flex items-start gap-4 p-4 rounded-2xl transition-all ${
                      !alert.isRead
                        ? 'bg-white/[0.04] border-l-2 border-l-neon-cyan'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${config.bg} flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                          {config.label}
                        </span>
                        {!alert.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                        )}
                      </div>
                      <p className="text-sm text-white/80">{alert.message}</p>
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;

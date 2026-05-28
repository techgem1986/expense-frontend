import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Wallet,
  Building2,
  CreditCard,
  Landmark,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import Header from '../components/ui/Header';
import { accountAPI } from '../services/api';
import { Account } from '../types/account';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const accountTypeIcons: Record<string, React.ReactNode> = {
  SAVINGS: <Landmark className="w-4 h-4" />,
  SALARY: <Wallet className="w-4 h-4" />,
  CURRENT: <Building2 className="w-4 h-4" />,
  INVESTMENT: <TrendingUp className="w-4 h-4" />,
  MUTUAL_FUND: <PieChart className="w-4 h-4" />,
  CREDIT_CARD: <CreditCard className="w-4 h-4" />,
};

const accountTypeBg: Record<string, string> = {
  SAVINGS: 'bg-green-400/10 text-green-400',
  SALARY: 'bg-neon-cyan/10 text-neon-cyan',
  CURRENT: 'bg-blue-400/10 text-blue-400',
  INVESTMENT: 'bg-purple-400/10 text-purple-400',
  MUTUAL_FUND: 'bg-orange-400/10 text-orange-400',
  CREDIT_CARD: 'bg-neon-pink/10 text-neon-pink',
};

const Accounts: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('SAVINGS');
  const [formBalance, setFormBalance] = useState('');
  const [formBank, setFormBank] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accountAPI.getAll();
      const data = response.data?.data?.content || response.data?.data || [];
      setAccounts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch accounts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenForm = (acc?: Account) => {
    if (acc) {
      setEditing(acc);
      setFormName(acc.name);
      setFormType(acc.accountType || 'SAVINGS');
      setFormBalance(String(acc.currentBalance));
      setFormBank(acc.bankName || '');
    } else {
      setEditing(null);
      setFormName('');
      setFormType('SAVINGS');
      setFormBalance('');
      setFormBank('');
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBalance) return;
    setSubmitting(true);
    try {
      const data = {
        name: formName,
        accountType: formType,
        openingBalance: parseFloat(formBalance),
        bankName: formBank || undefined,
      };
      if (editing) {
        await accountAPI.update(editing.id, data);
      } else {
        await accountAPI.create(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchAccounts();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save account'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await accountAPI.delete(id);
      fetchAccounts();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete account'));
    }
  };

  const activeAccounts = accounts.filter((a) => a.isActive !== false);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  return (
    <div>
      <Header
        title="Account Matrix"
        subtitle="Manage your financial accounts"
        action={
          <button
            onClick={() => handleOpenForm()}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Total Balance Card */}
      <div className="card p-8 mb-6 animate-glow">
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">
          Total Balance
        </p>
        <span className="font-display font-bold text-4xl sm:text-5xl text-neon-cyan">
          {formatAmount(convertAmount(totalBalance))}
        </span>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditing(null);
            }
          }}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-8 w-full max-w-md animate-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">
              {editing ? 'EDIT' : 'NEW'} ACCOUNT
            </p>
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">
              {editing ? 'Edit' : 'Create'}{' '}
              <span className="text-neon-cyan font-bold">Account</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Account Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Main Salary Account"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="input"
                >
                  <option value="SAVINGS" className="bg-surface">
                    Savings
                  </option>
                  <option value="SALARY" className="bg-surface">
                    Salary
                  </option>
                  <option value="CURRENT" className="bg-surface">
                    Current
                  </option>
                  <option value="INVESTMENT" className="bg-surface">
                    Investment
                  </option>
                  <option value="MUTUAL_FUND" className="bg-surface">
                    Mutual Funds
                  </option>
                  <option value="CREDIT_CARD" className="bg-surface">
                    Credit Cards
                  </option>
                </select>
              </div>
              <div>
                <label className="input-label">Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  placeholder="0.00"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Bank Name (optional)</label>
                <input
                  type="text"
                  value={formBank}
                  onChange={(e) => setFormBank(e.target.value)}
                  placeholder="e.g. Chase"
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="flex-1 py-3 rounded-xl glass-panel text-white/60 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formName.trim() || !formBalance}
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-bold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAccounts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Wallet className="w-12 h-12 mx-auto text-white/10 mb-3" />
              <p className="text-white/20 text-sm">No accounts found. Add your first account.</p>
            </div>
          ) : (
            activeAccounts.map((acc, i) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${accountTypeBg[acc.accountType] || 'bg-white/5 text-white/40'}`}
                  >
                    {accountTypeIcons[acc.accountType] || <Wallet className="w-4 h-4" />}
                  </div>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-medium text-white/90 truncate">{acc.name}</p>
                {acc.bankName && <p className="text-xs text-white/40 mt-0.5">{acc.bankName}</p>}
                <p
                  className={`font-display font-bold text-xl mt-3 ${acc.currentBalance >= 0 ? 'text-neon-cyan' : 'text-neon-pink'}`}
                >
                  {formatAmount(convertAmount(acc.currentBalance))}
                </p>
                <button
                  onClick={() => handleOpenForm(acc)}
                  className="mt-3 text-xs text-white/20 hover:text-neon-cyan transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Accounts;

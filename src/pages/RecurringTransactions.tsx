import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Repeat, Calendar } from 'lucide-react';
import Header from '../components/ui/Header';
import { recurringTransactionAPI, categoryAPI, accountAPI } from '../services/api';
import {
  RecurringTransactionResponse,
  RecurringTransactionRequest,
  Category,
  TransactionType,
} from '../types';
import { AccountSummary } from '../types/account';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const RecurringTransactions: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [items, setItems] = useState<RecurringTransactionResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransactionResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formCategoryId, setFormCategoryId] = useState<number | undefined>(undefined);
  const [formFrequency, setFormFrequency] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [formDayOfMonth, setFormDayOfMonth] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formFromAccountId, setFormFromAccountId] = useState<number | undefined>(undefined);
  const [formToAccountId, setFormToAccountId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await recurringTransactionAPI.getAll(0, 50);
      const data = response.data?.data?.content || response.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch recurring transactions'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      const responseBody = response.data;
      let data: Category[] = [];
      if (Array.isArray(responseBody)) {
        data = responseBody;
      } else if (responseBody?.data?.content && Array.isArray(responseBody.data.content)) {
        data = responseBody.data.content;
      } else if (Array.isArray(responseBody?.data)) {
        data = responseBody.data;
      }
      setCategories(data);
    } catch (err: any) {
      console.error(err);
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
    fetchItems();
    fetchCategories();
    fetchAccounts();
  }, [fetchItems, fetchCategories, fetchAccounts]);

  // Find Money Transfer category ID from the categories list
  const moneyTransferCategoryId = useMemo(() => {
    const mtCategory = categories.find((cat) => cat.name.toLowerCase() === 'money transfer');
    return mtCategory?.id;
  }, [categories]);

  // Check if Money Transfer category is selected
  const isMoneyTransferCategory = useMemo(() => {
    if (formCategoryId === undefined || moneyTransferCategoryId === undefined) return false;
    return formCategoryId === moneyTransferCategoryId;
  }, [formCategoryId, moneyTransferCategoryId]);

  // Determine which account fields to show
  const showFromAccount = formType === 'EXPENSE' || isMoneyTransferCategory;
  const showToAccount = formType === 'INCOME' || isMoneyTransferCategory;

  // Same account validation
  const accountError = useMemo(() => {
    if (formFromAccountId && formToAccountId && formFromAccountId === formToAccountId) {
      return 'From Account and To Account cannot be the same';
    }
    return null;
  }, [formFromAccountId, formToAccountId]);

  // Form validity check
  const isFormValid = useMemo(() => {
    if (!formName.trim() || !formAmount) return false;
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (accountError) return false;

    // From Account required for Expense or Self Transfer
    if (showFromAccount && !formFromAccountId) return false;

    // To Account required for Income or Self Transfer
    if (showToAccount && !formToAccountId) return false;

    return true;
  }, [
    formName,
    formAmount,
    accountError,
    showFromAccount,
    formFromAccountId,
    showToAccount,
    formToAccountId,
  ]);

  const handleOpenForm = (item?: RecurringTransactionResponse) => {
    if (item) {
      setEditing(item);
      setFormName(item.name);
      setFormAmount(String(Math.abs(item.amount)));
      setFormType(item.type);
      setFormCategoryId(item.category?.id);
      setFormFrequency(item.frequency as 'MONTHLY' | 'QUARTERLY' | 'YEARLY');
      setFormDayOfMonth(item.dayOfMonth);
      setFormDescription(item.description || '');
      setFormFromAccountId(item.fromAccount?.id);
      setFormToAccountId(item.toAccount?.id);
    } else {
      setEditing(null);
      setFormName('');
      setFormAmount('');
      setFormType('EXPENSE');
      setFormCategoryId(undefined);
      setFormFrequency('MONTHLY');
      setFormDayOfMonth(1);
      setFormDescription('');
      setFormFromAccountId(undefined);
      setFormToAccountId(undefined);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      const data: RecurringTransactionRequest = {
        name: formName,
        amount: parseFloat(formAmount),
        type: formType,
        frequency: formFrequency as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        dayOfMonth: formDayOfMonth,
        startDate: editing ? editing.startDate : new Date().toISOString().split('T')[0],
        description: formDescription || undefined,
        categoryId: formCategoryId || undefined,
        fromAccountId: formFromAccountId,
        toAccountId: formToAccountId,
      };
      if (editing) {
        await recurringTransactionAPI.update(editing.id, data);
      } else {
        await recurringTransactionAPI.create(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchItems();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save recurring transaction'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await recurringTransactionAPI.delete(id);
      fetchItems();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete'));
    }
  };

  const getCategoryName = (catId?: number) => {
    if (!catId) return 'Uncategorized';
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  return (
    <div>
      <Header
        title="Recurring Matrix"
        subtitle="Automated periodic transactions"
        action={
          <button
            onClick={() => handleOpenForm()}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Recurring
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

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
              {editing ? 'EDIT' : 'NEW'} RECURRING
            </p>
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">
              {editing ? 'Edit' : 'Create'}{' '}
              <span className="text-neon-cyan font-bold">Recurring</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rent"
                  className="input"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Type</label>
                  <div className="flex p-1 bg-white/5 rounded-full mt-2">
                    <button
                      type="button"
                      onClick={() => setFormType('EXPENSE')}
                      className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium transition-all ${
                        formType === 'EXPENSE' ? 'bg-neon-pink/20 text-neon-pink' : 'text-white/40'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('INCOME')}
                      className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium transition-all ${
                        formType === 'INCOME' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/40'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Frequency</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="input"
                  >
                    <option value="MONTHLY" className="bg-surface">
                      Monthly
                    </option>
                    <option value="QUARTERLY" className="bg-surface">
                      Quarterly
                    </option>
                    <option value="YEARLY" className="bg-surface">
                      Yearly
                    </option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Day of Month</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formDayOfMonth}
                    onChange={(e) => setFormDayOfMonth(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                </div>
              </div>

              {/* From Account - shown for EXPENSE or Self Transfer */}
              {showFromAccount && (
                <div>
                  <label className="input-label">
                    From Account <span className="text-neon-pink">*</span>
                  </label>
                  <select
                    value={formFromAccountId || ''}
                    onChange={(e) =>
                      setFormFromAccountId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="input"
                  >
                    <option value="" className="bg-surface">
                      Select Account
                    </option>
                    {accounts
                      .filter((acc) => acc.id !== formToAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id} className="bg-surface">
                          {acc.name} ({acc.accountType})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="input-label">Category</label>
                <select
                  value={formCategoryId || ''}
                  onChange={(e) =>
                    setFormCategoryId(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="input"
                >
                  <option value="" className="bg-surface">
                    No category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Account - shown for INCOME or Self Transfer */}
              {showToAccount && (
                <div>
                  <label className="input-label">
                    To Account <span className="text-neon-pink">*</span>
                  </label>
                  <select
                    value={formToAccountId || ''}
                    onChange={(e) =>
                      setFormToAccountId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="input"
                  >
                    <option value="" className="bg-surface">
                      Select Account
                    </option>
                    {accounts
                      .filter((acc) => acc.id !== formFromAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id} className="bg-surface">
                          {acc.name} ({acc.accountType})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Account Error */}
              {accountError && <p className="text-neon-pink text-xs">{accountError}</p>}

              <div>
                <label className="input-label">Description (optional)</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional note"
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
                  disabled={submitting || !isFormValid}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Repeat className="w-12 h-12 mx-auto text-white/10 mb-3" />
              <p className="text-white/20 text-sm">
                No recurring transactions. Add your first one.
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-6 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${item.type === 'INCOME' ? 'bg-neon-cyan/10' : 'bg-neon-pink/10'}`}
                  >
                    <Repeat
                      className={`w-4 h-4 ${item.type === 'INCOME' ? 'text-neon-cyan' : 'text-neon-pink'}`}
                    />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenForm(item)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-white/90 truncate">{item.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{getCategoryName(item.category?.id)}</p>
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`font-display font-bold text-lg ${item.type === 'INCOME' ? 'text-neon-cyan' : 'text-white/80'}`}
                  >
                    {formatAmount(convertAmount(Math.abs(item.amount)))}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.isActive ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Day {item.dayOfMonth} • {item.frequency}
                  </span>
                </div>
                {item.nextExecutionDate && (
                  <p className="text-xs text-neon-cyan/60 mt-1">
                    Next: {new Date(item.nextExecutionDate).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;

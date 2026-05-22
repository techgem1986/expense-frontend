import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';
import Header from '../components/ui/Header';
import { budgetAPI, categoryAPI } from '../services/api';
import { BudgetResponse, BudgetRequest, Category } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';

const getProgressColor = (pct: number) => {
  if (pct > 100) return 'bg-neon-pink';
  if (pct > 80) return 'bg-neon-pink';
  if (pct > 60) return 'bg-neon-purple';
  return 'bg-neon-cyan';
};

const getProgressGlow = (pct: number) => {
  if (pct > 80) return '0 0 10px rgba(255,0,122,0.6)';
  if (pct > 60) return '0 0 10px rgba(157,0,255,0.6)';
  return '0 0 10px rgba(0,245,255,0.4)';
};

const Budgets: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLimit, setFormLimit] = useState('');
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await budgetAPI.getAll(0, 50);
      if (response.data && response.data.data) {
        setBudgets(response.data.data.content || []);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch budgets'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchCategories()]);
  }, [fetchBudgets, fetchCategories]);

  const handleOpenForm = () => {
    setFormName('');
    setFormLimit('');
    setFormCategoryIds([]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLimit) return;
    setSubmitting(true);
    try {
      const data: BudgetRequest = {
        name: formName,
        limitAmount: parseFloat(formLimit),
        period: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        categoryIds: formCategoryIds.length > 0 ? formCategoryIds : undefined,
      };
      await budgetAPI.create(data);
      setShowForm(false);
      fetchBudgets();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save budget'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await budgetAPI.delete(id);
      fetchBudgets();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete budget'));
    }
  };

  return (
    <div>
      <Header
        title="Budget Matrix"
        subtitle="Allocation control system"
        action={
          <button
            onClick={handleOpenForm}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Budget
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Add Budget Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
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
              NEW BUDGET
            </p>
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">
              Create <span className="text-neon-cyan font-bold">Budget</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">Budget Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Monthly Food"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="input-label">Monthly Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="0.00"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => c.type === 'EXPENSE')
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormCategoryIds((prev) =>
                            prev.includes(cat.id)
                              ? prev.filter((id) => id !== cat.id)
                              : [...prev, cat.id],
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formCategoryIds.includes(cat.id)
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                            : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl glass-panel text-white/60 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formName.trim() || !formLimit}
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-bold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}

      {/* Budget Grid */}
      {loading && budgets.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/20 text-sm">
                No budgets configured. Create your first budget.
              </p>
            </div>
          ) : (
            budgets.map((budget, i) => {
              const pct = Math.min(budget.spentPercentage, 100);
              const over = budget.isOverBudget;
              const remaining = budget.remainingAmount;
              const remainingPct =
                budget.limitAmount > 0 ? (remaining / budget.limitAmount) * 100 : 0;
              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">{budget.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{budget.period}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <span className="font-display font-bold text-2xl text-white">
                      {formatAmount(convertAmount(budget.currentSpent))}
                    </span>
                    <span className="text-white/40 text-sm font-display font-bold">
                      {' / '}
                      {formatAmount(convertAmount(budget.limitAmount))}
                    </span>
                  </div>
                  <div className="progress-bar mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className={`progress-bar-fill ${getProgressColor(pct)}`}
                      style={{ boxShadow: getProgressGlow(pct) }}
                    />
                  </div>
                  <p
                    className={`text-xs font-display font-bold ${over ? 'text-neon-pink uppercase' : 'text-neon-cyan'}`}
                  >
                    {over ? 'Over Budget' : `${Math.max(0, remainingPct).toFixed(0)}% remaining`}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Budgets;

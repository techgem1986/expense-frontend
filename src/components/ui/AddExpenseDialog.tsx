import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { transactionAPI, categoryAPI } from '../../services/api';
import { Category } from '../../types';
import { getErrorMessage } from '../../services/errorUtils';

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Set default category for EXPENSE type
      const expenseCats = data.filter((c) => c.type === 'EXPENSE');
      if (expenseCats.length > 0) {
        setCategoryId(expenseCats[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setTitle('');
      setAmount('');
      setType('EXPENSE');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, fetchCategories]);

  useEffect(() => {
    // Update categoryId when type changes
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length > 0 && !filtered.find((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;
    if (numAmount <= 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await transactionAPI.create({
        amount: numAmount,
        type: type,
        description: title,
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: type === 'EXPENSE' ? categoryId : undefined,
      });
      setTitle('');
      setAmount('');
      setType('EXPENSE');
      setError(null);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create transaction'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-3xl p-8 w-full max-w-md animate-glow relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">
              NEW ENTRY
            </p>
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">
              Log <span className="text-neon-cyan font-bold">Transaction</span>
            </h2>

            {error && (
              <div className="mb-4 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-3 py-2 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex p-1 bg-white/5 rounded-full">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'EXPENSE'
                      ? 'bg-neon-pink/20 text-neon-pink'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 inline mr-1.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'INCOME'
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 inline mr-1.5" />
                  Income
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Groceries"
                  autoFocus
                  className="input"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="input-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input"
                />
              </div>

              {/* Category */}
              {type === 'EXPENSE' && filteredCategories.length > 0 && (
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={categoryId || ''}
                    onChange={(e) =>
                      setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="input"
                  >
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-surface text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !title || !amount}
                className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? 'SAVING...' : 'COMMIT ENTRY'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseDialog;

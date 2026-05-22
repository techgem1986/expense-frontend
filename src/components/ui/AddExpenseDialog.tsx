import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { addExpense, CATEGORIES } from '../../lib/expense-store';

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
    addExpense({
      title,
      amount: finalAmount,
      category: type === 'income' ? 'Income' : category,
    });
    setTitle('');
    setAmount('');
    setCategory('Food');
    setType('expense');
    onClose();
  };

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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex p-1 bg-white/5 rounded-full">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'expense'
                      ? 'bg-neon-pink/20 text-neon-pink'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 inline mr-1.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'income'
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

              {/* Category (only for expenses) */}
              {type === 'expense' && (
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input"
                  >
                    {CATEGORIES.filter((c) => c !== 'Income').map((cat) => (
                      <option key={cat} value={cat} className="bg-surface text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all duration-200"
              >
                COMMIT ENTRY
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseDialog;

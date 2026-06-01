import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { TransactionResponse, TransactionType } from '../../types';
import { transactionAPI, accountAPI } from '../../services/api';
import { Account } from '../../types/account';
import { getErrorMessage } from '../../services/errorUtils';

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transaction?: TransactionResponse | null;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | undefined>(undefined);
  const [toAccountId, setToAccountId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState<string>('');
  const initializedRef = React.useRef(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountAPI.getAll();
      if (response.data && response.data.data) {
        const data = response.data.data.content || response.data.data || [];
        const activeAccounts = (Array.isArray(data) ? data : []).filter(
          (acc: Account) => acc.isActive,
        );
        setAccounts(activeAccounts);
      }
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
    }
  }, []);

  // Determine which account fields to show
  const showFromAccount = type === 'EXPENSE' || type === 'TRANSFER';
  const showToAccount = type === 'INCOME' || type === 'TRANSFER';

  useEffect(() => {
    if (isOpen) {
      initializedRef.current = false;
      const isEdit = !!transaction;

      if (isEdit) {
        // Edit mode: pre-fill from existing transaction
        setType(transaction.type);
        setTitle(transaction.description || '');
        setAmount(String(Math.abs(transaction.amount)));
        setFromAccountId(transaction.fromAccount?.id);
        setToAccountId(transaction.toAccount?.id);
        setTransactionDate(transaction.transactionDate);
      } else {
        // Create mode: reset to defaults
        setTitle('');
        setAmount('');
        setType('EXPENSE');
        setFromAccountId(undefined);
        setToAccountId(undefined);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }

      fetchAccounts();
      setError(null);
      setSubmitting(false);
      initializedRef.current = true;
    }
  }, [isOpen, transaction, fetchAccounts]);

  // Clear account IDs when they should no longer be shown
  useEffect(() => {
    if (!showFromAccount) {
      setFromAccountId(undefined);
    }
    if (!showToAccount) {
      setToAccountId(undefined);
    }
  }, [showFromAccount, showToAccount]);

  // Check if from and to accounts are the same
  const accountError = useMemo(() => {
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      return 'From Account and To Account cannot be the same';
    }
    return null;
  }, [fromAccountId, toAccountId]);

  // Check if the form is valid
  const isFormValid = useMemo(() => {
    if (!title || !amount) return false;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (accountError) return false;

    // Account validation based on type
    if (type === 'INCOME' && !toAccountId) return false;
    if (type === 'EXPENSE' && !fromAccountId) return false;
    if (type === 'TRANSFER' && (!fromAccountId || !toAccountId)) return false;

    return true;
  }, [title, amount, accountError, type, fromAccountId, toAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const numAmount = parseFloat(amount);

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        amount: numAmount,
        type: type,
        description: title,
        transactionDate: transactionDate || new Date().toISOString().split('T')[0],
        fromAccountId: showFromAccount ? fromAccountId : undefined,
        toAccountId: showToAccount ? toAccountId : undefined,
      };

      if (transaction) {
        await transactionAPI.update(transaction.id, payload);
      } else {
        await transactionAPI.create(payload);
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create transaction'));
    } finally {
      setSubmitting(false);
    }
  };

  const isTransfer = type === 'TRANSFER';

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
              {transaction ? 'Edit' : 'Log'}{' '}
              <span className="text-neon-cyan font-bold">Transaction</span>
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
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'EXPENSE'
                      ? 'bg-neon-pink/20 text-neon-pink'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 inline mr-1" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'INCOME'
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 inline mr-1" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('TRANSFER')}
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    type === 'TRANSFER'
                      ? 'bg-neon-purple/20 text-neon-purple'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                  Transfer
                </button>
              </div>

              {/* Title / Description */}
              <div>
                <label className="input-label">
                  {isTransfer ? 'Description' : 'Title / Description'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isTransfer ? 'e.g. Transfer to savings' : 'e.g. Groceries'}
                  autoFocus={!transaction}
                  className="input"
                />
              </div>

              {/* Date */}
              <div>
                <label className="input-label">Date</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
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

              {/* From Account - shown for EXPENSE or TRANSFER */}
              {showFromAccount && (
                <div>
                  <label className="input-label">
                    From Account <span className="text-neon-pink">*</span>
                  </label>
                  <select
                    value={fromAccountId || ''}
                    onChange={(e) =>
                      setFromAccountId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className={`input ${!fromAccountId && error ? 'border-neon-pink/50' : ''}`}
                  >
                    <option value="" className="bg-surface text-white">
                      Select Account
                    </option>
                    {accounts
                      .filter((account) => account.id !== toAccountId)
                      .map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                          className="bg-surface text-white"
                        >
                          {account.name} ({account.accountType})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* To Account - shown for INCOME or TRANSFER */}
              {showToAccount && (
                <div>
                  <label className="input-label">
                    To Account <span className="text-neon-pink">*</span>
                  </label>
                  <select
                    value={toAccountId || ''}
                    onChange={(e) =>
                      setToAccountId(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className={`input ${!toAccountId && error ? 'border-neon-pink/50' : ''}`}
                  >
                    <option value="" className="bg-surface text-white">
                      Select Account
                    </option>
                    {accounts
                      .filter((account) => account.id !== fromAccountId)
                      .map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                          className="bg-surface text-white"
                        >
                          {account.name} ({account.accountType})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Account Error (same account selected) */}
              {accountError && <div className="text-neon-pink text-xs">{accountError}</div>}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? 'SAVING...' : transaction ? 'UPDATE ENTRY' : 'COMMIT ENTRY'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseDialog;

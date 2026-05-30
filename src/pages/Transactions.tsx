import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Header from '../components/ui/Header';
import { transactionAPI, categoryAPI } from '../services/api';
import { TransactionResponse, Category } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { getErrorMessage } from '../services/errorUtils';
import { format } from 'date-fns/format';

const categoryBg: Record<string, string> = {
  Infrastructure: 'bg-neon-cyan/10',
  Lifestyle: 'bg-neon-purple/10',
  Food: 'bg-neon-pink/10',
  Transport: 'bg-yellow-400/10',
  Entertainment: 'bg-green-400/10',
  Health: 'bg-orange-400/10',
  Income: 'bg-neon-cyan/10',
  Other: 'bg-gray-400/10',
};

const Transactions: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const catId =
        activeCategory !== 'All'
          ? categories.find((c) => c.name === activeCategory)?.id
          : undefined;
      const response = await transactionAPI.getAll(
        page,
        20,
        'createdAt,desc',
        undefined,
        undefined,
        search || undefined,
        undefined,
        catId ? String(catId) : undefined,
      );
      if (response.data && response.data.data) {
        setTransactions(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory, categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: number) => {
    try {
      await transactionAPI.delete(id);
      fetchTransactions();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete transaction'));
    }
  };

  const getCategoryName = (cat?: Category): string => cat?.name || 'Uncategorized';

  const uniqueCategoryNames = Array.from(new Set(categories.map((c) => c.name))).sort();

  return (
    <div>
      <Header title="Transaction Archive" subtitle="All logged transmissions" />

      {error && (
        <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search transmissions…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-11 pr-4 py-3 rounded-full glass-panel text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveCategory('All');
              setPage(0);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              activeCategory === 'All'
                ? 'bg-neon-cyan text-black shadow-[0_0_15px_rgba(0,245,255,0.5)]'
                : 'glass-panel text-white/60 hover:text-white/80'
            }`}
          >
            All
          </button>
          {uniqueCategoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-neon-cyan text-black shadow-[0_0_15px_rgba(0,245,255,0.5)]'
                  : 'glass-panel text-white/60 hover:text-white/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Panel */}
      <div className="card p-6">
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan" />
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {transactions.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/20 text-sm text-center py-12"
                >
                  No transmissions found
                </motion.p>
              ) : (
                transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0"
                  >
                    <div
                      className={`size-12 rounded-xl ${tx.type === 'INCOME' ? 'bg-neon-cyan/10' : categoryBg[getCategoryName(tx.category)] || 'bg-white/5'} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      {tx.type === 'INCOME' ? (
                        <ArrowUpRight className="w-5 h-5 text-neon-cyan" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-neon-pink" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">
                        {tx.description || 'No description'}
                      </p>
                      <p className="text-xs text-white/40">
                        {getCategoryName(tx.category)} •{' '}
                        {format(new Date(tx.transactionDate), 'MMM dd')}
                      </p>
                    </div>
                    <span
                      className={`font-display font-bold text-sm ${tx.type === 'INCOME' ? 'text-neon-cyan' : 'text-white/80'}`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatAmount(convertAmount(Math.abs(tx.amount)))}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-white/30">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-1.5 rounded-full glass-panel text-xs text-white/60 hover:text-white/80 disabled:opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-1.5 rounded-full glass-panel text-xs text-white/60 hover:text-white/80 disabled:opacity-30 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;

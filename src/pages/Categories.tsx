import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Header from '../components/ui/Header';
import { categoryAPI } from '../services/api';
import { Category, CategoryRequest } from '../types';
import { getErrorMessage } from '../services/errorUtils';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      const responseBody = response.data;
      // Handle paginated response: { success, message, data: { content: [...], totalElements, ... } }
      // Handle non-paginated response: { success, message, data: [...] }
      // Handle direct array: [...]
      let data: Category[] = [];
      if (Array.isArray(responseBody)) {
        data = responseBody;
      } else if (responseBody?.data?.content && Array.isArray(responseBody.data.content)) {
        data = responseBody.data.content;
      } else if (Array.isArray(responseBody?.data)) {
        data = responseBody.data;
      }
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenForm = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setFormName(cat.name);
      setFormDescription(cat.description || '');
      setFormType(cat.type);
    } else {
      setEditing(null);
      setFormName('');
      setFormDescription('');
      setFormType('EXPENSE');
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      const data: CategoryRequest = {
        name: formName,
        description: formDescription,
        type: formType,
      };
      if (editing) {
        await categoryAPI.update(String(editing.id), data);
      } else {
        await categoryAPI.create(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchCategories();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save category'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryAPI.delete(String(id));
      fetchCategories();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete category'));
    }
  };

  const incomeCats = categories.filter((c) => c.type === 'INCOME');
  const expenseCats = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div>
      <Header
        title="Category Matrix"
        subtitle="Manage income and expense classifications"
        action={
          <button
            onClick={() => handleOpenForm()}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
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
              {editing ? 'EDIT' : 'NEW'} CATEGORY
            </p>
            <h2 className="font-display text-2xl font-light tracking-tight mb-6">
              {editing ? 'Edit' : 'Create'}{' '}
              <span className="text-neon-cyan font-bold">Category</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Category name"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <div className="flex p-1 bg-white/5 rounded-full">
                  <button
                    type="button"
                    onClick={() => setFormType('EXPENSE')}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      formType === 'EXPENSE' ? 'bg-neon-pink/20 text-neon-pink' : 'text-white/40'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('INCOME')}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      formType === 'INCOME' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/40'
                    }`}
                  >
                    Income
                  </button>
                </div>
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
                  disabled={submitting || !formName.trim()}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <div className="card p-6">
            <p className="text-neon-pink text-xs uppercase tracking-widest font-bold mb-4">
              Expense Categories
            </p>
            <div className="space-y-2">
              {expenseCats.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">No expense categories</p>
              ) : (
                expenseCats.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="size-10 rounded-xl bg-neon-pink/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tag className="w-4 h-4 text-neon-pink" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-white/40 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenForm(cat)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Income Categories */}
          <div className="card p-6">
            <p className="text-neon-cyan text-xs uppercase tracking-widest font-bold mb-4">
              Income Categories
            </p>
            <div className="space-y-2">
              {incomeCats.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">No income categories</p>
              ) : (
                incomeCats.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="size-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tag className="w-4 h-4 text-neon-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-white/40 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenForm(cat)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

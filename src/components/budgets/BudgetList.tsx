import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, PieChart } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  Modal,
  Pagination,
} from '../ui';
import { BudgetResponse, BudgetRequest, Category } from '../../types';
import { budgetAPI, categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import BudgetForm from './BudgetForm';
import { useCurrency } from '../../contexts/CurrencyContext';

const BudgetList: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [budgets, setbudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await budgetAPI.getAll(page);
      if (response.data && response.data.data) {
        setbudgets(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch budgets'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [fetchBudgets, fetchCategories]);

  const handleOpenForm = (budget?: BudgetResponse) => {
    if (budget) {
      setEditingBudget(budget);
    } else {
      setEditingBudget(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = async (formData: BudgetRequest) => {
    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget.id, formData);
      } else {
        await budgetAPI.create(formData);
      }
      handleCloseForm();
      fetchBudgets();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save budget'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setBudgetToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteBudget = async () => {
    if (budgetToDelete === null) return;
    setDeleting(true);
    try {
      await budgetAPI.delete(budgetToDelete);
      setbudgets(budgets.filter((b) => b.id !== budgetToDelete));
      setOpenDeleteDialog(false);
      setBudgetToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete budget'));
    } finally {
      setDeleting(false);
    }
  };


  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your spending limits
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Budget
        </Button>
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Budgets Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Period</Table.HeadCell>
              <Table.HeadCell>Limit</Table.HeadCell>
              <Table.HeadCell>Spent</Table.HeadCell>
              <Table.HeadCell>Progress</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell align="center">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {budgets.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={7}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No budgets found</p>
                    <p className="text-sm mt-1">Create your first budget to track spending</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              budgets.map((budget) => (
                <Table.Row key={budget.id}>
                  <Table.BodyCell className="font-medium">
                    {budget.name}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant="neutral">{budget.period}</Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="font-semibold">
                    {formatAmount(convertAmount(budget.limitAmount))}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    {formatAmount(convertAmount(budget.currentSpent))}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            budget.spentPercentage >= 100
                              ? 'bg-danger-500'
                              : budget.spentPercentage >= 80
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                          }`}
                          style={{ width: `${Math.min(budget.spentPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                        {budget.spentPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant={budget.isOverBudget ? 'danger' : 'success'}>
                      {budget.isOverBudget ? 'Over Budget' : 'OK'}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenForm(budget)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Edit budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(budget.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Table.BodyCell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Table.Container>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Budget Form Modal */}
      <Modal
        isOpen={openForm}
        onClose={() => !submitting && handleCloseForm()}
        title={editingBudget ? 'Edit Budget' : 'Add Budget'}
        size="lg"
      >
        <BudgetForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          budget={editingBudget}
          categories={categories}
          isSubmitting={submitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteDialog}
        onClose={() => !deleting && setOpenDeleteDialog(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this budget? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteBudget} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetList;
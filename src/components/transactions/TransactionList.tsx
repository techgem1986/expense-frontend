import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Table,
  Modal,
} from '../ui';
import DateRangeFilter, {
  getCurrentMonthStart,
  getCurrentMonthEnd,
  getPreviousMonthStart,
  getPreviousMonthEnd,
  getNextMonthStart,
  getNextMonthEnd,
} from '../ui/DateRangeFilter';
import { TransactionResponse, TransactionRequest } from '../../types';
import { transactionAPI, categoryAPI, accountAPI } from '../../services/api';
import { getErrorMessage, getFieldErrors } from '../../services/errorUtils';
import TransactionForm from './TransactionForm';
import { Category } from '../../types';
import { Account } from '../../types/account';
import { useCurrency } from '../../contexts/CurrencyContext';

const TransactionList: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Date range state - default to current month
  const [startDate, setStartDate] = useState(getCurrentMonthStart);
  const [endDate, setEndDate] = useState(getCurrentMonthEnd);
  const [appliedStartDate, setAppliedStartDate] = useState(getCurrentMonthStart);
  const [appliedEndDate, setAppliedEndDate] = useState(getCurrentMonthEnd);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountAPI.getAll();
      if (response.data.success) {
        const data = response.data.data.content || response.data.data || [];
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll(
        page,
        20,
        'createdAt,desc',
        appliedStartDate,
        appliedEndDate
      );
      if (response.data && response.data.data) {
        setTransactions(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  }, [page, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    fetchAccounts();
  }, [page, fetchCategories, fetchTransactions, fetchAccounts]);

  const handleOpenForm = (transaction?: TransactionResponse) => {
    if (transaction) {
      setEditingTransaction(transaction);
    } else {
      setEditingTransaction(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = async (formData: TransactionRequest) => {
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, formData);
      } else {
        await transactionAPI.create(formData);
      }
      handleCloseForm();
      fetchTransactions();
    } catch (err: any) {
      // Handle field-specific validation errors
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        // If we have field errors, we could pass them to the form
        // For now, we'll show a general error message
        setError(getErrorMessage(err, 'Validation failed. Please check your input.'));
      } else {
        setError(getErrorMessage(err, 'Failed to save transaction'));
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setTransactionToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete === null) return;
    setDeleting(true);
    try {
      await transactionAPI.delete(transactionToDelete);
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
      setOpenDeleteDialog(false);
      setTransactionToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete transaction'));
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTransactionAmount = (amount: number, type: string): string => {
    const prefix = type === 'INCOME' ? '+' : '-';
    return `${prefix}${formatAmount(convertAmount(Math.abs(amount)))}`;
  };

  const handleApplyDateRange = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(0); // Reset to first page when applying new date range
  };

  const handlePreviousMonth = () => {
    setStartDate(getPreviousMonthStart());
    setEndDate(getPreviousMonthEnd());
  };

  const handleNextMonth = () => {
    setStartDate(getNextMonthStart());
    setEndDate(getNextMonthEnd());
  };

  const formatDisplayDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && transactions.length === 0) {
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
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDisplayDate(appliedStartDate)} - {formatDisplayDate(appliedEndDate)}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <Card padding="md">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyDateRange}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      </Card>

      {/* Transactions Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell align="right">Type</Table.HeadCell>
              <Table.HeadCell align="right">Amount</Table.HeadCell>
              <Table.HeadCell align="center">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {transactions.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={6}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No transactions found</p>
                    <p className="text-sm mt-1">Add your first transaction to get started</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              transactions.map((transaction) => (
                <Table.Row key={transaction.id}>
                  <Table.BodyCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(transaction.transactionDate)}
                    </div>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant="neutral">
                      {getCategoryName(transaction.category?.id)}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="font-medium">
                    {transaction.description}
                  </Table.BodyCell>
                  <Table.BodyCell align="right">
                    <Badge
                      variant={transaction.type === 'INCOME' ? 'success' : 'danger'}
                    >
                      {transaction.type}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell
                    align="right"
                    className={`font-bold ${
                      transaction.type === 'INCOME'
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}
                  >
                    {formatTransactionAmount(transaction.amount, transaction.type)}
                  </Table.BodyCell>
                  <Table.BodyCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenForm(transaction)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(transaction.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete transaction"
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      <Modal
        isOpen={openForm}
        onClose={handleCloseForm}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
      >
        <TransactionForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          transaction={editingTransaction}
          categories={categories}
          accounts={accounts}
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
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteTransaction} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionList;
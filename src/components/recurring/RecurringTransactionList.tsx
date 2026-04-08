import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Repeat, RefreshCw } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  Modal,
  Pagination,
} from '../ui';
import { RecurringTransactionResponse, RecurringTransactionRequest, Category } from '../../types';
import { AccountSummary } from '../../types/account';
import { recurringTransactionAPI, categoryAPI, accountAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import RecurringTransactionForm from './RecurringTransactionForm';
import { useCurrency } from '../../contexts/CurrencyContext';

const RecurringTransactionList: React.FC = () => {
  const { formatAmount, convertAmount } = useCurrency();
  const [recurring, setRecurring] = useState<RecurringTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransactionResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recurringToDelete, setRecurringToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchRecurringTransactions();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getActive();
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        data = response.data.content;
      }
      setAccounts(data);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
    }
  };

  const fetchRecurringTransactions = async () => {
    setLoading(true);
    try {
      const response = await recurringTransactionAPI.getAll(page, 20, 'createdAt,desc');
      if (response.data && response.data.data) {
        setRecurring(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch recurring transactions'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (transaction?: RecurringTransactionResponse) => {
    if (transaction) {
      setEditingRecurring(transaction);
    } else {
      setEditingRecurring(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingRecurring(null);
  };

  const handleFormSubmit = async (formData: RecurringTransactionRequest) => {
    setSubmitting(true);
    try {
      if (editingRecurring) {
        await recurringTransactionAPI.update(editingRecurring.id, formData);
      } else {
        await recurringTransactionAPI.create(formData);
      }
      handleCloseForm();
      fetchRecurringTransactions();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save recurring transaction'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setRecurringToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteRecurring = async () => {
    if (recurringToDelete === null) return;
    setDeleting(true);
    try {
      await recurringTransactionAPI.delete(recurringToDelete);
      setRecurring(recurring.filter((r) => r.id !== recurringToDelete));
      setOpenDeleteDialog(false);
      setRecurringToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete recurring transaction'));
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (recurringItem: RecurringTransactionResponse): string => {
    // First check if category exists and get its name
    if (recurringItem.category?.id) {
      const category = categories.find((c) => c.id === recurringItem.category?.id);
      if (category) {
        return category.name;
      }
    }
    return 'Uncategorized';
  };

  const getAccountInfo = (recurringItem: RecurringTransactionResponse): string => {
    const parts: string[] = [];
    if (recurringItem.fromAccount) {
      parts.push(recurringItem.fromAccount.name);
    }
    if (recurringItem.toAccount) {
      parts.push(recurringItem.toAccount.name);
    }
    return parts.join(' | ');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
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
            Recurring Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage automatic recurring payments and income
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Recurring
        </Button>
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Recurring Transactions Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Accounts</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Frequency</Table.HeadCell>
              <Table.HeadCell>Next Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell align="center">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {recurring.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={8}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Repeat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No recurring transactions found</p>
                    <p className="text-sm mt-1">Set up recurring transactions for automatic tracking</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              recurring.map((rec) => (
                <Table.Row key={rec.id}>
                  <Table.BodyCell className="font-medium">
                    {rec.name}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant="neutral">
                      {getCategoryName(rec)}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="text-sm text-gray-500 dark:text-gray-400">
                    {getAccountInfo(rec)}
                  </Table.BodyCell>
                  <Table.BodyCell className="font-semibold">
                    {formatAmount(convertAmount(rec.amount))}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      {rec.frequency}
                    </span>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    {formatDate(rec.nextExecutionDate)}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant={rec.isActive ? 'success' : 'neutral'}>
                      {rec.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenForm(rec)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Edit recurring transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rec.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete recurring transaction"
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

       {/* Recurring Transaction Form Modal */}
      <Modal
        isOpen={openForm}
        onClose={() => !submitting && handleCloseForm()}
        title={editingRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
        size="lg"
      >
        <RecurringTransactionForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          recurring={editingRecurring}
          categories={categories}
          accounts={accounts}
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
            Are you sure you want to delete this recurring transaction? This action cannot be undone.
          </p>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteRecurring} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default RecurringTransactionList;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TransactionResponse, TransactionRequest } from '../../types';
import { transactionAPI, categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import TransactionForm from './TransactionForm';
import { Category } from '../../types';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll(page);
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
  }, [page]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [page, fetchCategories, fetchTransactions]);

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
      setError(getErrorMessage(err, 'Failed to save transaction'));
    }
  };

  const handleDeleteClick = (id: number) => {
    setTransactionToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete === null) return;
    try {
      await transactionAPI.delete(transactionToDelete);
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
      setOpenDeleteDialog(false);
      setTransactionToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete transaction'));
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

  const formatAmount = (amount: number, type: string): string => {
    const prefix = type === 'INCOME' ? '+' : '-';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  if (loading && transactions.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transactions</h1>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Transaction
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                  <TableCell>{getCategoryName(transaction.category?.id)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'INCOME' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: transaction.type === 'INCOME' ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(transaction)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(transaction.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack sx={{ mt: 3, alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
          />
        </Stack>
      )}

      <TransactionForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        categories={categories}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this transaction?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteTransaction} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RecurringTransactionResponse, RecurringTransactionRequest, Category } from '../../types';
import { recurringTransactionAPI, categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import RecurringTransactionForm from './RecurringTransactionForm';

const RecurringTransactionList: React.FC = () => {
  const [recurring, setRecurring] = useState<RecurringTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransactionResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recurringToDelete, setRecurringToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchRecurringTransactions();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchRecurringTransactions = async () => {
    setLoading(true);
    try {
      const response = await recurringTransactionAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setRecurring(data);
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
    }
  };

  const handleDeleteClick = (id: number) => {
    setRecurringToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteRecurring = async () => {
    if (recurringToDelete === null) return;
    try {
      await recurringTransactionAPI.delete(recurringToDelete);
      setRecurring(recurring.filter((r) => r.id !== recurringToDelete));
      setOpenDeleteDialog(false);
      setRecurringToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete recurring transaction'));
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Recurring Transactions</h1>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Recurring
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Next Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurring.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No recurring transactions found
                </TableCell>
              </TableRow>
            ) : (
              recurring.map((rec) => (
                <TableRow key={rec.id} hover>
                  <TableCell>{rec.name}</TableCell>
                  <TableCell>{getCategoryName(rec.category?.id)}</TableCell>
                  <TableCell>${rec.amount.toFixed(2)}</TableCell>
                  <TableCell>{rec.frequency}</TableCell>
                  <TableCell>{formatDate(rec.nextExecutionDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={rec.isActive ? 'Active' : 'Inactive'}
                      color={rec.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(rec)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(rec.id)}
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

      <RecurringTransactionForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        recurring={editingRecurring}
        categories={categories}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this recurring transaction?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteRecurring} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringTransactionList;

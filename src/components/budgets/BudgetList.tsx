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
  LinearProgress,
  Pagination,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { BudgetResponse, BudgetRequest, Category } from '../../types';
import { budgetAPI, categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import BudgetForm from './BudgetForm';

const BudgetList: React.FC = () => {
  const [budgets, setbudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
    }
  };

  const handleDeleteClick = (id: number) => {
    setBudgetToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteBudget = async () => {
    if (budgetToDelete === null) return;
    try {
      await budgetAPI.delete(budgetToDelete);
      setbudgets(budgets.filter((b) => b.id !== budgetToDelete));
      setOpenDeleteDialog(false);
      setBudgetToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete budget'));
    }
  };

  const getProgressColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  if (loading && budgets.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Budgets</h1>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Budget
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Limit</TableCell>
              <TableCell>Spent</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No budgets found
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => (
                <TableRow key={budget.id} hover>
                  <TableCell>{budget.name}</TableCell>
                  <TableCell>{budget.period}</TableCell>
                  <TableCell>${budget.limitAmount.toFixed(2)}</TableCell>
                  <TableCell>${budget.currentSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(budget.spentPercentage, 100)}
                          color={getProgressColor(budget.spentPercentage)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        {budget.spentPercentage.toFixed(1)}%
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={budget.isOverBudget ? 'Over Budget' : 'OK'}
                      color={budget.isOverBudget ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(budget)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(budget.id)}
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

      <BudgetForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        budget={editingBudget}
        categories={categories}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this budget?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteBudget} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetList;

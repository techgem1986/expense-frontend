import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Category, CategoryUpdateRequest, CategoryFormData } from '../../types';
import { categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import CategoryForm from './CategoryForm';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryUpdateRequest | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      // Handle both { data: [...] } and [...]
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
        setError('Unexpected categories response format');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormError(null);
    setOpenForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      description: category.description || '',
      type: category.type,
    });
    setFormError(null);
    setOpenForm(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryAPI.delete(categoryToDelete.toString());
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
      setOpenDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete category'));
    }
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setFormError(null);
    try {
      if (editingCategory) {
        const response = await categoryAPI.update(editingCategory.id.toString(), {
          name: data.name,
          description: data.description,
          type: data.type,
        });
        setCategories(
          categories.map((cat) => (cat.id === editingCategory.id ? response.data : cat)),
        );
      } else {
        const response = await categoryAPI.create({
          name: data.name,
          description: data.description,
          type: data.type,
        });
        setCategories([...categories, response.data]);
      }
      setOpenForm(false);
      setEditingCategory(null);
    } catch (err: any) {
      setFormError(getErrorMessage(err, 'Failed to save category'));
    }
  };

  const getInitialFormData = (): CategoryFormData | undefined => {
    if (!editingCategory) return undefined;
    return {
      name: editingCategory.name,
      description: editingCategory.description || '',
      type: editingCategory.type,
    };
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCategory}>
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>
                  <Chip label={category.type} color={getTypeColor(category.type)} size="small" />
                </TableCell>
                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEditCategory(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCategory(category.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Category Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <CategoryForm
            onSubmit={handleFormSubmit}
            initialData={getInitialFormData()}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this category? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;

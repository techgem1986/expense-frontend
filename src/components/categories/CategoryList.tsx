import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  Modal,
  Pagination,
} from '../ui';
import { Category, CategoryUpdateRequest, CategoryFormData } from '../../types';
import { categoryAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import CategoryForm from './CategoryForm';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryUpdateRequest | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll(page, 20, 'createdAt,desc');
      if (response.data && response.data.data) {
        setCategories(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
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

    setDeleting(true);
    try {
      await categoryAPI.delete(categoryToDelete.toString());
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
      // Refresh the list to ensure consistency
      await fetchCategories();
      setOpenDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete category'));
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingCategory) {
        const response = await categoryAPI.update(editingCategory.id.toString(), {
          name: data.name,
          description: data.description,
          type: data.type,
        });
        const updatedCategory = response.data.data || response.data;
        setCategories(
          categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)),
        );
      } else {
        const response = await categoryAPI.create({
          name: data.name,
          description: data.description,
          type: data.type,
        });
        const newCategory = response.data.data || response.data;
        setCategories([...categories, newCategory]);
      }
      setOpenForm(false);
      setEditingCategory(null);
    } catch (err: any) {
      setFormError(getErrorMessage(err, 'Failed to save category'));
    } finally {
      setSubmitting(false);
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
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <Button
          onClick={handleAddCategory}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Category
        </Button>
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell align="right">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {categories.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={5}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Tags className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No categories found</p>
                    <p className="text-sm mt-1">Create your first category to organize transactions</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              categories.map((category) => (
                <Table.Row key={category.id}>
                  <Table.BodyCell className="font-medium">
                    {category.name}
                  </Table.BodyCell>
                  <Table.BodyCell className="text-gray-500 dark:text-gray-400">
                    {category.description || '-'}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant={category.type === 'INCOME' ? 'success' : 'danger'}>
                      {category.type}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="text-gray-500 dark:text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </Table.BodyCell>
                  <Table.BodyCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete category"
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

       {/* Category Form Modal */}
      <Modal
        isOpen={openForm}
        onClose={() => !submitting && setOpenForm(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        {formError && (
          <div className="mb-4 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg text-sm">
            {formError}
          </div>
        )}
        <CategoryForm
          onSubmit={handleFormSubmit}
          initialData={getInitialFormData()}
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
            Are you sure you want to delete this category? This action cannot be undone.
          </p>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteCategory} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;
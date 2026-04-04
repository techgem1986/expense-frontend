import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select } from '../ui';

const categorySchema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().default(''),
  type: yup.string().oneOf(['INCOME', 'EXPENSE']).required('Category type is required'),
});

export interface CategoryFormData {
  name: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: CategoryFormData;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      type: 'EXPENSE',
    },
  });

  const onSubmitForm = React.useCallback(
    (formData: CategoryFormData) => {
      onSubmit(formData);
      reset();
    },
    [onSubmit, reset]
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input
        label="Category Name"
        placeholder="e.g., Groceries"
        error={errors.name?.message}
        {...register('name')}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Optional description"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>
        )}
      </div>
      <Select
        label="Type"
        options={[
          { value: 'INCOME', label: 'Income' },
          { value: 'EXPENSE', label: 'Expense' },
        ]}
        error={errors.type?.message}
        {...register('type')}
      />
      <div className="flex justify-end pt-4">
        <Button type="submit">
          {initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select } from '../ui';
import { BudgetRequest, BudgetResponse, Category, BudgetPeriod } from '../../types';

type BudgetFormData = {
  name: string;
  limitAmount: number;
  period: string;
  alertThreshold?: number;
  startDate: string;
  categoryIds?: number[];
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(100, 'Max 100 characters'),
  limitAmount: yup
    .number()
    .positive('Amount must be positive')
    .required('Limit amount is required'),
  period: yup.string().required('Period is required').oneOf(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  alertThreshold: yup.number().optional().positive('Must be positive'),
  startDate: yup.string().required('Start date is required'),
  categoryIds: yup.array().of(yup.number().required()).nullable(),
}) as any;

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (_: BudgetRequest) => void;
  budget?: BudgetResponse | null;
  categories: Category[];
  isSubmitting?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onClose,
  onSubmit,
  budget,
  categories,
  isSubmitting = false,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<BudgetFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      limitAmount: undefined,
      period: 'MONTHLY',
      alertThreshold: undefined,
      startDate: new Date().toISOString().split('T')[0],
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (budget) {
      setValue('name', budget.name);
      setValue('limitAmount', budget.limitAmount);
      setValue('period', budget.period);
      setValue('alertThreshold', budget.alertThreshold);
      setValue('startDate', budget.startDate);
      setSelectedCategories(budget.categories.map((c) => c.id));
    } else {
      reset();
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('period', 'MONTHLY');
      setSelectedCategories([]);
    }
  }, [budget, open, setValue, reset]);

  const handleFormSubmit: SubmitHandler<BudgetFormData> = (data) => {
    const request: BudgetRequest = {
      name: data.name,
      limitAmount: data.limitAmount,
      period: data.period as BudgetPeriod,
      alertThreshold: data.alertThreshold,
      startDate: data.startDate,
      categoryIds: selectedCategories,
    };
    onSubmit(request);
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-4">
      <Input
        label="Budget Name"
        placeholder="e.g., Monthly Groceries"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Limit Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.limitAmount?.message}
        {...register('limitAmount')}
      />

      <Select
        label="Period"
        options={[
          { value: 'MONTHLY', label: 'Monthly' },
          { value: 'QUARTERLY', label: 'Quarterly' },
          { value: 'YEARLY', label: 'Yearly' },
        ]}
        defaultValue="MONTHLY"
        error={errors.period?.message}
        {...register('period')}
      />

      <Input
        label="Alert Threshold (%)"
        type="number"
        min="0"
        max="100"
        placeholder="80"
        error={errors.alertThreshold?.message}
        {...register('alertThreshold')}
      />

      <Input
        label="Start Date"
        type="date"
        error={errors.startDate?.message}
        {...register('startDate')}
      />

      {/* Categories Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories (Select multiple)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 ${
                selectedCategories.includes(category.id)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-2 border-primary-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        {selectedCategories.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select at least one category to track
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (budget ? 'Update' : 'Create')}
        </Button>
      </div>
    </div>
  );
};

export default BudgetForm;
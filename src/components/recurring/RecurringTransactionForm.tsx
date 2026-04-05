import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select } from '../ui';
import { RecurringTransactionRequest, RecurringTransactionResponse, Category, Frequency } from '../../types';
import { AccountSummary } from '../../types/account';

// Special category ID for Money Transfer
const MONEY_TRANSFER_CATEGORY_ID = -1;

type RecurringFormData = {
  name: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  dayOfMonth: number;
  startDate: string;
  endDate: string;
  categoryId?: number | null;
  fromAccountId?: number | null;
  toAccountId?: number | null;
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  type: yup.string().required('Type is required').oneOf(['INCOME', 'EXPENSE']),
  description: yup.string(),
  frequency: yup.string().required('Frequency is required'),
  dayOfMonth: yup
    .number()
    .typeError('Day of month must be a number')
    .min(1, 'Must be between 1 and 31')
    .max(31, 'Must be between 1 and 31')
    .required('Day of month is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string(),
  categoryId: yup.number().optional().nullable(),
  fromAccountId: yup.number().optional().nullable(),
  toAccountId: yup.number().when('categoryId', {
    is: MONEY_TRANSFER_CATEGORY_ID,
    then: (schema) => schema.required('To Account is required for Money Transfer'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
}) as any;

interface RecurringTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (_: RecurringTransactionRequest) => void;
  recurring?: RecurringTransactionResponse | null;
  categories: Category[];
  accounts: AccountSummary[];
  isSubmitting?: boolean;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  recurring,
  categories,
  accounts,
  isSubmitting = false,
}) => {
  const [isMoneyTransfer, setIsMoneyTransfer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<RecurringFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      type: 'EXPENSE',
      description: '',
      frequency: 'MONTHLY',
      dayOfMonth: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      categoryId: undefined,
      fromAccountId: undefined,
      toAccountId: undefined,
    },
  });

  const watchedCategoryId = watch('categoryId');

  useEffect(() => {
    // Check if Money Transfer is selected
    setIsMoneyTransfer(watchedCategoryId === MONEY_TRANSFER_CATEGORY_ID);
    
    // Clear toAccountId when category changes away from Money Transfer
    if (!isMoneyTransfer && watchedCategoryId !== MONEY_TRANSFER_CATEGORY_ID) {
      setValue('toAccountId', undefined);
    }
  }, [watchedCategoryId, isMoneyTransfer, setValue]);

  useEffect(() => {
    if (recurring) {
      setValue('name', recurring.name);
      setValue('amount', recurring.amount);
      setValue('type', recurring.type);
      setValue('description', recurring.description || '');
      setValue('frequency', recurring.frequency);
      setValue('dayOfMonth', recurring.dayOfMonth);
      setValue('startDate', recurring.startDate);
      setValue('endDate', recurring.endDate || '');
      setValue('categoryId', recurring.category?.id || undefined);
      setValue('fromAccountId', recurring.fromAccount?.id || undefined);
      setValue('toAccountId', recurring.toAccount?.id || undefined);
      
      // Check if this is a money transfer
      const isMoneyTransferCategory = categories.some(
        (cat) => cat.id === recurring.category?.id && cat.name.toLowerCase() === 'money transfer'
      );
      // Also check if fromAccount or toAccount exists (for backward compatibility)
      const hasAccounts = !!(recurring.fromAccount || recurring.toAccount);
      setIsMoneyTransfer(isMoneyTransferCategory || hasAccounts);
    } else {
      reset();
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('type', 'EXPENSE');
      setValue('frequency', 'MONTHLY');
      setValue('fromAccountId', undefined);
      setValue('toAccountId', undefined);
      setIsMoneyTransfer(false);
    }
  }, [recurring, open, setValue, reset, categories]);

  const handleFormSubmit: SubmitHandler<RecurringFormData> = (data) => {
    const request: RecurringTransactionRequest = {
      name: data.name,
      amount: data.amount,
      type: data.type as 'INCOME' | 'EXPENSE',
      description: data.description,
      frequency: data.frequency as Frequency,
      dayOfMonth: data.dayOfMonth,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      categoryId: data.categoryId === MONEY_TRANSFER_CATEGORY_ID ? undefined : (data.categoryId ?? undefined),
      fromAccountId: data.fromAccountId ?? undefined,
      toAccountId: data.toAccountId ?? undefined,
    };
    onSubmit(request);
  };

  // Create combined categories list with Money Transfer option
  const getCategoriesWithMoneyTransfer = () => {
    const moneyTransferOption = { id: MONEY_TRANSFER_CATEGORY_ID, name: 'Money Transfer', type: 'EXPENSE' as const };
    return [moneyTransferOption, ...categories];
  };

  return (
    <div className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g., Monthly Rent"
        error={errors.name?.message}
        {...register('name')}
      />

      <Select
        label="Type"
        options={[
          { value: 'INCOME', label: 'Income' },
          { value: 'EXPENSE', label: 'Expense' },
        ]}
        defaultValue="EXPENSE"
        error={errors.type?.message}
        {...register('type')}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Select
        label="Frequency"
        options={[
          { value: 'DAILY', label: 'Daily' },
          { value: 'WEEKLY', label: 'Weekly' },
          { value: 'MONTHLY', label: 'Monthly' },
          { value: 'QUARTERLY', label: 'Quarterly' },
          { value: 'YEARLY', label: 'Yearly' },
        ]}
        defaultValue="MONTHLY"
        error={errors.frequency?.message}
        {...register('frequency')}
      />

      <Input
        label="Day of Month"
        type="number"
        min="1"
        max="31"
        placeholder="1"
        error={errors.dayOfMonth?.message}
        {...register('dayOfMonth')}
      />

      <Input
        label="Start Date"
        type="date"
        error={errors.startDate?.message}
        {...register('startDate')}
      />

      <Input
        label="End Date (Optional)"
        type="date"
        error={errors.endDate?.message}
        {...register('endDate')}
      />

      {/* From Account - Always visible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          From Account
        </label>
        <select
          {...register('fromAccountId')}
          className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
            errors.fromAccountId
              ? 'border-danger-500 dark:border-danger-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">Select Account</option>
          {Array.isArray(accounts) && accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.accountType})
            </option>
          ))}
        </select>
        {errors.fromAccountId && (
          <p className="mt-1 text-xs text-danger-500">{errors.fromAccountId.message}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          {...register('categoryId')}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="">None</option>
          {getCategoriesWithMoneyTransfer().map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* To Account - Only visible for Money Transfer */}
      {isMoneyTransfer && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Account
          </label>
          <select
            {...register('toAccountId')}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
              errors.toAccountId
                ? 'border-danger-500 dark:border-danger-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Account</option>
            {Array.isArray(accounts) && accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.accountType})
              </option>
            ))}
          </select>
          {errors.toAccountId && (
            <p className="mt-1 text-xs text-danger-500">{errors.toAccountId.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Optional description"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (recurring ? 'Update' : 'Create')}
        </Button>
      </div>
    </div>
  );
};

export default RecurringTransactionForm;
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select } from '../ui';
import {
  RecurringTransactionRequest,
  RecurringTransactionResponse,
  Category,
  Frequency,
} from '../../types';
import { AccountSummary } from '../../types/account';

type RecurringFormData = {
  name: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  dayOfMonth: number;
  startDate: string;
  endDate: string;
  categoryId?: string | number | null;
  fromAccountId?: string | number | null;
  toAccountId?: string | number | null;
};

interface RecurringTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringTransactionRequest) => void;
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
  const [showToAccount, setShowToAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Find Money Transfer category ID from the categories list
  const moneyTransferCategoryId = useMemo(() => {
    const mtCategory = categories.find((cat) => cat.name.toLowerCase() === 'money transfer');
    return mtCategory?.id;
  }, [categories]);

  // Build validation schema dynamically so it can reference moneyTransferCategoryId.
  // Rules:
  //   • Income        → To Account is mandatory
  //   • Expense       → From Account is mandatory
  //   • Self Transfer → Both From Account and To Account are mandatory
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required('Name is required'),
        amount: yup
          .number()
          .typeError('Amount must be a number')
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
        fromAccountId: yup
          .number()
          .test('from-account-required', 'From Account is required', function (value) {
            const { type, categoryId } = this.parent;
            const isExpense = type === 'EXPENSE';
            const isTransfer =
              moneyTransferCategoryId !== undefined &&
              categoryId != null &&
              categoryId !== '' &&
              Number(categoryId) === moneyTransferCategoryId;
            if (isExpense || isTransfer) {
              return value != null && Number(value) > 0;
            }
            return true;
          }),
        toAccountId: yup
          .number()
          .test('to-account-required', 'To Account is required', function (value) {
            const { type, categoryId } = this.parent;
            const isIncome = type === 'INCOME';
            const isTransfer =
              moneyTransferCategoryId !== undefined &&
              categoryId != null &&
              categoryId !== '' &&
              Number(categoryId) === moneyTransferCategoryId;
            if (isIncome || isTransfer) {
              return value != null && Number(value) > 0;
            }
            return true;
          }),
      }) as any,
    [moneyTransferCategoryId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    setError,
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

  const selectedType = watch('type');
  const watchedCategoryIdRaw = watch('categoryId');
  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');

  // Check if Money Transfer category is selected
  const isMoneyTransferCategory = useMemo(() => {
    if (watchedCategoryIdRaw === undefined || watchedCategoryIdRaw === null) return false;
    const categoryIdNum = Number(watchedCategoryIdRaw);
    return moneyTransferCategoryId !== undefined && categoryIdNum === moneyTransferCategoryId;
  }, [watchedCategoryIdRaw, moneyTransferCategoryId]);

  // Determine which account fields to show
  const showFromAccount = selectedType === 'EXPENSE' || isMoneyTransferCategory;
  const showToAccountComputed = selectedType === 'INCOME' || isMoneyTransferCategory;

  // Show To Account for INCOME transactions or when Money Transfer category is selected
  useEffect(() => {
    setShowToAccount(showToAccountComputed);
  }, [showToAccountComputed]);

  // Clear toAccountId when To Account should not be shown
  useEffect(() => {
    if (!showToAccountComputed) {
      setValue('toAccountId', undefined);
    }
  }, [showToAccountComputed, setValue]);

  // Clear fromAccountId when From Account should not be shown
  useEffect(() => {
    if (!showFromAccount) {
      setValue('fromAccountId', undefined);
    }
  }, [showFromAccount, setValue]);

  // Auto-generate description for Self Transfer when Money Transfer category is selected
  // and both accounts are set
  useEffect(() => {
    if (!isMoneyTransferCategory || !fromAccountId || !toAccountId) return;
    const currentDesc = watch('description');
    const fromAccount = accounts.find((a) => a.id === fromAccountId);
    const toAccount = accounts.find((a) => a.id === toAccountId);
    if (fromAccount && toAccount) {
      const generatedDesc = `Self Transfer from ${fromAccount.name} to ${toAccount.name}`;
      if (!currentDesc || currentDesc.startsWith('Self Transfer from')) {
        setValue('description', generatedDesc);
      }
    }
  }, [isMoneyTransferCategory, fromAccountId, toAccountId, accounts, setValue, watch]);

  // Validate that From and To accounts are different when both are shown
  useEffect(() => {
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      setAccountError('From Account and To Account cannot be the same');
    } else {
      setAccountError('');
    }
  }, [fromAccountId, toAccountId]);

  // Load recurring transaction data for editing
  useEffect(() => {
    if (recurring) {
      setValue('name', recurring.name);
      setValue('amount', recurring.amount);
      // For existing Money Transfer (detected by accounts), keep the type as EXPENSE
      setValue('type', recurring.type);
      setValue('description', recurring.description || '');
      setValue('frequency', recurring.frequency);
      setValue('dayOfMonth', recurring.dayOfMonth);
      setValue('startDate', recurring.startDate);
      setValue('endDate', recurring.endDate || '');
      // Set categoryId from the recurring transaction
      if (
        moneyTransferCategoryId !== undefined &&
        recurring.category?.name?.toLowerCase() === 'money transfer'
      ) {
        setValue('categoryId', moneyTransferCategoryId);
      } else {
        setValue('categoryId', recurring.category?.id || undefined);
      }
      setValue('fromAccountId', recurring.fromAccount?.id || undefined);
      setValue('toAccountId', recurring.toAccount?.id || undefined);
    } else {
      reset();
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('type', 'EXPENSE');
      setValue('frequency', 'MONTHLY');
      setValue('fromAccountId', undefined);
      setValue('toAccountId', undefined);
    }
  }, [recurring, open, setValue, reset, moneyTransferCategoryId]);

  const handleFormSubmit: SubmitHandler<RecurringFormData> = (data) => {
    if (accountError) {
      return;
    }

    // Additional validation for self-transfer (Money Transfer category)
    // Safety net — yup schema should already enforce this
    if (isMoneyTransferCategory) {
      if (!data.fromAccountId) {
        setError('fromAccountId', { message: 'From Account is required for self transfer' });
        return;
      }
      if (!data.toAccountId) {
        setError('toAccountId', { message: 'To Account is required for self transfer' });
        return;
      }
    }

    const backendType = data.type as 'INCOME' | 'EXPENSE';

    // Convert categoryId to number
    let categoryIdNum: number | undefined = undefined;
    if (data.categoryId !== undefined && data.categoryId !== null) {
      categoryIdNum = Number(data.categoryId);
    }

    // Convert account IDs to numbers
    const fromAccountIdNum =
      data.fromAccountId !== undefined && data.fromAccountId !== null && data.fromAccountId !== ''
        ? Number(data.fromAccountId)
        : undefined;
    const toAccountIdNum =
      data.toAccountId !== undefined && data.toAccountId !== null && data.toAccountId !== ''
        ? Number(data.toAccountId)
        : undefined;

    const request: RecurringTransactionRequest = {
      name: data.name,
      amount: data.amount,
      type: backendType,
      description: data.description,
      frequency: data.frequency as Frequency,
      dayOfMonth: data.dayOfMonth,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      categoryId: categoryIdNum,
      fromAccountId: fromAccountIdNum,
      toAccountId: toAccountIdNum,
    };
    onSubmit(request);
  };

  // Filter categories based on type
  const filteredCategories = useMemo(() => {
    if (selectedType === 'INCOME') {
      return categories.filter((cat) => cat.type === 'INCOME');
    } else {
      return categories.filter((cat) => cat.type === 'EXPENSE');
    }
  }, [categories, selectedType]);

  // Check if the form is valid for enabling the submit button
  const isFormValid = useMemo(() => {
    if (accountError) return false;

    const isExpense = selectedType === 'EXPENSE';
    const isIncome = selectedType === 'INCOME';
    const isTransfer = isMoneyTransferCategory;

    // From Account required for Expense or Self Transfer
    if ((isExpense || isTransfer) && !fromAccountId) return false;

    // To Account required for Income or Self Transfer
    if ((isIncome || isTransfer) && !toAccountId) return false;

    return true;
  }, [accountError, selectedType, isMoneyTransferCategory, fromAccountId, toAccountId]);

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

      {/* From Account - shown for EXPENSE transactions or when Money Transfer is selected */}
      {showFromAccount && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Account *
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
            {Array.isArray(accounts) &&
              accounts
                .filter((account) => account.id !== toAccountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.accountType})
                  </option>
                ))}
          </select>
          {errors.fromAccountId && (
            <p className="mt-1 text-xs text-danger-500">{errors.fromAccountId.message}</p>
          )}
        </div>
      )}

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
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* To Account - shown for INCOME transactions or when Money Transfer is selected */}
      {showToAccount && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Account *
          </label>
          <select
            {...register('toAccountId')}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
              errors.toAccountId || accountError
                ? 'border-danger-500 dark:border-danger-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Account</option>
            {Array.isArray(accounts) &&
              accounts
                .filter((account) => account.id !== fromAccountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.accountType})
                  </option>
                ))}
          </select>
          {errors.toAccountId && (
            <p className="mt-1 text-xs text-danger-500">{errors.toAccountId.message}</p>
          )}
          {accountError && <p className="mt-1 text-xs text-danger-500">{accountError}</p>}
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
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? 'Saving...' : recurring ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
};

export default RecurringTransactionForm;

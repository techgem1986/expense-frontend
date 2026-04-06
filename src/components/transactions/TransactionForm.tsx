import React, { useEffect, useState, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select } from '../ui';
import { TransactionRequest, TransactionResponse, Category } from '../../types';
import { Account } from '../../types/account';

type TransactionFormData = {
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
  categoryId?: number | null;
  fromAccountId?: number | null;
  toAccountId?: number | null;
};

const validationSchema = yup.object().shape({
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  type: yup.string().required('Type is required').oneOf(['INCOME', 'EXPENSE']),
  description: yup.string(),
  transactionDate: yup.string().required('Date is required'),
  categoryId: yup.number().optional().nullable(),
  fromAccountId: yup.number().positive('Please select a valid account').optional().nullable(),
  toAccountId: yup.number().positive('Please select a valid account').optional().nullable(),
}) as any;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (_: TransactionRequest) => void;
  /** @deprecated This prop is currently not used but reserved for future edit functionality */
  transaction?: TransactionResponse | null;
  categories: Category[];
  accounts: Account[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  transaction,
  categories,
  accounts,
}) => {
  const [showToAccount, setShowToAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<TransactionFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: undefined,
      type: 'EXPENSE',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      categoryId: undefined,
      fromAccountId: undefined,
      toAccountId: undefined,
    },
  });

  const selectedType = watch('type');
  const selectedCategoryIdRaw = watch('categoryId') as string | number | null | undefined;
  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');

  // Find Money Transfer category ID from the categories list
  const moneyTransferCategoryId = useMemo(() => {
    const mtCategory = categories.find(cat => cat.name.toLowerCase() === 'money transfer');
    return mtCategory?.id;
  }, [categories]);

  // Check if Money Transfer category is selected
  const isMoneyTransferCategory = useMemo(() => {
    if (selectedCategoryIdRaw === undefined || selectedCategoryIdRaw === null || selectedCategoryIdRaw === '') return false;
    const categoryIdNum = Number(selectedCategoryIdRaw);
    return moneyTransferCategoryId !== undefined && categoryIdNum === moneyTransferCategoryId;
  }, [JSON.stringify(selectedCategoryIdRaw), moneyTransferCategoryId]);

  // Show To Account for INCOME transactions or when Money Transfer category is selected
  useEffect(() => {
    const isIncome = selectedType === 'INCOME';
    setShowToAccount(isIncome || isMoneyTransferCategory);
  }, [selectedType, isMoneyTransferCategory]);

  // Handle type changes - clear Money Transfer category for INCOME
  useEffect(() => {
    if (selectedType === 'INCOME' && isMoneyTransferCategory) {
      setValue('categoryId', undefined);
    }
  }, [selectedType, isMoneyTransferCategory, setValue]);

  // Clear toAccountId when To Account should not be shown
  useEffect(() => {
    const isIncome = selectedType === 'INCOME';
    if (!isIncome && !isMoneyTransferCategory) {
      setValue('toAccountId', undefined);
    }
  }, [selectedType, isMoneyTransferCategory, setValue]);

  // Validate that From and To accounts are different when both are shown
  useEffect(() => {
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      setAccountError('From Account and To Account cannot be the same');
    } else {
      setAccountError('');
    }
  }, [fromAccountId, toAccountId]);

  useEffect(() => {
    if (transaction) {
      setValue('amount', transaction.amount);
      setValue('type', transaction.type);
      setValue('description', transaction.description || '');
      setValue('transactionDate', transaction.transactionDate);
      setValue('categoryId', transaction.category?.id || undefined);
      setValue('fromAccountId', transaction.fromAccount?.id || undefined);
      setValue('toAccountId', transaction.toAccount?.id || undefined);
    } else {
      reset();
      setValue('transactionDate', new Date().toISOString().split('T')[0]);
      setValue('type', 'EXPENSE');
      setValue('fromAccountId', undefined);
      setValue('toAccountId', undefined);
    }
    setAccountError('');
  }, [transaction, open, setValue, reset]);

  const handleFormSubmit: SubmitHandler<TransactionFormData> = (data) => {
    if (accountError) {
      return;
    }

    const backendType = data.type as 'INCOME' | 'EXPENSE';

    // Convert categoryId to number
    let categoryIdNum: number | undefined = undefined;
    if (data.categoryId !== undefined && data.categoryId !== null) {
      categoryIdNum = Number(data.categoryId);
    }

    const request: TransactionRequest = {
      amount: data.amount.toString(),
      type: backendType,
      description: data.description,
      transactionDate: data.transactionDate,
      categoryId: categoryIdNum,
      fromAccountId: data.fromAccountId || undefined,
      toAccountId: showToAccount ? (data.toAccountId || undefined) : undefined,
    };
    
    onSubmit(request);
  };

  // Filter categories based on type
  const filteredCategories = useMemo(() => {
    if (selectedType === 'INCOME') {
      return categories.filter(cat => cat.type === 'INCOME');
    } else {
      return categories.filter(cat => cat.type === 'EXPENSE');
    }
  }, [categories, selectedType]);

  const activeAccounts = useMemo(() => {
    return accounts.filter((acc) => acc.isActive);
  }, [accounts]);

  const isFormValid = !accountError && 
    !(showToAccount && !toAccountId) && 
    !(selectedType === 'EXPENSE' && !fromAccountId);

  return (
    <div className="space-y-4">
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

      <Input
        label="Date"
        type="date"
        error={errors.transactionDate?.message}
        {...register('transactionDate')}
      />

      {/* From Account - shown for EXPENSE transactions */}
      {selectedType === 'EXPENSE' && (
        <div>
          <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Account *
          </label>
          <select
            id="fromAccountId"
            {...register('fromAccountId')}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
              errors.fromAccountId
                ? 'border-danger-500 dark:border-danger-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Account</option>
            {activeAccounts.map((account) => (
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
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          id="categoryId"
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
          <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Account *
          </label>
          <select
            id="toAccountId"
            {...register('toAccountId')}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
              errors.toAccountId || accountError
                ? 'border-danger-500 dark:border-danger-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Account</option>
            {activeAccounts
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
          {accountError && (
            <p className="mt-1 text-xs text-danger-500">{accountError}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Optional description"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(handleFormSubmit)} 
          disabled={!isFormValid}
        >
          {transaction ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
};

export default TransactionForm;
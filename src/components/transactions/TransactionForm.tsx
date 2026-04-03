import React, { useEffect, useState, useMemo } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
} from '@mui/material';
import { TransactionRequest, TransactionResponse, Category } from '../../types';
import { Account } from '../../types/account';

const MONEY_TRANSFER_CATEGORY_ID = -1;

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
  onSubmit: (data: TransactionRequest) => void;
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
    control,
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

  const selectedType = useWatch({ control, name: 'type' });
  const selectedCategoryId = watch('categoryId');
  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');

  // Determine if To Account should be shown
  useEffect(() => {
    const isIncome = selectedType === 'INCOME';
    const isMoneyTransfer = selectedCategoryId === MONEY_TRANSFER_CATEGORY_ID;
    
    // Show To Account for INCOME transactions or when Money Transfer is selected
    setShowToAccount(isIncome || isMoneyTransfer);
    
    if (!isIncome && !isMoneyTransfer) {
      setValue('toAccountId', undefined);
    }
  }, [selectedType, selectedCategoryId, setValue]);

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

    const request: TransactionRequest = {
      amount: data.amount,
      type: data.type as 'INCOME' | 'EXPENSE',
      description: data.description,
      transactionDate: data.transactionDate,
      categoryId: data.categoryId === MONEY_TRANSFER_CATEGORY_ID ? undefined : data.categoryId || undefined,
      fromAccountId: data.fromAccountId || undefined,
      toAccountId: showToAccount ? (data.toAccountId || undefined) : undefined,
    };
    onSubmit(request);
  };

  const filteredCategories = useMemo(() => {
    const typeFilter = selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE';
    return categories.filter((cat) => cat.type === typeFilter);
  }, [categories, selectedType]);

  const activeAccounts = useMemo(() => {
    return accounts.filter((acc) => acc.isActive);
  }, [accounts]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              {...register('type')}
              label="Type"
              defaultValue="EXPENSE"
            >
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </Select>
          </FormControl>

          <TextField
            {...register('amount')}
            label="Amount"
            type="number"
            inputProps={{ step: '0.01' }}
            fullWidth
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          <TextField
            {...register('transactionDate')}
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.transactionDate}
            helperText={errors.transactionDate?.message}
          />

          {/* From Account - shown only for EXPENSE transactions */}
          {selectedType === 'EXPENSE' && (
            <FormControl fullWidth error={!!errors.fromAccountId}>
              <InputLabel>From Account *</InputLabel>
              <Select
                {...register('fromAccountId')}
                label="From Account *"
                defaultValue=""
              >
                <MenuItem value="">Select Account</MenuItem>
                {activeAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.accountType})
                  </MenuItem>
                ))}
              </Select>
              {errors.fromAccountId && (
                <FormHelperText>{errors.fromAccountId.message}</FormHelperText>
              )}
            </FormControl>
          )}

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              {...register('categoryId')}
              label="Category"
              defaultValue=""
            >
              <MenuItem value="">None</MenuItem>
              {selectedType === 'EXPENSE' && (
                <MenuItem value={MONEY_TRANSFER_CATEGORY_ID}>Money Transfer</MenuItem>
              )}
              {filteredCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* To Account - shown for INCOME transactions or when Money Transfer is selected */}
          {showToAccount && (
            <FormControl fullWidth error={!!errors.toAccountId || !!accountError}>
              <InputLabel>To Account *</InputLabel>
              <Select
                {...register('toAccountId')}
                label="To Account *"
                defaultValue=""
              >
                <MenuItem value="">Select Account</MenuItem>
                {activeAccounts
                  .filter((account) => account.id !== fromAccountId)
                  .map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} ({account.accountType})
                    </MenuItem>
                  ))}
              </Select>
              {errors.toAccountId && (
                <FormHelperText>{errors.toAccountId.message}</FormHelperText>
              )}
              {accountError && (
                <FormHelperText error>{accountError}</FormHelperText>
              )}
            </FormControl>
          )}

          <TextField
            {...register('description')}
            label="Description"
            multiline
            rows={3}
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(handleFormSubmit)} 
          variant="contained" 
          color="primary"
          disabled={!!accountError || (showToAccount && !toAccountId) || (selectedType === 'EXPENSE' && !fromAccountId)}
        >
          {transaction ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;
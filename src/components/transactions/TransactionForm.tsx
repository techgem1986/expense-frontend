import React, { useEffect } from 'react';
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
} from '@mui/material';
import { TransactionRequest, TransactionResponse, Category } from '../../types';

type TransactionFormData = {
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
  categoryId?: number | null;
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
}) as any;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionRequest) => void;
  transaction?: TransactionResponse | null;
  categories: Category[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  transaction,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<TransactionFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: undefined,
      type: 'EXPENSE',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      categoryId: undefined,
    },
  });

  const selectedType = useWatch({ control, name: 'type' });

  useEffect(() => {
    if (transaction) {
      setValue('amount', transaction.amount);
      setValue('type', transaction.type);
      setValue('description', transaction.description || '');
      setValue('transactionDate', transaction.transactionDate);
      setValue('categoryId', transaction.category?.id || undefined);
    } else {
      reset();
      setValue('transactionDate', new Date().toISOString().split('T')[0]);
      setValue('type', 'EXPENSE');
    }
  }, [transaction, open, setValue, reset]);

  const handleFormSubmit: SubmitHandler<TransactionFormData> = (data) => {
    const request: TransactionRequest = {
      amount: data.amount,
      type: data.type as 'INCOME' | 'EXPENSE',
      description: data.description,
      transactionDate: data.transactionDate,
      categoryId: data.categoryId || undefined,
    };
    onSubmit(request);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === (selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE'),
  );

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

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              {...register('categoryId')}
              label="Category"
              defaultValue=""
            >
              <MenuItem value="">None</MenuItem>
              {filteredCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" color="primary">
          {transaction ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;

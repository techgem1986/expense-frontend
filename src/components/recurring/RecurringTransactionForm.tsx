import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { RecurringTransactionRequest, RecurringTransactionResponse, Category, Frequency } from '../../types';

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
}) as any;

interface RecurringTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringTransactionRequest) => void;
  recurring?: RecurringTransactionResponse | null;
  categories: Category[];
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  recurring,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
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
    },
  });

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
    } else {
      reset();
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('type', 'EXPENSE');
      setValue('frequency', 'MONTHLY');
    }
  }, [recurring, open, setValue, reset]);

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
      categoryId: data.categoryId || undefined,
    };
    onSubmit(request);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {recurring ? 'Edit Recurring Transaction' : 'Add RecurringTransaction'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name')}
            label="Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />

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

          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              {...register('frequency')}
              label="Frequency"
              defaultValue="MONTHLY"
            >
              <MenuItem value="DAILY">Daily</MenuItem>
              <MenuItem value="WEEKLY">Weekly</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="QUARTERLY">Quarterly</MenuItem>
              <MenuItem value="YEARLY">Yearly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            {...register('dayOfMonth')}
            label="Day of Month"
            type="number"
            fullWidth
            error={!!errors.dayOfMonth}
            helperText={errors.dayOfMonth?.message}
          />

          <TextField
            {...register('startDate')}
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
          />

          <TextField
            {...register('endDate')}
            label="End Date (Optional)"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              {...register('categoryId')}
              label="Category"
              defaultValue=""
            >
              <MenuItem value="">None</MenuItem>
              {categories.map((cat) => (
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
            rows={2}
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" color="primary">
          {recurring ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringTransactionForm;

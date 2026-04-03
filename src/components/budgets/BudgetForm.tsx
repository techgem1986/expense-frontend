import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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
  OutlinedInput,
  Chip,
} from '@mui/material';
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
  onSubmit: (data: BudgetRequest) => void;
  budget?: BudgetResponse | null;
  categories: Category[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onClose,
  onSubmit,
  budget,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
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
      setValue('categoryIds', budget.categories.map((c) => c.id));
    } else {
      reset();
      setValue('startDate', new Date().toISOString().split('T')[0]);
      setValue('period', 'MONTHLY');
    }
  }, [budget, open, setValue, reset]);

  const handleFormSubmit: SubmitHandler<BudgetFormData> = (data) => {
    const request: BudgetRequest = {
      name: data.name,
      limitAmount: data.limitAmount,
      period: data.period as BudgetPeriod,
      alertThreshold: data.alertThreshold,
      startDate: data.startDate,
      categoryIds: data.categoryIds || [],
    };
    onSubmit(request);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {budget ? 'Edit Budget' : 'Add New Budget'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name')}
            label="Budget Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            {...register('limitAmount')}
            label="Limit Amount"
            type="number"
            inputProps={{ step: '0.01' }}
            fullWidth
            error={!!errors.limitAmount}
            helperText={errors.limitAmount?.message}
          />

          <FormControl fullWidth>
            <InputLabel>Period</InputLabel>
            <Select
              {...register('period')}
              label="Period"
              defaultValue="MONTHLY"
            >
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="QUARTERLY">Quarterly</MenuItem>
              <MenuItem value="YEARLY">Yearly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            {...register('alertThreshold')}
            label="Alert Threshold (%)"
            type="number"
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            error={!!errors.alertThreshold}
            helperText={errors.alertThreshold?.message}
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

          <FormControl fullWidth>
            <InputLabel>Categories</InputLabel>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const cat = categories.find((c) => c.id === id);
                        return <Chip key={id} label={cat?.name} />;
                      })}
                    </Box>
                  )}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" color="primary">
          {budget ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetForm;

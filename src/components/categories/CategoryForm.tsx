import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
} from '@mui/material';

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
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmitForm)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <TextField
        fullWidth
        label="Category Name"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        required
      />
      <TextField
        fullWidth
        label="Description"
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
        multiline
        rows={3}
      />
      <FormControl fullWidth error={!!errors.type} required>
        <InputLabel>Type</InputLabel>
        <Select {...register('type')} label="Type">
          <MenuItem value="INCOME">Income</MenuItem>
          <MenuItem value="EXPENSE">Expense</MenuItem>
        </Select>
        {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default CategoryForm;

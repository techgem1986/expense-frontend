import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../types/currency';

const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setCurrency } = useCurrency();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setCurrency(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="currency-selector-label">Currency</InputLabel>
      <Select
        labelId="currency-selector-label"
        value={selectedCurrency.code}
        label="Currency"
        onChange={handleChange}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
        }}
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <MenuItem
            key={currency.code}
            value={currency.code}
            sx={{ color: 'text.primary' }}
          >
            {currency.code} - {currency.name} ({currency.symbol})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CurrencySelector;
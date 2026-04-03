import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Currency, SUPPORTED_CURRENCIES, convertCurrency, formatCurrency, getCurrencyByCode } from '../types/currency';

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currencyCode: string) => void;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatAmount: (amount: number) => string;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred_currency';
const DEFAULT_CURRENCY_CODE = 'INR';

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return getCurrencyByCode(stored || DEFAULT_CURRENCY_CODE) || SUPPORTED_CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedCurrency.code);
  }, [selectedCurrency]);

  const setCurrency = useCallback((currencyCode: string) => {
    const currency = getCurrencyByCode(currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
    }
  }, []);

  const convertAmount = useCallback((amount: number, fromCurrency?: string) => {
    const sourceCurrency = fromCurrency || DEFAULT_CURRENCY_CODE;
    return convertCurrency(amount, sourceCurrency, selectedCurrency.code);
  }, [selectedCurrency]);

  const formatAmount = useCallback((amount: number) => {
    return formatCurrency(amount, selectedCurrency.code);
  }, [selectedCurrency]);

  const getSymbol = useCallback(() => {
    return selectedCurrency.symbol;
  }, [selectedCurrency]);

  const value: CurrencyContextType = {
    selectedCurrency,
    setCurrency,
    convertAmount,
    formatAmount,
    getSymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../types/currency';

const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Currency: ${selectedCurrency.code}`}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:bg-white/[0.04] hover:text-foreground"
      >
        <span className="font-medium">{selectedCurrency.code}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {SUPPORTED_CURRENCIES.map((currency) => {
              const active = selectedCurrency.code === currency.code;
              return (
                <button
                  key={currency.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleChange(currency.code)}
                  className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150 ${
                    active
                      ? 'bg-white/[0.06] text-foreground'
                      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
                >
                  <span className="font-medium">{currency.code}</span>
                  <span className="ml-2 text-xs text-muted-foreground/80">
                    {currency.name} ({currency.symbol})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;

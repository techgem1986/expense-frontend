import React from 'react';
import { motion } from 'motion/react';

interface AnimatedAmountProps {
  value: number;
  formatFn?: (_value: number) => string;
  className?: string;
}

const AnimatedAmount: React.FC<AnimatedAmountProps> = ({ value, formatFn, className = '' }) => {
  // Default: use locale-aware currency formatting with ₹
  const defaultFormat = (n: number) => {
    const sign = n >= 0 ? '+' : '';
    const abs = Math.abs(n);
    return `${sign}₹${abs.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatter = formatFn || defaultFormat;

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`font-display font-bold ${className}`}
    >
      {formatter(value)}
    </motion.span>
  );
};

export default AnimatedAmount;

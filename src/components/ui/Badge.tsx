import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  primary:
    'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  success:
    'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
  warning:
    'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
  danger:
    'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400',
  info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400',
  neutral:
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  const baseClasses = `
    inline-flex items-center 
    font-medium rounded-full 
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return <span className={baseClasses}>{children}</span>;
};

export default Badge;
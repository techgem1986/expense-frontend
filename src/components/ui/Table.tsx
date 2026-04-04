import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const TableContainer: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>{children}</table>;
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return <thead className={`bg-gray-50 dark:bg-gray-800/50 ${className}`}>{children}</thead>;
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>{children}</tbody>;
};

interface TableFooterProps {
  children: React.ReactNode;
  className?: string;
}

const TableFooter: React.FC<TableFooterProps> = ({ children, className = '' }) => {
  return (
    <tfoot className={`bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </tfoot>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ children, className = '', hoverable = true, onClick }) => {
  const baseClasses = `
    ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (onClick) {
    return (
      <tr className={baseClasses} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </tr>
    );
  }

  return <tr className={baseClasses}>{children}</tr>;
};

interface TableHeadCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc';
  onSort?: () => void;
}

const TableHeadCell: React.FC<TableHeadCellProps> = ({
  children,
  align = 'left',
  className = '',
  sortable = false,
  sortDirection,
  onSort,
}) => {
  const baseClasses = `
    px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
    ${align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'}
    ${sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300' : ''}
    ${className}
  `;

  if (sortable) {
    return (
      <th className={baseClasses} onClick={onSort} role="columnheader" aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}>
        <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'} gap-1`}>
          {children}
          {sortDirection && (
            <span className="text-gray-400">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  }

  return <th className={baseClasses}>{children}</th>;
};

interface TableBodyCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  colSpan?: number;
}

const TableBodyCell: React.FC<TableBodyCellProps> = ({
  children,
  align = 'left',
  className = '',
  colSpan,
}) => {
  const baseClasses = `
    px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100
    ${align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'}
    ${className}
  `;

  if (colSpan) {
    return <td colSpan={colSpan} className={baseClasses}>{children}</td>;
  }

  return <td className={baseClasses}>{children}</td>;
};

// Compound component pattern
interface TableInterface extends React.FC<TableProps> {
  Container: typeof TableContainer;
  Head: typeof TableHead;
  Body: typeof TableBody;
  Footer: typeof TableFooter;
  Row: typeof TableRow;
  HeadCell: typeof TableHeadCell;
  BodyCell: typeof TableBodyCell;
}

const TableComponent = Table as TableInterface;
TableComponent.Container = TableContainer;
TableComponent.Head = TableHead;
TableComponent.Body = TableBody;
TableComponent.Footer = TableFooter;
TableComponent.Row = TableRow;
TableComponent.HeadCell = TableHeadCell;
TableComponent.BodyCell = TableBodyCell;

export {
  TableComponent as Table,
  TableContainer,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableBodyCell,
};
export default TableComponent;
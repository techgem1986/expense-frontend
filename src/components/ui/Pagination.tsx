import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  // Always show pagination controls but disable when not needed

  const goToFirstPage = () => onPageChange(0);
  const goToPreviousPage = () => onPageChange(Math.max(0, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages - 1);

  const getVisiblePageNumbers = () => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages - 1, maxVisiblePages - 1);
    }

    if (currentPage >= totalPages - 1 - half) {
      start = Math.max(0, totalPages - maxVisiblePages);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage + 1} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={goToFirstPage}
          disabled={currentPage === 0 || totalPages <= 1}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 0 || totalPages <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {showPageNumbers &&
          getVisiblePageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page + 1}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page + 1}
            </Button>
          ))}

        <Button
          variant="secondary"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1 || totalPages <= 1}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={goToLastPage}
          disabled={currentPage === totalPages - 1 || totalPages <= 1}
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
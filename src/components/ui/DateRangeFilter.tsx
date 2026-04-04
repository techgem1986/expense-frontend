import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '../ui';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  showQuickSelects?: boolean;
  className?: string;
}

/**
 * Helper function to get the first day of the current month
 */
export const getCurrentMonthStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

/**
 * Helper function to get the last day of the current month
 */
export const getCurrentMonthEnd = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
};

/**
 * Helper function to get the first day of the previous month
 */
export const getPreviousMonthStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
};

/**
 * Helper function to get the last day of the previous month
 */
export const getPreviousMonthEnd = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
};

/**
 * Helper function to get the first day of the next month
 */
export const getNextMonthStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];
};

/**
 * Helper function to get the last day of the next month
 */
export const getNextMonthEnd = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0];
};

/**
 * Helper function to get the first day of the current year
 */
export const getYearToDateStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
};

/**
 * Helper function to get the last day of the previous year
 */
export const getPreviousYearStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
};

/**
 * Helper function to get the last day of the previous year
 */
export const getPreviousYearEnd = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 0).toISOString().split('T')[0];
};

/**
 * DateRangeFilter Component
 * A reusable date range filter component with quick select options
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onPreviousMonth,
  onNextMonth,
  showQuickSelects = true,
  className = '',
}) => {
  const handleQuickSelect = (start: string, end: string) => {
    onStartDateChange(start);
    onEndDateChange(end);
    // Auto-apply when using quick selects
    setTimeout(() => onApply(), 0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main date inputs with navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full">
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {onPreviousMonth && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreviousMonth}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              aria-label="Previous month"
            >
              Prev
            </Button>
          )}
          <Button 
            onClick={onApply} 
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Apply
          </Button>
          {onNextMonth && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNextMonth}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              aria-label="Next month"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Quick select buttons */}
      {showQuickSelects && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickSelect(getCurrentMonthStart(), getCurrentMonthEnd())}
          >
            Current Month
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickSelect(getPreviousMonthStart(), getPreviousMonthEnd())}
          >
            Previous Month
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickSelect(getYearToDateStart(), getCurrentMonthEnd())}
          >
            Year to Date
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickSelect(getPreviousYearStart(), getPreviousYearEnd())}
          >
            Last Year
          </Button>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
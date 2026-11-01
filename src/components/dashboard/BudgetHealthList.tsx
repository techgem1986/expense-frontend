import React from 'react';
import StatusBadge from '../ui/StatusBadge';

export interface BudgetHealthItem {
  id: number | string;
  name: string;
  spent: number;
  limit: number;
  /** Percentage of the limit already spent. */
  percentage: number;
  isOver: boolean;
}

interface BudgetHealthListProps {
  items: BudgetHealthItem[];
  formatAmount: (value: number) => string;
  max?: number;
}

const barColor = (percentage: number, isOver: boolean) => {
  if (isOver || percentage >= 100) return 'bg-danger';
  if (percentage >= 80) return 'bg-warning';
  return 'bg-success';
};

/**
 * Compact operational list mapping the reference "Team on duty" pattern onto
 * real budget data: name, status badge and spent/limit with a utilisation bar.
 */
const BudgetHealthList: React.FC<BudgetHealthListProps> = ({ items, formatAmount, max = 5 }) => {
  const rows = items.slice(0, max);

  return (
    <ul className="divide-y divide-border">
      {rows.map((item) => {
        const percentage = Math.min(Math.max(item.percentage, 0), 100);
        const status = item.isOver ? 'Over budget' : item.percentage >= 80 ? 'Watch' : 'On track';
        const tone = item.isOver ? 'danger' : item.percentage >= 80 ? 'warning' : 'success';

        return (
          <li key={item.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-foreground">{item.name}</p>
              <StatusBadge status={status} tone={tone} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums">
                {formatAmount(item.spent)}
                <span className="text-muted-foreground/70"> / {formatAmount(item.limit)}</span>
              </span>
              <span className="tabular-nums">{Math.round(item.percentage)}%</span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className={`progress-bar-fill ${barColor(item.percentage, item.isOver)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default BudgetHealthList;

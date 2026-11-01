import React from 'react';
import { CHART_COLORS } from './chartTheme';

export interface BreakdownItem {
  label: string;
  value: number;
  percentage?: number;
}

interface CategoryBreakdownChartProps {
  /** Items should be sorted largest-first. */
  items: BreakdownItem[];
  valueFormatter?: (value: number) => string;
  maxRows?: number;
}

/**
 * Distribution breakdown rendered as horizontal bars using a monochrome ramp
 * (largest value = lightest). Shows label, value and percentage.
 */
const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  items,
  valueFormatter,
  maxRows = 6,
}) => {
  const rows = items.slice(0, maxRows);
  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...rows.map((item) => item.value), 1);

  return (
    <ul className="space-y-3.5">
      {rows.map((item, index) => {
        const pct = item.percentage ?? (total > 0 ? (item.value / total) * 100 : 0);
        const width = Math.max(2, (item.value / max) * 100);
        const color = CHART_COLORS[Math.min(index, CHART_COLORS.length - 1)];
        return (
          <li key={item.label}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-foreground">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {valueFormatter ? valueFormatter(item.value) : item.value}
                <span className="ml-1.5 text-muted-foreground/70">{pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, background: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default CategoryBreakdownChart;

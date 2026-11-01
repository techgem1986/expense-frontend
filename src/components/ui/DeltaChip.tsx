import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type DeltaDirection = 'up' | 'down' | 'neutral';

interface DeltaChipProps {
  /** Formatted delta value, e.g. "12.4%". */
  value: string;
  /** Direction of the change. */
  direction: DeltaDirection;
  /** Optional comparison text, e.g. "vs last month". */
  comparison?: string;
  /**
   * When true a downward change is favorable (e.g. expenses falling).
   * Favorable changes render emerald, unfavorable changes render red.
   */
  invert?: boolean;
  className?: string;
}

/**
 * Compact, quiet delta indicator used in stat cards and card headers.
 * Favorable = emerald, unfavorable = red, neutral = muted. The direction is
 * always conveyed by an icon as well as colour.
 */
const DeltaChip: React.FC<DeltaChipProps> = ({
  value,
  direction,
  comparison,
  invert = false,
  className = '',
}) => {
  const favorable =
    direction === 'neutral' ? 'neutral' : invert ? direction === 'down' : direction === 'up';

  const toneClasses =
    favorable === 'neutral'
      ? 'bg-white/[0.06] text-muted-foreground'
      : favorable
        ? 'bg-success/10 text-success'
        : 'bg-danger/10 text-danger';

  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums ${toneClasses}`}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {value}
      </span>
      {comparison && <span className="text-xs text-muted-foreground">{comparison}</span>}
    </div>
  );
};

export default DeltaChip;

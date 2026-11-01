import React from 'react';
import DeltaChip, { DeltaDirection } from './DeltaChip';

export interface StatCardDelta {
  value: string;
  direction: DeltaDirection;
  comparison?: string;
  /** Set true when a downward change is favorable (e.g. expenses). */
  invert?: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: StatCardDelta;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Compact KPI stat card: small muted label, large high-contrast value and an
 * optional delta chip. The card itself is never coloured by the delta.
 */
const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, className = '' }) => (
  <div className={`rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {icon && (
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
      )}
    </div>
    <p className="kpi-value mt-2">{value}</p>
    {delta && (
      <DeltaChip
        value={delta.value}
        direction={delta.direction}
        comparison={delta.comparison}
        invert={delta.invert}
        className="mt-3"
      />
    )}
  </div>
);

export default StatCard;

import React from 'react';

export type StatusTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  /** Human readable status label. */
  status: string;
  /** Optional explicit tone; otherwise inferred from the status text. */
  tone?: StatusTone;
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success border-success/20',
  neutral: 'bg-white/[0.06] text-muted-foreground border-white/10',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-white/10 text-foreground border-white/15',
};

const dotClasses: Record<StatusTone, string> = {
  success: 'bg-success',
  neutral: 'bg-muted-foreground',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-foreground',
};

const inferTone = (status: string): StatusTone => {
  const s = status.toLowerCase();
  if (/(active|online|completed|resolved|income|inflow|paid|cleared|ok)/.test(s)) return 'success';
  if (/(snoozed|paused|away|warning|pending review|threshold|due soon)/.test(s)) return 'warning';
  if (/(escalated|failed|offline|over budget|exceeded|error|declined)/.test(s)) return 'danger';
  if (/(in queue|queue|pending|scheduled|neutral|new)/.test(s)) return 'neutral';
  return 'neutral';
};

/**
 * Compact pill badge pairing colour with a dot AND text so status is never
 * conveyed by colour alone.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, tone, className = '' }) => {
  const resolvedTone = tone ?? inferTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[resolvedTone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[resolvedTone]}`} aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusBadge;

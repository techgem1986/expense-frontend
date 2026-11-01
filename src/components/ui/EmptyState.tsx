import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Designed empty state used by every data-driven section. Short title, a
 * one-line explanation and an optional primary action — never fabricated data.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center ${className}`}
  >
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
      {icon ?? <Inbox className="h-4 w-4" aria-hidden="true" />}
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;

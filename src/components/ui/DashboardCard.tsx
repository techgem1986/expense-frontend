import React from 'react';

export interface DashboardCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Flat bordered card with a title/description block top-left and an optional
 * action top-right. Content fills the remaining width. Cards are never nested.
 */
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = '',
}) => (
  <section
    className={`flex flex-col rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}
  >
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-desc">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
    <div className={`mt-4 flex-1 ${bodyClassName}`}>{children}</div>
  </section>
);

export default DashboardCard;

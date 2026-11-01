import React from 'react';

export interface PageHeaderProps {
  breadcrumb?: string[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Breadcrumb-style page header: small muted breadcrumb, prominent (but not
 * oversized) title, optional one-line description, right-aligned actions that
 * wrap below the title on mobile.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumb,
  title,
  description,
  actions,
  className = '',
}) => (
  <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
    <div className="min-w-0">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              <span>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;

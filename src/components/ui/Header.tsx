import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

/**
 * Shared page header used across the app screens. Renders a quiet, dark-first
 * title block (title + one-line muted description) with right-aligned actions.
 * The dashboard uses the richer <PageHeader /> component instead.
 */
const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Live sync
        </span>
        {action}
      </div>
    </div>
  );
};

export default Header;

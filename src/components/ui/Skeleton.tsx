import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Generic shimmering block. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

/** Skeleton matching the dimensions of a KPI stat card. */
export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 md:p-5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-3 h-7 w-28" />
    <Skeleton className="mt-3 h-4 w-36" />
  </div>
);

/** Skeleton matching the dimensions of a chart card. */
export const ChartCardSkeleton: React.FC<{ className?: string; height?: number }> = ({
  className = '',
  height = 240,
}) => (
  <div className={`rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}>
    <Skeleton className="h-4 w-40" />
    <Skeleton className="mt-2 h-3 w-56" />
    <Skeleton className="mt-4 w-full" style={{ height }} />
  </div>
);

/** Skeleton for a list card (e.g. activity feed / budget health). */
export const ListCardSkeleton: React.FC<{ className?: string; rows?: number }> = ({
  className = '',
  rows = 5,
}) => (
  <div className={`rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mt-2 h-3 w-44" />
    <div className="mt-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

/** Skeleton for a data table card. */
export const TableCardSkeleton: React.FC<{ className?: string; rows?: number }> = ({
  className = '',
  rows = 5,
}) => (
  <div className={`rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}>
    <Skeleton className="h-4 w-40" />
    <Skeleton className="mt-2 h-3 w-52" />
    <div className="mt-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  </div>
);

export default Skeleton;

import React from 'react';

export interface ActivityItem {
  id: string | number;
  message: string;
  timestamp: string | Date;
  icon?: React.ReactNode;
  href?: string;
}

const formatRelativeTime = (input: string | Date): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return '';
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface ActivityFeedProps {
  items: ActivityItem[];
  max?: number;
}

/**
 * Divided list of short operational events with relative timestamps, newest
 * first. No large icons or colourful event blocks.
 */
const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, max = 8 }) => {
  const sorted = [...items]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, max);

  return (
    <ul className="divide-y divide-border">
      {sorted.map((item) => {
        const body = (
          <div className="flex items-start gap-3 py-3">
            {item.icon && (
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-muted-foreground"
                aria-hidden="true"
              >
                {item.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{item.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </div>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <a
                href={item.href}
                className="-mx-2 block rounded-md px-2 transition-colors duration-150 hover:bg-white/[0.03]"
              >
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ActivityFeed;

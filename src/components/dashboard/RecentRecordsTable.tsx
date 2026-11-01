import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge, { StatusTone } from '../ui/StatusBadge';

export interface RecentRecord {
  id: string | number;
  /** Customer, account or record name. */
  primaryLabel: string;
  /** Short description / topic. */
  secondaryLabel?: string;
  /** Channel, type or category. */
  category?: string;
  /** Wait time, age or relevant timing. */
  timeMetric?: string;
  status?: string;
  statusTone?: StatusTone;
  /** Optional detail-page link. */
  href?: string;
}

interface RecentRecordsTableProps {
  records: RecentRecord[];
}

/**
 * Compact recent-records table: primary entity, topic, category, time metric
 * and a status badge. Lower-priority columns collapse on small screens.
 */
const RecentRecordsTable: React.FC<RecentRecordsTableProps> = ({ records }) => (
  <div className="-mx-4 overflow-x-auto md:mx-0">
    <table className="w-full min-w-[520px] text-sm md:min-w-0">
      <thead>
        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
          <th scope="col" className="px-4 py-2 font-medium md:px-0">
            Record
          </th>
          <th scope="col" className="px-4 py-2 font-medium md:px-0">
            Topic
          </th>
          <th scope="col" className="hidden px-4 py-2 font-medium md:table-cell md:px-0">
            Category
          </th>
          <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell md:px-0">
            Time
          </th>
          <th scope="col" className="px-4 py-2 text-right font-medium md:px-0">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {records.map((record) => (
          <tr key={record.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
            <td className="max-w-[160px] truncate px-4 py-3 font-medium text-foreground md:px-0">
              {record.href ? (
                <Link to={record.href} className="hover:underline">
                  {record.primaryLabel}
                </Link>
              ) : (
                record.primaryLabel
              )}
            </td>
            <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground md:px-0">
              {record.secondaryLabel || '—'}
            </td>
            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell md:px-0">
              {record.category || '—'}
            </td>
            <td className="hidden whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground sm:table-cell md:px-0">
              {record.timeMetric || '—'}
            </td>
            <td className="px-4 py-3 text-right md:px-0">
              {record.status ? (
                <StatusBadge status={record.status} tone={record.statusTone} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RecentRecordsTable;

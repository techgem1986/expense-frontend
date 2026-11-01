import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AXIS_TICK,
  GRID_STROKE,
  tooltipCursor,
  tooltipLabelStyle,
  tooltipStyle,
} from './chartTheme';

export interface VolumePoint {
  date: string;
  value: number;
}

interface VolumeAreaChartProps {
  data: VolumePoint[];
  height?: number;
  /** Formats values in the tooltip and (optionally) on the Y axis. */
  valueFormatter?: (value: number) => string;
  /** Formats the Y-axis ticks; falls back to valueFormatter. */
  yTickFormatter?: (value: number) => string;
  gradientId?: string;
}

/**
 * Time-series volume metric rendered as a soft, monochrome area chart.
 * Dates on the X axis, counts on the Y axis, minimal gridlines.
 */
const VolumeAreaChart: React.FC<VolumeAreaChartProps> = ({
  data,
  height = 260,
  valueFormatter,
  yTickFormatter,
  gradientId = 'volumeAreaFill',
}) => {
  const formatValue = (value: number) => (valueFormatter ? valueFormatter(value) : String(value));
  const formatTick = (value: number) =>
    yTickFormatter ? yTickFormatter(value) : formatValue(value);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e5e5e5" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#e5e5e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value) => formatTick(Number(value))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={tooltipCursor}
            formatter={(value) => [formatValue(Number(value)), 'Total']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#e5e5e5"
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeAreaChart;

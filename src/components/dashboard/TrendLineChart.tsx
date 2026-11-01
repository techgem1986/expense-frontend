import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, tooltipCursor, tooltipLabelStyle, tooltipStyle } from './chartTheme';

export interface TrendPoint {
  date: string;
  value: number;
}

interface TrendLineChartProps {
  data: TrendPoint[];
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Render a small label above each point (useful for few data points). */
  showLabels?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const renderPointLabel = (valueFormatter?: (value: number) => string) => (props: any) => {
  const { x, y, value } = props;
  if (x == null || y == null) return null;
  const text = valueFormatter ? valueFormatter(Number(value)) : String(value);
  return (
    <text
      x={x}
      y={y - 10}
      fill="#a1a1a1"
      fontSize={11}
      textAnchor="middle"
      className="tabular-nums"
    >
      {text}
    </text>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Thin, neutral line/area trend for a continuous metric (e.g. monthly net
 * flow). Avoids data labels unless explicitly requested.
 */
const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  height = 220,
  valueFormatter,
  showLabels = false,
}) => {
  const formatValue = (value: number) => (valueFormatter ? valueFormatter(value) : String(value));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: showLabels ? 24 : 12, right: 12, left: -12, bottom: 0 }}
        >
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value) => formatValue(Number(value))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={tooltipCursor}
            formatter={(value) => [formatValue(Number(value)), 'Value']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#e5e5e5"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#e5e5e5', stroke: '#111111', strokeWidth: 1.5 }}
            activeDot={{ r: 4, fill: '#fafafa', stroke: '#111111', strokeWidth: 1.5 }}
            label={showLabels ? (renderPointLabel(valueFormatter) as any) : undefined}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLineChart;

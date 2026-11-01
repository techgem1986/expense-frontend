import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AXIS_TICK,
  CHART_COLORS,
  tooltipCursor,
  tooltipLabelStyle,
  tooltipStyle,
} from './chartTheme';

export interface ResponseSeries {
  /** Key in each data point. */
  key: string;
  /** Legend label. */
  label: string;
}

export interface ResponsePoint {
  date: string;
  [seriesKey: string]: number | string;
}

interface ResponseBarsChartProps {
  data: ResponsePoint[];
  series: ResponseSeries[];
  height?: number;
  valueFormatter?: (value: number) => string;
}

/**
 * Stacked, slim bars with a restrained monochrome ramp — used for per-day
 * counts broken down by category. Legend is shown only when there is more than
 * one series.
 */
const ResponseBarsChart: React.FC<ResponseBarsChartProps> = ({
  data,
  series,
  height = 220,
  valueFormatter,
}) => {
  const formatValue = (value: number) => (valueFormatter ? valueFormatter(value) : String(value));

  return (
    <div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            barCategoryGap="28%"
          >
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              minTickGap={12}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(value) => formatValue(Number(value))}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={tooltipCursor}
              formatter={(value, name) => [formatValue(Number(value)), name]}
            />
            {series.map((s, index) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="stack"
                fill={CHART_COLORS[Math.min(index, CHART_COLORS.length - 1)]}
                radius={index === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {series.length > 1 && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {series.map((s, index) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: CHART_COLORS[Math.min(index, CHART_COLORS.length - 1)] }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResponseBarsChart;

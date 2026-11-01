import type { CSSProperties } from 'react';

/**
 * Shared, calm monochrome chart palette. Largest values are lightest so the
 * most important series reads first against the near-black canvas.
 */
export const CHART_COLORS = ['#e5e5e5', '#b8b8b8', '#8f8f8f', '#666666', '#404040'];

export const AXIS_TICK = { fill: '#8a8a8a', fontSize: 11 } as const;

export const GRID_STROKE = 'rgba(255, 255, 255, 0.06)';

export const tooltipStyle: CSSProperties = {
  background: '#111111',
  border: '1px solid #242424',
  borderRadius: 10,
  color: '#fafafa',
  fontSize: 12,
  padding: '6px 10px',
  boxShadow: 'none',
};

export const tooltipLabelStyle: CSSProperties = {
  color: '#a1a1a1',
  fontSize: 11,
  marginBottom: 2,
};

export const tooltipCursor = { stroke: '#3a3a3a', strokeWidth: 1 } as const;

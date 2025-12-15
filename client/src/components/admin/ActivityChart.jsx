import React from 'react';

// Simple SVG bar chart component
// Props: data = [{ label: '...', value: number }], height (px), color
const ActivityChart = ({ data = [], height = 160, color = '#16a34a' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-green-300">No data</div>
    );
  }

  const max = Math.max(...data.map(d => d.value), 1);
  const padding = 24;
  const barWidth = Math.max(8, Math.floor((300 - padding) / data.length));

  return (
    <div className="w-full">
      <svg className="w-full" viewBox={`0 0 300 ${height}`} preserveAspectRatio="none" style={{height}}>
        {data.map((d, i) => {
          const x = padding / 2 + i * barWidth + i * 6;
          const h = (d.value / max) * (height - 40);
          const y = height - h - 20;
          return (
            <g key={d.label + i}>
              <rect x={x} y={y} width={barWidth} height={h} rx="4" fill={color} opacity="0.9" />
              <text x={x + barWidth / 2} y={height - 6} fontSize="10" fill="#9ae6b4" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-end gap-4 text-sm text-green-300">
        <div className="text-xs">Max: {max}</div>
      </div>
    </div>
  );
};

export default ActivityChart;

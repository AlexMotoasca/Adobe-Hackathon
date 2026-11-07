/**
 * Ventriloc Radar Chart Component
 * Mathematical SVG diamond radar comparing Attention, Clarity, Credibility, and Purchase Intent.
 */

export function renderRadarChart(metrics, size = 260) {
  const center = size / 2;
  const maxRadius = size * 0.38;

  // 4 Axes: Top = Attention, Right = Clarity, Bottom = Credibility, Left = Purchase Intent
  const axes = [
    { label: 'Attention', value: metrics.attention || 0, angle: -Math.PI / 2, xOff: 0, yOff: -14 },
    { label: 'Clarity', value: metrics.clarity || 0, angle: 0, xOff: 12, yOff: 4 },
    { label: 'Credibility', value: metrics.credibility || 0, angle: Math.PI / 2, xOff: 0, yOff: 18 },
    { label: 'Purchase Intent', value: metrics.purchaseIntent || 0, angle: Math.PI, xOff: -12, yOff: 4 }
  ];

  // Grid concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = levels.map(level => {
    const points = axes.map(axis => {
      const r = maxRadius * level;
      const x = center + r * Math.cos(axis.angle);
      const y = center + r * Math.sin(axis.angle);
      return `${x},${y}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#e8e8e8" stroke-width="1" />`;
  }).join('');

  // Axis lines
  const axisLines = axes.map(axis => {
    const x = center + maxRadius * Math.cos(axis.angle);
    const y = center + maxRadius * Math.sin(axis.angle);
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e8e8e8" stroke-width="1" />`;
  }).join('');

  // Data Polygon points (scaled / 10)
  const dataPoints = axes.map(axis => {
    const scoreFraction = Math.min(Math.max(axis.value, 0), 10) / 10;
    const r = maxRadius * scoreFraction;
    const x = center + r * Math.cos(axis.angle);
    const y = center + r * Math.sin(axis.angle);
    return { x, y, value: axis.value };
  });

  const polygonCoordStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Labels and Values
  const labelsHtml = axes.map((axis, i) => {
    const x = center + (maxRadius + 22) * Math.cos(axis.angle) + axis.xOff;
    const y = center + (maxRadius + 22) * Math.sin(axis.angle) + axis.yOff;
    const anchor = axis.angle === 0 ? 'start' : axis.angle === Math.PI ? 'end' : 'middle';
    return `
      <text x="${x}" y="${y}" font-family="'Space Grotesk', sans-serif" font-size="11" fill="#202020" text-anchor="${anchor}" letter-spacing="-0.01em">
        ${axis.label} <tspan font-family="'Inter', sans-serif" fill="#ff682c" font-weight="600">${axis.value}/10</tspan>
      </text>
    `;
  }).join('');

  // Highlight points
  const pointsHtml = dataPoints.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#202020" stroke="#ff682c" stroke-width="1.5" />
  `).join('');

  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Concentric Grids -->
        ${gridPolygons}
        <!-- Radial Axes -->
        ${axisLines}
        <!-- Data Polygon Fill & Stroke -->
        <polygon points="${polygonCoordStr}" fill="rgba(255, 104, 44, 0.12)" stroke="#202020" stroke-width="1.5" />
        <!-- Data Dots -->
        ${pointsHtml}
        <!-- Labels -->
        ${labelsHtml}
      </svg>
    </div>
  `;
}

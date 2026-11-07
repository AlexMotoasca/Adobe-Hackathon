/**
 * Ventriloc Circular Score Gauge Component
 * Pure SVG, mathematically exact circular gauge with ember accent stroke.
 */

export function renderScoreGauge(score, max = 100, size = 80, strokeWidth = 5) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (normalizedScore / max) * circumference;

  let strokeColor = '#202020';
  let accentColor = '#816729'; // Brass
  if (normalizedScore < 60) {
    accentColor = '#ff682c'; // Ember Orange for high risk
  } else if (normalizedScore >= 80) {
    accentColor = '#2d6a4f'; // Olive / Emerald for scale
  }

  return `
    <div class="score-circle-container" style="width: ${size}px; height: ${size}px;">
      <svg class="score-circle-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Background Track -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="#efefef"
          stroke-width="${strokeWidth}"
          fill="transparent"
        />
        <!-- Progress Ring -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${accentColor}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="square"
          fill="transparent"
          style="transition: stroke-dashoffset 0.6s ease;"
        />
      </svg>
      <div style="position: absolute; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <span style="font-family: var(--font-polysans); font-size: ${size * 0.28}px; font-weight: 400; color: #202020; letter-spacing: -0.02em; line-height: 1;">${normalizedScore}</span>
        <span style="font-family: var(--font-inter); font-size: 9px; color: #828282; margin-top: 2px;">/ 100</span>
      </div>
    </div>
  `;
}

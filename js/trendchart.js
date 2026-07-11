/*-- A smooth SVG line chart visualizes today's and upcoming temperatures using real forecast data. 
It replaces a basic forecast list with a precise, interpolated temperature curve, highlighting the 
current temperature for a more informative display. --*/

const WIDTH = 640;
const HEIGHT = 160;
const PAD_X = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 16;

export function renderTrendChart(container, points) {
  // points: [{ label, value }] — first point is "Now"
  if (!points.length) {
    container.innerHTML = "";
    return;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = (WIDTH - PAD_X * 2) / (points.length - 1 || 1);
  const coords = points.map((p, i) => {
    const x = PAD_X + i * stepX;
    const y =
      PAD_TOP + (1 - (p.value - min) / range) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
    return { x, y, value: p.value };
  });

  const linePath = smoothPath(coords);
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${HEIGHT - PAD_BOTTOM} L${coords[0].x},${HEIGHT - PAD_BOTTOM} Z`;

  const dots = coords
    .map(
      (c, i) => `
      <circle class="chart-card__dot" cx="${c.x}" cy="${c.y}" r="${i === 0 ? 4.5 : 3}"
        fill="${i === 0 ? "var(--accent)" : "var(--surface)"}"
        stroke="var(--accent)" stroke-width="2"
        style="animation-delay:${0.5 + i * 0.06}s" />`,
    )
    .join("");

  container.innerHTML = `
    <svg class="chart-card__svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" role="img" aria-label="Temperature trend">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="chart-card__area" d="${areaPath}" fill="url(#trendFill)" stroke="none" />
      <path class="chart-card__path" d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
      ${dots}
    </svg>`;
}

// Catmull-Rom to cubic-bezier conversion for a smooth, non-jagged curve.
function smoothPath(coords) {
  if (coords.length < 2) return `M${coords[0].x},${coords[0].y}`;
  let d = `M${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] || coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

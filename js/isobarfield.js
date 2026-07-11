/*--The wavy background lines are isobars (lines connecting areas with the same air pressure). 
Their shape and spacing are generated using real weather data from the selected location,
 changing based on the area's air pressure and wind speed rather than being just decorative.--*/

const NUM_LINES = 7;
const WIDTH = 1200;
const HEIGHT = 800;

export function mountIsobarField(container) {
  container.innerHTML = `
    <svg class="isobar-field-svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="var(--ink-soft)" fill="none" stroke-width="1"></g>
    </svg>`;
  drawIsobars(container, { pressure: 1015, windSpeed: 3 });
}

export function drawIsobars(container, { pressure, windSpeed }) {
  const g = container.querySelector("g");
  if (!g) return;

  //  Normal sea-level pressure is about 1013 hPa. Lower pressure (stormy weather) creates tighter,
  //   more curved isobars, while stronger winds make the lines appear to drift more noticeably.

  const amplitude = clamp(40 + (1013 - pressure) * 3, 18, 90);
  const spacing = HEIGHT / (NUM_LINES + 1);

  let paths = "";
  for (let i = 1; i <= NUM_LINES; i++) {
    const yBase = spacing * i;
    const phase = i * 0.6;
    paths += `<path d="${wavePath(yBase, amplitude, phase)}" opacity="${0.15 + (i % 3) * 0.08}" />`;
  }
  g.innerHTML = paths;

  // Faster drift for higher wind speed, applied via animation-duration.
  const duration = clamp(90 - windSpeed * 4, 24, 90);
  container.querySelectorAll("path").forEach((p, idx) => {
    p.style.animationDuration = `${duration + idx * 4}s`;
  });
}

function wavePath(yBase, amplitude, phase) {
  const points = [];
  const step = WIDTH / 8;
  for (let x = -step; x <= WIDTH + step * 2; x += step) {
    const y = yBase + Math.sin(x / 220 + phase) * amplitude;
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

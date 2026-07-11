/*-- The app chooses a highlight color based on the current weather. Storms and extreme
 heat use warning colors, rain and clouds use muted gray-blue, and clear skies use bright 
 blue, ensuring the accent reflects real weather conditions rather than just decoration. --*/

export function resolveAccent({ conditionCode, tempC, windSpeed }) {
  // Thunderstorms (2xx) or very high wind -> danger red.
  if (conditionCode >= 200 && conditionCode < 300) return "var(--danger)";
  if (windSpeed >= 17) return "var(--danger)"; // ~ gale force, m/s

  // Extreme heat -> amber warning, regardless of sky condition.
  if (tempC >= 35) return "var(--warning)";

  // Clear sky.
  if (conditionCode === 800) return "var(--sky-clear)";

  // Rain, drizzle, snow, fog, cloud -> desaturated gray-blue.
  return "var(--sky-cloudy)";
}

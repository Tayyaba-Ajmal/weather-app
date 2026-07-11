// Maps OpenWeatherMap condition codes to a small hand-mapped icon set,
// drawn as restrained line art rather than generic flat/emoji weather icons.

const ICONS = {
  "clear-day": `<circle cx="28" cy="28" r="11"/><g><line x1="28" y1="4" x2="28" y2="12"/><line x1="28" y1="44" x2="28" y2="52"/><line x1="4" y1="28" x2="12" y2="28"/><line x1="44" y1="28" x2="52" y2="28"/><line x1="11" y1="11" x2="17" y2="17"/><line x1="39" y1="39" x2="45" y2="45"/><line x1="11" y1="45" x2="17" y2="39"/><line x1="39" y1="17" x2="45" y2="11"/></g>`,
  "clear-night": `<path d="M38 14a17 17 0 1 0 6 26 14 14 0 0 1-6-26z"/><circle cx="41" cy="18" r="1.2" fill="currentColor" stroke="none"/><circle cx="46" cy="26" r="0.9" fill="currentColor" stroke="none"/>`,
  "partly-cloudy": `<circle cx="20" cy="20" r="8"/><path d="M14 38h24a8 8 0 0 0 0-16 11 11 0 0 0-21-3 9 9 0 0 0-3 19z"/>`,
  cloudy: `<path d="M12 40h30a9 9 0 0 0 0-18 12 12 0 0 0-23-3 10 10 0 0 0-7 21z"/>`,
  rain: `<path d="M12 32h30a9 9 0 0 0 0-18 12 12 0 0 0-23-3 10 10 0 0 0-7 21z"/><line x1="18" y1="42" x2="15" y2="50"/><line x1="28" y1="42" x2="25" y2="50"/><line x1="38" y1="42" x2="35" y2="50"/>`,
  thunderstorm: `<path d="M12 30h30a9 9 0 0 0 0-18 12 12 0 0 0-23-3 10 10 0 0 0-7 21z"/><path d="M30 36l-7 11h7l-5 9"/>`,
  snow: `<path d="M12 32h30a9 9 0 0 0 0-18 12 12 0 0 0-23-3 10 10 0 0 0-7 21z"/><line x1="20" y1="42" x2="20" y2="50"/><line x1="16.5" y1="46" x2="23.5" y2="46"/><line x1="34" y1="42" x2="34" y2="50"/><line x1="30.5" y1="46" x2="37.5" y2="46"/>`,
  fog: `<line x1="10" y1="24" x2="34" y2="24"/><line x1="10" y1="32" x2="46" y2="32"/><line x1="16" y1="40" x2="42" y2="40"/>`,
  wind: `<path d="M6 20h28a6 6 0 1 0-5-9"/><path d="M6 30h36a6 6 0 1 1-5 9"/><path d="M6 40h20a5 5 0 1 1-4 8"/>`,
};

export function getIconId(code, iconStr) {
  const isNight = typeof iconStr === "string" && iconStr.endsWith("n");
  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return isNight ? "clear-night" : "clear-day";
  if (code === 801) return "partly-cloudy";
  if (code > 801 && code < 805) return "cloudy";
  return "cloudy";
}

export function iconMarkup(id) {
  return ICONS[id] || ICONS.cloudy;
}

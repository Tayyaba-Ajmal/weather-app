//  Data layer. Nothing in here touches the DOM — it only fetches and
//  shapes data. UI code never calls `fetch` directly.

const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const REVERSE_URL = "https://api.openweathermap.org/geo/1.0/reverse";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const KEY_STORAGE = "station.apiKey";

export function getApiKey() {
  return localStorage.getItem(KEY_STORAGE) || "Paste your OpenWeatherMap API key here";
}

export function setApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key.trim());
}

export function clearApiKey() {
  localStorage.removeItem(KEY_STORAGE);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(url, params) {
  const key = getApiKey();
  if (!key) throw new ApiError("missing-key", 401);

  const qs = new URLSearchParams({ ...params, appid: key });
  const res = await fetch(`${url}?${qs.toString()}`);

  if (res.status === 401) throw new ApiError("invalid-key", 401);
  if (res.status === 404) throw new ApiError("not-found", 404);
  if (!res.ok) throw new ApiError("network", res.status);

  return res.json();
}

// Resolves a free-text place name to candidate locations.
export async function geocode(query) {
  if (!query.trim()) return [];
  const results = await request(GEOCODE_URL, { q: query, limit: 5 });
  return results.map((r) => ({
    name: r.name,
    state: r.state || "",
    country: r.country,
    lat: r.lat,
    lon: r.lon,
  }));
}

// Resolves coordinates (e.g. from geolocation) back to a place name.
export async function reverseGeocode(lat, lon) {
  const results = await request(REVERSE_URL, { lat, lon, limit: 1 });
  if (!results.length)
    return { name: "Current position", country: "", lat, lon };
  const r = results[0];
  return { name: r.name, state: r.state || "", country: r.country, lat, lon };
}

export async function getCurrentWeather(lat, lon, units) {
  const data = await request(WEATHER_URL, { lat, lon, units });
  return {
    tempC:
      units === "metric" ? data.main.temp : ((data.main.temp - 32) * 5) / 9,
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    visibility: data.visibility,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezoneOffset: data.timezone,
    conditionCode: data.weather[0].id,
    conditionLabel: data.weather[0].description,
    icon: data.weather[0].icon,
  };
}

// Groups the 3-hour forecast into one representative entry per day.
export async function getForecast(lat, lon, units) {
  const data = await request(FORECAST_URL, { lat, lon, units });
  const byDay = new Map();

  for (const entry of data.list) {
    const day = entry.dt_txt.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(entry);
  }

  return Array.from(byDay.entries())
    .slice(0, 5)
    .map(([day, entries]) => {
      const temps = entries.map((e) => e.main.temp);
      const midday =
        entries.find((e) => e.dt_txt.includes("12:00:00")) ||
        entries[Math.floor(entries.length / 2)];
      return {
        date: day,
        high: Math.max(...temps),
        low: Math.min(...temps),
        conditionCode: midday.weather[0].id,
        icon: midday.weather[0].icon,
      };
    });
}

export { ApiError };

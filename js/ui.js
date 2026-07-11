import { getIconId, iconMarkup } from "./icons.js";
import { renderTrendChart } from "./trendChart.js";
import { resolveAccent } from "./weatherTheme.js";
import { skyGradient } from "./skyGradient.js";

const el = (id) => document.getElementById(id);

const UNIT_SYMBOLS = { metric: "°C", imperial: "°F" };
const SPEED_UNIT = { metric: "m/s", imperial: "mph" };

export function showMessage(text, tone = "info") {
  const node = el("message");
  node.textContent = text;
  node.dataset.tone = tone;
}

export function clearMessage() {
  showMessage("", "info");
}

export function showSkeleton() {
  el("skeleton").hidden = false;
  el("weatherView").hidden = true;
}

export function hideSkeleton() {
  el("skeleton").hidden = true;
}

export function renderWeather(current, forecast, place, units) {
  el("weatherView").hidden = false;

  const symbol = UNIT_SYMBOLS[units];
  el("tempValue").textContent = `${Math.round(current.temp)}°`;
  el("feelsLike").textContent =
    `Feels like ${Math.round(current.feelsLike)}${symbol}`;
  el("conditionLabel").textContent = capitalize(current.conditionLabel);
  el("placeLabel").textContent = formatPlace(place);

  el("readoutHumidity").textContent = `${current.humidity}%`;
  el("readoutPressure").textContent = `${current.pressure} hPa`;
  el("readoutWind").textContent =
    `${Math.round(current.windSpeed)} ${SPEED_UNIT[units]} ${compass(current.windDeg)}`;
  el("readoutVisibility").textContent =
    `${(current.visibility / 1000).toFixed(1)} km`;
  el("readoutSunrise").textContent = formatTime(
    current.sunrise,
    current.timezoneOffset,
  );
  el("readoutSunset").textContent = formatTime(
    current.sunset,
    current.timezoneOffset,
  );

  const iconId = getIconId(current.conditionCode, current.icon);
  el("conditionIcon").innerHTML = iconMarkup(iconId);

  document.documentElement.style.setProperty(
    "--accent",
    resolveAccent({
      conditionCode: current.conditionCode,
      tempC: current.tempC,
      windSpeed: current.windSpeed,
    }),
  );

  const nowUnix = Math.floor(Date.now() / 1000);
  document.documentElement.style.setProperty(
    "--sky-gradient",
    skyGradient(nowUnix, current.timezoneOffset),
  );

  renderTrend(current, forecast, units);
  renderForecast(forecast, units);
}

function renderTrend(current, forecast, units) {
  const points = [{ label: "Now", value: current.temp }];
  forecast.forEach((day) => {
    const weekday = new Date(`${day.date}T12:00:00`).toLocaleDateString(
      undefined,
      { weekday: "short" },
    );
    points.push({ label: weekday, value: (day.high + day.low) / 2 });
  });

  renderTrendChart(el("trendChart"), points);

  const values = points.map((p) => p.value);
  const symbol = UNIT_SYMBOLS[units];
  el("chartRange").textContent =
    `${Math.round(Math.min(...values))}° – ${Math.round(Math.max(...values))}${symbol}`;

  el("trendLabels").innerHTML = points
    .map((p) => `<span class="chart-card__label">${p.label}</span>`)
    .join("");
}

function renderForecast(days, units) {
  const row = el("forecastRow");
  const symbol = UNIT_SYMBOLS[units];

  row.innerHTML = days
    .map((day) => {
      const iconId = getIconId(day.conditionCode, day.icon);
      const weekday = new Date(`${day.date}T12:00:00`).toLocaleDateString(
        undefined,
        { weekday: "short" },
      );
      return `
        <div class="forecast-card">
          <div class="forecast-card__day">${weekday}</div>
          <svg class="icon forecast-card__icon" viewBox="0 0 56 56" aria-hidden="true">${iconMarkup(iconId)}</svg>
          <div class="forecast-card__range">${Math.round(day.high)}° <span class="forecast-card__low">${Math.round(day.low)}${symbol[1]}</span></div>
        </div>`;
    })
    .join("");
}

export function renderSuggestions(items, onSelect) {
  const box = el("suggestions");
  if (!items.length) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  box.hidden = false;
  box.innerHTML = items
    .map(
      (item, i) =>
        `<button type="button" class="suggestions__item" data-index="${i}">${formatPlace(item)}</button>`,
    )
    .join("");
  box.querySelectorAll("button").forEach((btn, i) => {
    btn.addEventListener("click", () => onSelect(items[i]));
  });
}

export function hideSuggestions() {
  const box = el("suggestions");
  box.hidden = true;
  box.innerHTML = "";
}

export function renderRecent(places, onSelect) {
  const box = el("recentList");
  if (!places.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = places
    .map((p, i) => `<button type="button" data-index="${i}">${p.name}</button>`)
    .join("");
  box.querySelectorAll("button").forEach((btn, i) => {
    btn.addEventListener("click", () => onSelect(places[i]));
  });
}

export function setUnitButtons(units) {
  document.querySelectorAll("#unitToggle button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.unit === units));
  });
}

export function setCityInputValue(value) {
  el("cityInput").value = value;
}

export function showApiKeyModal(message = "") {
  el("apiKeyModal").hidden = false;
  el("apiKeyMessage").textContent = message;
  el("apiKeyInput").focus();
}

export function hideApiKeyModal() {
  el("apiKeyModal").hidden = true;
}

function formatPlace(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(", ");
}

function formatTime(unixSeconds, tzOffsetSeconds) {
  const date = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  return date.toUTCString().slice(17, 22);
}

function compass(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

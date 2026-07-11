import * as api from "./api.js";
import * as state from "./state.js";
import * as ui from "./ui.js";

let units = state.getUnits();
ui.setUnitButtons(units);

let debounceHandle = null;
let lastPlace = null;
let suggestionCache = [];

ui.renderRecent(state.getRecent(), selectPlace);

const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const locateBtn = document.getElementById("locateBtn");
const unitToggle = document.getElementById("unitToggle");
const changeKeyBtn = document.getElementById("changeKeyBtn");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const apiKeyInput = document.getElementById("apiKeyInput");

init();

function init() {
  if (!api.getApiKey()) {
    ui.showApiKeyModal();
  } else {
    ui.showMessage("Search a city to see current conditions.", "info");
  }
}

// ---- API key modal ----

saveKeyBtn.addEventListener("click", () => {
  const value = apiKeyInput.value.trim();
  if (!value) {
    document.getElementById("apiKeyMessage").textContent =
      "Enter a key to continue.";
    return;
  }
  api.setApiKey(value);
  ui.hideApiKeyModal();
  ui.showMessage("Key saved. Search a city to begin.", "info");
});

apiKeyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveKeyBtn.click();
  }
});

changeKeyBtn.addEventListener("click", () => {
  ui.showApiKeyModal();
});

// ---- Search input + suggestions ----

cityInput.addEventListener("input", () => {
  const query = cityInput.value.trim();
  clearTimeout(debounceHandle);
  if (!api.getApiKey()) return;
  if (query.length < 2) {
    ui.hideSuggestions();
    return;
  }
  debounceHandle = setTimeout(async () => {
    try {
      const results = await api.geocode(query);
      suggestionCache = results;
      ui.renderSuggestions(results, selectPlace);
    } catch (err) {
      handleApiError(err);
    }
  }, 350);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav__search")) ui.hideSuggestions();
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (suggestionCache.length) {
    selectPlace(suggestionCache[0]);
  } else {
    const query = cityInput.value.trim();
    if (!query) return;
    try {
      const results = await api.geocode(query);
      if (results.length) selectPlace(results[0]);
      else ui.showMessage(`No place found for "${query}".`, "error");
    } catch (err) {
      handleApiError(err);
    }
  }
});

// ---- Geolocation ----

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    ui.showMessage("Geolocation isn't available in this browser.", "error");
    return;
  }
  ui.showMessage("Locating…", "info");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const place = await api.reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        selectPlace(place);
      } catch (err) {
        handleApiError(err);
      }
    },
    () => ui.showMessage("Location permission was denied.", "error"),
    { timeout: 8000 },
  );
});

// ---- Units ----

unitToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-unit]");
  if (!btn) return;
  units = btn.dataset.unit;
  state.setUnits(units);
  ui.setUnitButtons(units);
  if (lastPlace) loadWeather(lastPlace);
});

// ---- Core flow ----

async function selectPlace(place) {
  ui.setCityInputValue(place.name);
  ui.hideSuggestions();
  state.pushRecent(place);
  ui.renderRecent(state.getRecent(), selectPlace);
  await loadWeather(place);
}

async function loadWeather(place) {
  lastPlace = place;
  ui.clearMessage();
  ui.showSkeleton();
  try {
    const [current, forecast] = await Promise.all([
      api.getCurrentWeather(place.lat, place.lon, units),
      api.getForecast(place.lat, place.lon, units),
    ]);
    ui.hideSkeleton();
    ui.renderWeather(current, forecast, place, units);
  } catch (err) {
    ui.hideSkeleton();
    handleApiError(err);
  }
}

function handleApiError(err) {
  if (err.message === "missing-key" || err.message === "invalid-key") {
    ui.showApiKeyModal(
      err.message === "invalid-key"
        ? "That key was rejected by OpenWeatherMap. Check it and try again."
        : "",
    );
    if (err.message === "invalid-key") api.clearApiKey();
    return;
  }
  if (err.message === "not-found") {
    ui.showMessage("No matching place was found.", "error");
    return;
  }
  ui.showMessage(
    "Something went wrong reaching the weather service. Try again shortly.",
    "error",
  );
}

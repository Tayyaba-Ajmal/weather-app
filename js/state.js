/*-- A simple state store lets UI components update when data changes without directly depending on each other.
 It's a lightweight solution, avoiding the complexity of Redux while keeping state management clean and organized.--*/

export class Store {
  constructor(initial) {
    this.state = initial;
    this.listeners = new Set();
  }

  get() {
    return this.state;
  }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn(this.state));
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

const UNITS_KEY = "station.units";
const RECENT_KEY = "station.recent";
const MAX_RECENT = 6;

export function getUnits() {
  return localStorage.getItem(UNITS_KEY) || "metric";
}

export function setUnits(units) {
  localStorage.setItem(UNITS_KEY, units);
}

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

export function pushRecent(place) {
  const existing = getRecent().filter(
    (p) => !(p.name === place.name && p.country === place.country),
  );
  const next = [place, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

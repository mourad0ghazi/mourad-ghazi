// ─────────────────────────────────────────────────────────────
// LifeOS – Constantes globales
// ─────────────────────────────────────────────────────────────

/** Clés localStorage */
export const STORAGE_KEYS = {
  v1State: 'lifeos:v1:state',
  settings: 'lifeos:v2:settings',
  dashboard: 'lifeos:v2:dashboard',
  finance: 'lifeos:v2:finance',
  personal: 'lifeos:v2:personal',
  chat: 'lifeos:v2:chat',
  lastBackup: 'lifeos:last-backup',
  manualBackup: 'lifeos:manual-backup',
  weatherCity: 'lifeos:weather-city',
} as const;

/** Durées d'animation (spec §2.5) */
export const ANIMATION_DURATIONS = {
  micro: 0.15, // hover
  short: 0.2, // UI
  medium: 0.3, // reveal
  long: 0.5, // page
  extra: 2, // compteurs
  stagger: 0.1,
} as const;

/** Breakpoints responsive (spec §2.6) */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

/** Configuration de la grille dashboard */
export const GRID_CONFIG = {
  cols: { lg: 12 },
  breakpoints: { lg: 1024 },
  rowHeight: { compact: 52, comfortable: 58, spacious: 68 },
  margin: { compact: [12, 12], comfortable: [16, 16], spacious: [22, 22] },
  stackedBelow: 1024, // px : en dessous, cartes empilées
} as const;

/** Villes météo prédéfinies (lat/lon) */
export const WEATHER_CITIES = [
  { id: 'auto', label: '📍 Auto', lat: 0, lon: 0 },
  { id: 'casablanca', label: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { id: 'paris', label: 'Paris', lat: 48.8566, lon: 2.3522 },
  { id: 'london', label: 'London', lat: 51.5074, lon: -0.1278 },
  { id: 'newyork', label: 'New York', lat: 40.7128, lon: -74.006 },
  { id: 'dubai', label: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { id: 'tokyo', label: 'Tokyo', lat: 35.6762, lon: 139.6503 },
] as const;

/** Couleurs des niveaux d'alerte budget */
export const BUDGET_LEVELS = {
  ok: 'ok',
  warning: 'warning',
  critical: 'critical',
} as const;

export const APP_VERSION = '2.1.0';

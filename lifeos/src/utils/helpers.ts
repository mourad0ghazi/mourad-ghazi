// ─────────────────────────────────────────────────────────────
// LifeOS – Utilitaires (dates, formats, ids, CSV, stockage)
// ─────────────────────────────────────────────────────────────

import type { DateFormat, Settings } from '../types';

export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const pad = (n: number): string => String(n).padStart(2, '0');

/** Date locale au format YYYY-MM-DD (sans UTC shift) */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Parse YYYY-MM-DD en Date locale (midi pour éviter les décalages) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

export function formatDate(
  iso: string | undefined,
  fmt: DateFormat = 'ddmmyyyy',
  locale: string = 'fr-FR',
): string {
  if (!iso) return '—';
  const d = parseISODate(iso);
  if (fmt === 'mmddyyyy') return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  if (fmt === 'yyyymmdd') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateLong(iso: string | undefined, locale: string = 'fr-FR'): string {
  if (!iso) return '—';
  try {
    return parseISODate(iso).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatMonthLabel(iso: string, locale: string = 'fr-FR'): string {
  const d = parseISODate(iso + '-01');
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

const currencies: Record<string, string> = {
  MAD: 'fr-MA',
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  CHF: 'de-CH',
  AED: 'en-AE',
  SAR: 'en-SA',
  TND: 'fr-TN',
  DZD: 'fr-DZ',
};

export function formatMoney(
  value: number,
  currency: string = 'MAD',
  opts: { compact?: boolean; sign?: boolean } = {},
): string {
  const locale = currencies[currency] || 'fr-FR';
  const sign = opts.sign && value > 0 ? '+' : '';
  try {
    if (opts.compact) {
      return (
        sign +
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(value)
      );
    }
    return (
      sign +
      new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
    );
  } catch {
    return `${sign}${value.toFixed(2)} ${currency}`;
  }
}

export function formatPct(value: number, sign = false): string {
  return `${sign && value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatTime(date: Date, timezone: string, locale = 'fr-FR'): string {
  try {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone });
  } catch {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }
}

export function formatClock(date: Date, timezone: string, locale = 'fr-FR'): string {
  try {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function percent(a: number, b: number): number {
  if (b <= 0) return 0;
  return Math.round((a / b) * 100);
}

export function dayDiff(fromIso: string, toIso: string): number {
  return Math.round((parseISODate(toIso).getTime() - parseISODate(fromIso).getTime()) / 86400000);
}

export function daysUntil(iso: string): number {
  return dayDiff(todayISO(), iso);
}

/** Convertit un tableau d'objets en CSV et déclenche le téléchargement */
export function downloadCSV(filename: string, rows: Record<string, string | number>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const STORAGE_KEY = 'lifeos:v1:state';

export function loadState<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    // Fusion superficielle pour tolérer les schémas plus anciens
    return { ...fallback, ...parsed } as T;
  } catch {
    return fallback;
  }
}

export function saveState(state: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* stockage plein ou indisponible : on ignore */
  }
}

/** Détecte le thème système */
export function systemPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function resolveTheme(mode: Settings['theme']): 'light' | 'dark' {
  if (mode === 'auto') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

export const ACCENTS: Record<string, { name: string; color: string; soft: string }> = {
  smoke: { name: 'Smoke', color: '#6c757d', soft: 'rgba(108,117,125,.14)' },
  graphite: { name: 'Graphite', color: '#343a40', soft: 'rgba(52,58,64,.14)' },
  sage: { name: 'Sage', color: '#5f7d6a', soft: 'rgba(95,125,106,.14)' },
  steel: { name: 'Steel', color: '#5b7388', soft: 'rgba(91,115,136,.14)' },
};

export const CURRENCIES = ['MAD', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'AED', 'SAR', 'TND', 'DZD'];

export const TIMEZONES = [
  'Africa/Casablanca',
  'Europe/Paris',
  'Europe/London',
  'America/New_York',
  'America/Toronto',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

/** Derniers N jours en ISO (aujourd'hui inclus) */
export function lastNDays(n: number, endISO = todayISO()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endISO, -i));
  return out;
}

export function firstOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

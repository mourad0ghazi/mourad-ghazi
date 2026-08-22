// ─────────────────────────────────────────────────────────────
// LifeOS – Validateurs légers
// ─────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function isValidAmount(value: string | number): boolean {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0;
}

export function isValidDateISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

export function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function sanitizeTag(tag: string): string {
  return tag.replace(/[#\s]/g, '').slice(0, 24);
}

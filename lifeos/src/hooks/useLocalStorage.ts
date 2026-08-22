// ─────────────────────────────────────────────────────────────
// LifeOS – useLocalStorage : état React synchronisé avec
// localStorage (JSON)
// ─────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* stockage indisponible */
        }
        return next;
      });
    },
    [key],
  );

  return [value, set];
}

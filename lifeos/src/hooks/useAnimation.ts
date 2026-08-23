// ─────────────────────────────────────────────────────────────
// LifeOS – useAnimation : respect des préférences d'animation
// (prefers-reduced-motion) + flag animations global
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

/** true si l'utilisateur demande des animations réduites (système) */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** true si les animations de LifeOS doivent être jouées */
export function useAnimationsEnabled(): boolean {
  const { state } = useApp();
  const reduced = usePrefersReducedMotion();
  return !reduced && state.settings.animations.page;
}

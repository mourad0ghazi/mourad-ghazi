// ─────────────────────────────────────────────────────────────
// LifeOS – Configuration de formatage globale (v2)
// Permet au panneau Paramètres d'influencer tous les formats
// sans prop drilling : masquage des montants, séparateur
// décimal, format horaire 12h/24h.
// ─────────────────────────────────────────────────────────────

export const formatConfig = {
  hideAmounts: false,
  decimalSep: ',' as ',' | '.',
  hour12: false,
};

export function setFormatConfig(patch: Partial<typeof formatConfig>) {
  Object.assign(formatConfig, patch);
}

/** Masque un montant si l'option "masquer les montants" est active */
export function applyMask(text: string): string {
  return formatConfig.hideAmounts ? '•••••' : text;
}

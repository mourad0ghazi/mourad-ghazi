// ─────────────────────────────────────────────────────────────
// LifeOS – Calculs financiers (v2)
// Intérêts composés, mensualité de prêt, règle de 72…
// ─────────────────────────────────────────────────────────────

export interface CompoundInput {
  initial: number;
  monthly: number;
  annualRatePct: number; // % par an
  years: number;
}

export interface CompoundYearPoint {
  year: number;
  value: number; // capital
  invested: number; // cumul des versements
  interest: number; // intérêts cumulés
}

/**
 * A = P(1+r/n)^(nt) + PMT × (((1+r/n)^(nt) − 1) / (r/n))
 * avec capitalisation mensuelle (n=12)
 */
export function calculateCompoundInterest(input: CompoundInput): CompoundYearPoint[] {
  const r = input.annualRatePct / 100 / 12;
  const months = input.years * 12;
  let capital = input.initial;
  let invested = input.initial;
  const pts: CompoundYearPoint[] = [];
  for (let m = 1; m <= months; m++) {
    capital = capital * (1 + r) + input.monthly;
    invested += input.monthly;
    if (m % 12 === 0) {
      pts.push({
        year: m / 12,
        value: Math.round(capital),
        invested: Math.round(invested),
        interest: Math.round(capital - invested),
      });
    }
  }
  return pts;
}

/** Mensualité : M = P × (r(1+r)^n) / ((1+r)^n − 1) */
export function calculateLoanPayment(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Règle de 72 : années pour doubler un capital à un taux donné */
export function calculateRule72(annualRatePct: number): number {
  return annualRatePct > 0 ? 72 / annualRatePct : Infinity;
}

/** Budget restant d'une catégorie */
export function calculateRemainingBudget(planned: number, spent: number): number {
  return planned - spent;
}

/** Date estimée d'atteinte d'un objectif d'épargne */
export function calculateGoalDate(saved: number, target: number, monthlyDeposit: number): Date | null {
  if (monthlyDeposit <= 0 || saved >= target) return null;
  const monthsNeeded = Math.ceil((target - saved) / monthlyDeposit);
  const d = new Date();
  d.setMonth(d.getMonth() + monthsNeeded);
  return d;
}

/** Taux d'utilisation d'un budget (0..100+) */
export function budgetUsagePct(planned: number, spent: number): number {
  if (planned <= 0) return spent > 0 ? 999 : 0;
  return Math.round((spent / planned) * 100);
}

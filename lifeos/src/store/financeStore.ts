// ─────────────────────────────────────────────────────────────
// LifeOS – Store finances (transactions, budget, épargne,
// investissements) + sélecteurs dérivés
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetCategory, Investment, SavingsGoal, Transaction } from '../types';
import { initialFinanceSlice } from '../data/initialData';
import { monthKey } from '../utils/helpers';
import { uid } from '../utils/helpers';

interface FinanceState {
  transactions: Transaction[];
  budget: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  investments: Investment[];
  // Transactions
  addTx: (tx: Omit<Transaction, 'id'>) => void;
  deleteTx: (id: string) => void;
  // Budget
  addBudgetCat: (c: Omit<BudgetCategory, 'id'>) => void;
  updateBudgetCat: (id: string, patch: Partial<BudgetCategory>) => void;
  deleteBudgetCat: (id: string) => void;
  // Épargne
  addSavingsGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  contributeSavings: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  // Investissements
  addInvestment: (i: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;
  resetFinance: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      ...initialFinanceSlice,
      addTx: (tx) => set((s) => ({ transactions: [...s.transactions, { ...tx, id: uid() }] })),
      deleteTx: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      addBudgetCat: (c) => set((s) => ({ budget: [...s.budget, { ...c, id: uid() }] })),
      updateBudgetCat: (id, patch) =>
        set((s) => ({ budget: s.budget.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteBudgetCat: (id) => set((s) => ({ budget: s.budget.filter((x) => x.id !== id) })),
      addSavingsGoal: (g) => set((s) => ({ savingsGoals: [...s.savingsGoals, { ...g, id: uid() }] })),
      contributeSavings: (id, amount) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((x) =>
            x.id === id ? { ...x, saved: Math.max(0, x.saved + amount) } : x,
          ),
        })),
      deleteSavingsGoal: (id) => set((s) => ({ savingsGoals: s.savingsGoals.filter((x) => x.id !== id) })),
      addInvestment: (i) => set((s) => ({ investments: [...s.investments, { ...i, id: uid() }] })),
      deleteInvestment: (id) => set((s) => ({ investments: s.investments.filter((x) => x.id !== id) })),
      resetFinance: () => set({ ...initialFinanceSlice }),
    }),
    { name: 'lifeos:v2:finance', version: 1 },
  ),
);

/* ── Sélecteurs dérivés ── */
export function selectMonthTotals(txs: Transaction[], month: string) {
  const monthTx = txs.filter((x) => monthKey(x.date) === month);
  return {
    revenue: monthTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0),
    expenses: monthTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
  };
}

export function selectSpentByCategory(txs: Transaction[], month: string): Map<string, number> {
  const map = new Map<string, number>();
  txs
    .filter((x) => x.type === 'expense' && monthKey(x.date) === month)
    .forEach((x) => map.set(x.category, (map.get(x.category) ?? 0) + x.amount));
  return map;
}

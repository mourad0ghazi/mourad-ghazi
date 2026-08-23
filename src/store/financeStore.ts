import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Budget, Investment, SavingsGoal, Transaction } from '../types'
import { initialBudgets, initialInvestments, initialSavingsGoals, initialTransactions } from '../data/initialData'

interface FinanceState {
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  addTransaction: (value: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  removeTransaction: (id: string) => void
  addBudget: (value: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, patch: Partial<Budget>) => void
  removeBudget: (id: string) => void
  addSavingsGoal: (value: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void
  removeSavingsGoal: (id: string) => void
  contributeSavings: (id: string, amount: number) => void
  addInvestment: (value: Omit<Investment, 'id'>) => void
  removeInvestment: (id: string) => void
  reset: () => void
}

export const useFinanceStore = create<FinanceState>()(persist((set) => ({
  transactions: initialTransactions, budgets: initialBudgets, savingsGoals: initialSavingsGoals, investments: initialInvestments,
  addTransaction: (value) => set((state) => ({ transactions: [{ ...value, id: crypto.randomUUID() }, ...state.transactions] })),
  updateTransaction: (id, patch) => set((state) => ({ transactions: state.transactions.map((item) => item.id === id ? { ...item, ...patch } : item) })),
  removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((item) => item.id !== id) })),
  addBudget: (value) => set((state) => ({ budgets: [...state.budgets, { ...value, id: crypto.randomUUID() }] })),
  updateBudget: (id, patch) => set((state) => ({ budgets: state.budgets.map((item) => item.id === id ? { ...item, ...patch } : item) })),
  removeBudget: (id) => set((state) => ({ budgets: state.budgets.filter((item) => item.id !== id) })),
  addSavingsGoal: (value) => set((state) => ({ savingsGoals: [...state.savingsGoals, { ...value, id: crypto.randomUUID() }] })),
  updateSavingsGoal: (id, patch) => set((state) => ({ savingsGoals: state.savingsGoals.map((goal) => goal.id === id ? { ...goal, ...patch } : goal) })),
  removeSavingsGoal: (id) => set((state) => ({ savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id) })),
  contributeSavings: (id, amount) => set((state) => ({ savingsGoals: state.savingsGoals.map((goal) => goal.id === id ? { ...goal, current: Math.max(0, Math.min(goal.target, goal.current + amount)) } : goal) })),
  addInvestment: (value) => set((state) => ({ investments: [...state.investments, { ...value, id: crypto.randomUUID() }] })),
  removeInvestment: (id) => set((state) => ({ investments: state.investments.filter((item) => item.id !== id) })),
  reset: () => set({ transactions: initialTransactions, budgets: initialBudgets, savingsGoals: initialSavingsGoals, investments: initialInvestments }),
}), { name: 'lifeos:v2:finance' }))

export const monthTransactions = (transactions: Transaction[], date = new Date()) => transactions.filter((item) => {
  const current = new Date(item.date + 'T12:00:00')
  return current.getMonth() === date.getMonth() && current.getFullYear() === date.getFullYear()
})

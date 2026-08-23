import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FinancePlanningProfile {
  situation: {
    netSalary: number
    otherIncome: number
    householdContribution: number
    householdSize: number
    dependents: number
    housingStatus: '' | 'tenant' | 'owner-loan' | 'owner' | 'family' | 'other'
    employmentStatus: '' | 'employee' | 'self-employed' | 'student' | 'retired' | 'unemployed' | 'other'
    incomeStability: '' | 'stable' | 'variable' | 'seasonal'
    payFrequency: '' | 'monthly' | 'weekly' | 'irregular'
  }
  essentials: {
    housing: number
    utilities: number
    groceries: number
    transport: number
    communications: number
    health: number
    insurance: number
    education: number
    debtPayments: number
    taxes: number
    familySupport: number
  }
  lifestyle: {
    restaurants: number
    shopping: number
    leisure: number
    subscriptions: number
    travel: number
    gifts: number
    personalCare: number
    cashWithdrawals: number
    other: number
    impulseFrequency: '' | 'never' | 'rarely' | 'sometimes' | 'often'
    spendingTrigger: '' | 'need' | 'comfort' | 'stress' | 'social' | 'promotions' | 'mixed'
    budgetMethod: '' | 'none' | 'notes' | 'spreadsheet' | 'envelopes' | 'application'
    reviewFrequency: '' | 'never' | 'daily' | 'weekly' | 'monthly'
  }
  goals: {
    primaryGoal: '' | 'emergency' | 'debt' | 'home' | 'vehicle' | 'education' | 'business' | 'travel' | 'retirement' | 'other'
    goalDetails: string
    targetAmount: number
    currentSavings: number
    targetDate: string
    emergencyMonths: number
    projectBudget: number
    downPayment: number
    financingMonths: number
    maxMonthlyPayment: number
    estimatedRate: number
    riskTolerance: '' | 'cautious' | 'balanced' | 'dynamic'
    priority: '' | 'security' | 'reduce-spending' | 'save' | 'invest' | 'finance-project'
    reduceCategory: string
    notes: string
  }
}

export const initialFinancePlanningProfile: FinancePlanningProfile = {
  situation: {
    netSalary: 0,
    otherIncome: 0,
    householdContribution: 0,
    householdSize: 1,
    dependents: 0,
    housingStatus: '',
    employmentStatus: '',
    incomeStability: '',
    payFrequency: '',
  },
  essentials: {
    housing: 0,
    utilities: 0,
    groceries: 0,
    transport: 0,
    communications: 0,
    health: 0,
    insurance: 0,
    education: 0,
    debtPayments: 0,
    taxes: 0,
    familySupport: 0,
  },
  lifestyle: {
    restaurants: 0,
    shopping: 0,
    leisure: 0,
    subscriptions: 0,
    travel: 0,
    gifts: 0,
    personalCare: 0,
    cashWithdrawals: 0,
    other: 0,
    impulseFrequency: '',
    spendingTrigger: '',
    budgetMethod: '',
    reviewFrequency: '',
  },
  goals: {
    primaryGoal: '',
    goalDetails: '',
    targetAmount: 0,
    currentSavings: 0,
    targetDate: '',
    emergencyMonths: 3,
    projectBudget: 0,
    downPayment: 0,
    financingMonths: 60,
    maxMonthlyPayment: 0,
    estimatedRate: 5,
    riskTolerance: '',
    priority: '',
    reduceCategory: '',
    notes: '',
  },
}

interface FinancePlanningState {
  profile: FinancePlanningProfile
  currentStep: number
  completedSteps: number[]
  updateSection: <K extends keyof FinancePlanningProfile>(section: K, patch: Partial<FinancePlanningProfile[K]>) => void
  setCurrentStep: (step: number) => void
  completeStep: (step: number) => void
  reset: () => void
}

export const useFinancePlanningStore = create<FinancePlanningState>()(persist((set) => ({
  profile: initialFinancePlanningProfile,
  currentStep: 0,
  completedSteps: [],
  updateSection: (section, patch) => set((state) => ({
    profile: { ...state.profile, [section]: { ...state.profile[section], ...patch } },
  })),
  setCurrentStep: (currentStep) => set({ currentStep: Math.max(0, Math.min(4, currentStep)) }),
  completeStep: (step) => set((state) => ({ completedSteps: [...new Set([...state.completedSteps, step])] })),
  reset: () => set({ profile: initialFinancePlanningProfile, currentStep: 0, completedSteps: [] }),
}), {
  name: 'lifeos:v2:finance-settings',
  version: 1,
  merge: (persisted, current) => {
    const previous = (persisted ?? {}) as Partial<FinancePlanningState>
    return {
      ...current,
      ...previous,
      profile: {
        situation: { ...current.profile.situation, ...previous.profile?.situation },
        essentials: { ...current.profile.essentials, ...previous.profile?.essentials },
        lifestyle: { ...current.profile.lifestyle, ...previous.profile?.lifestyle },
        goals: { ...current.profile.goals, ...previous.profile?.goals },
      },
    }
  },
}))

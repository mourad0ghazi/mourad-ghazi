import type { ModuleId } from './modules'

export type DashboardPresetId = 'essential' | 'productivity' | 'finance' | 'complete'

export interface DashboardPreset {
  id: DashboardPresetId
  label: string
  description: string
  modules: ModuleId[]
}

/**
 * Every suggestion deliberately contains every LifeOS module. The order is the
 * hierarchy: the layout engine turns the first three modules into the opening
 * row, then creates full two-card rows without leaving grid holes.
 */
export const dashboardPresets: DashboardPreset[] = [
  {
    id: 'essential',
    label: 'Équilibre quotidien',
    description: 'Le quotidien d’abord, avec les 17 modules organisés en vue équilibrée.',
    modules: ['clock', 'weather', 'pomodoro', 'tasks', 'calendar', 'goals', 'habits', 'notes', 'journal', 'finance', 'expenses', 'transactions', 'budget', 'savings', 'investments', 'simulator', 'loan'],
  },
  {
    id: 'productivity',
    label: 'Focus & organisation',
    description: 'Actions et routines en priorité, sans masquer les modules financiers.',
    modules: ['clock', 'pomodoro', 'weather', 'tasks', 'habits', 'calendar', 'goals', 'notes', 'journal', 'finance', 'budget', 'expenses', 'transactions', 'savings', 'investments', 'simulator', 'loan'],
  },
  {
    id: 'finance',
    label: 'Pilotage financier',
    description: 'Les indicateurs d’argent en tête, puis tous les outils personnels.',
    modules: ['clock', 'weather', 'pomodoro', 'finance', 'expenses', 'budget', 'transactions', 'savings', 'investments', 'simulator', 'loan', 'tasks', 'calendar', 'goals', 'habits', 'notes', 'journal'],
  },
  {
    id: 'complete',
    label: 'Vue exécutive',
    description: 'Une lecture panoramique moderne où chacun des 17 modules reste visible.',
    modules: ['clock', 'weather', 'goals', 'finance', 'tasks', 'expenses', 'calendar', 'budget', 'transactions', 'savings', 'investments', 'habits', 'pomodoro', 'notes', 'journal', 'simulator', 'loan'],
  },
]

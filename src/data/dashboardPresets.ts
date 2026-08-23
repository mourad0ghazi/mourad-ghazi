import type { ModuleId } from './modules'

export type DashboardPresetId = 'essential' | 'productivity' | 'finance' | 'complete'

export interface DashboardPreset {
  id: DashboardPresetId
  label: string
  description: string
  modules: ModuleId[]
}

export const dashboardPresets: DashboardPreset[] = [
  {
    id: 'essential',
    label: 'Essentiel',
    description: 'Une vue calme pour voir uniquement les priorités du jour.',
    modules: ['clock', 'tasks', 'calendar', 'goals', 'notes'],
  },
  {
    id: 'productivity',
    label: 'Productivité',
    description: 'Tâches, agenda, habitudes et concentration au premier plan.',
    modules: ['clock', 'pomodoro', 'tasks', 'calendar', 'habits', 'goals', 'notes', 'journal'],
  },
  {
    id: 'finance',
    label: 'Pilotage financier',
    description: 'Revenus, dépenses, budgets et patrimoine regroupés.',
    modules: ['clock', 'finance', 'expenses', 'transactions', 'budget', 'savings', 'investments', 'simulator'],
  },
  {
    id: 'complete',
    label: 'Vue complète',
    description: 'Tous les modules visibles pour un contrôle global de LifeOS.',
    modules: ['clock', 'weather', 'pomodoro', 'goals', 'finance', 'expenses', 'tasks', 'calendar', 'habits', 'budget', 'savings', 'investments', 'notes', 'journal', 'transactions', 'simulator', 'loan'],
  },
]

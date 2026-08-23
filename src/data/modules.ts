import { AlarmClock, CalendarDays, CheckSquare2, CircleDollarSign, CloudSun, Landmark, NotebookPen, PiggyBank, ReceiptText, Sparkles, Target, TimerReset, TrendingUp, WalletCards, Workflow, BarChart3, Calculator } from 'lucide-react'

export const modules = [
  { id: 'clock', label: 'Horloge', category: 'Personnel', icon: AlarmClock },
  { id: 'weather', label: 'Météo', category: 'Personnel', icon: CloudSun },
  { id: 'pomodoro', label: 'Pomodoro', category: 'Personnel', icon: TimerReset },
  { id: 'tasks', label: 'Tâches', category: 'Personnel', icon: CheckSquare2 },
  { id: 'notes', label: 'Notes', category: 'Personnel', icon: NotebookPen },
  { id: 'habits', label: 'Habitudes', category: 'Personnel', icon: Workflow },
  { id: 'journal', label: 'Journal', category: 'Personnel', icon: Sparkles },
  { id: 'goals', label: 'Objectifs', category: 'Personnel', icon: Target },
  { id: 'calendar', label: 'Calendrier', category: 'Personnel', icon: CalendarDays },
  { id: 'finance', label: 'Résumé financier', category: 'Finance', icon: CircleDollarSign },
  { id: 'expenses', label: 'Dépenses', category: 'Finance', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', category: 'Finance', icon: ReceiptText },
  { id: 'budget', label: 'Budget', category: 'Finance', icon: WalletCards },
  { id: 'savings', label: 'Épargne', category: 'Finance', icon: PiggyBank },
  { id: 'simulator', label: 'Simulateur', category: 'Finance', icon: TrendingUp },
  { id: 'investments', label: 'Investissements', category: 'Finance', icon: Landmark },
  { id: 'loan', label: 'Prêt', category: 'Finance', icon: Calculator },
] as const

export type ModuleId = typeof modules[number]['id']

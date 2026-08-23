export type View = 'dashboard' | 'finances' | 'finance-settings' | 'personal' | 'tools' | 'settings'
export type Theme = 'light' | 'dark' | 'auto'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: string
  date: string
  note?: string
}

export interface Budget {
  id: string
  category: string
  planned: number
  color: string
}

export interface SavingsGoal {
  id: string
  name: string
  current: number
  target: number
  deadline: string
  icon: string
}

export interface Investment {
  id: string
  name: string
  symbol: string
  type: 'Actions' | 'Crypto' | 'Immobilier' | 'Épargne'
  value: number
  invested: number
  change: number
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
  dueDate: string
  category: string
  tags: string[]
  subtasks: { id: string; title: string; done: boolean }[]
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
  pinned: boolean
  color?: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  done: Record<string, boolean>
  missed: Record<string, boolean>
  streak: number
  bestStreak: number
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: number
}

export interface Goal {
  id: string
  title: string
  category: string
  progress: number
  deadline: string
  milestones: { id: string; title: string; done: boolean }[]
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  color: string
}

export interface Profile {
  name: string
  email: string
  bio: string
  phone: string
  birthDate: string
  city: string
  avatar?: string
}

export interface Settings {
  profile: Profile
  theme: Theme
  accent: 'smoke' | 'sage' | 'slate' | 'terracotta'
  density: Density
  language: 'fr' | 'en'
  currency: 'MAD' | 'EUR' | 'USD' | 'GBP' | 'CAD' | 'CHF' | 'AED'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  amountDecimals: 0 | 2
  currencyDisplay: 'symbol' | 'code'
  timezone: string
  notifications: boolean
  budgetAlerts: boolean
  coachMode: boolean
  coachFrequency: 'never' | 'daily' | 'weekly'
  animations: boolean
  smoke: boolean
  parallax: boolean
  hideAmounts: boolean
  pin: string
  journalLocked: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface GridItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export interface SearchResult {
  id: string
  type: 'Tâche' | 'Note' | 'Transaction' | 'Événement' | 'Objectif'
  title: string
  subtitle: string
  target: View
}

// ─────────────────────────────────────────────────────────────
// LifeOS – Types globaux
// ─────────────────────────────────────────────────────────────

export type Lang = 'fr' | 'en';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type DateFormat = 'ddmmyyyy' | 'mmddyyyy' | 'yyyymmdd';

export interface Profile {
  name: string;
  email: string;
  bio: string;
  avatar: string | null; // dataURL ou null
}

export interface Settings {
  lang: Lang;
  currency: string;
  dateFormat: DateFormat;
  timezone: string;
  theme: ThemeMode;
  accent: string; // clé d'accent ('smoke' | 'graphite' | 'sage' | 'steel')
  density: Density;
  notifications: boolean;
  budgetAlerts: boolean;
  coachMode: boolean;
  lockEnabled: boolean;
  pin: string | null;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  due?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  days: Record<string, boolean>; // 'YYYY-MM-DD' -> coché
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: number; // 1..5
}

export interface Goal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0..100
  category: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  title: string;
  note?: string;
  color: string;
}

export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  category: string;
  amount: number; // positif
  type: TxType;
}

export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string;
  color: string;
}

export type InvestmentType = 'stock' | 'crypto' | 'realestate' | 'cash';

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: InvestmentType;
  amount: number;
  changePct: number; // performance %
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppState {
  version: number;
  settings: Settings;
  profile: Profile;
  tasks: Task[];
  notes: Note[];
  habits: Habit[];
  journal: JournalEntry[];
  goals: Goal[];
  events: CalendarEvent[];
  transactions: Transaction[];
  budget: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  investments: Investment[];
  chatHistory: ChatMessage[];
  layout: LayoutItem[];
  hidden: Record<string, boolean>;
}

export type WidgetId =
  | 'clock'
  | 'weather'
  | 'calendar'
  | 'tasks'
  | 'notes'
  | 'habits'
  | 'journal'
  | 'goals'
  | 'pomodoro'
  | 'finance'
  | 'budget'
  | 'savings'
  | 'investments'
  | 'loan'
  | 'premium';

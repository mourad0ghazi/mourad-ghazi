// ─────────────────────────────────────────────────────────────
// LifeOS – Registre des modules du dashboard
// ─────────────────────────────────────────────────────────────

import {
  Activity,
  Brain,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  CloudSun,
  CreditCard,
  Gem,
  LineChart,
  NotebookPen,
  PiggyBank,
  StickyNote,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { WidgetId } from '../types';

export type NavSection = 'personal' | 'finance' | 'premium';

export interface ModuleMeta {
  id: WidgetId;
  icon: LucideIcon;
  tKey: string; // clé i18n du nom
  section: NavSection;
}

export const MODULES: ModuleMeta[] = [
  // ── Vie personnelle ──
  { id: 'clock', icon: Clock, tKey: 'mod.clock', section: 'personal' },
  { id: 'weather', icon: CloudSun, tKey: 'mod.weather', section: 'personal' },
  { id: 'calendar', icon: CalendarDays, tKey: 'mod.calendar', section: 'personal' },
  { id: 'tasks', icon: CheckSquare, tKey: 'mod.tasks', section: 'personal' },
  { id: 'notes', icon: StickyNote, tKey: 'mod.notes', section: 'personal' },
  { id: 'habits', icon: Activity, tKey: 'mod.habits', section: 'personal' },
  { id: 'journal', icon: NotebookPen, tKey: 'mod.journal', section: 'personal' },
  { id: 'goals', icon: Target, tKey: 'mod.goals', section: 'personal' },
  { id: 'pomodoro', icon: Timer, tKey: 'mod.pomodoro', section: 'personal' },
  // ── Finances ──
  { id: 'finance', icon: LineChart, tKey: 'mod.finance', section: 'finance' },
  { id: 'budget', icon: ClipboardList, tKey: 'mod.budget', section: 'finance' },
  { id: 'savings', icon: PiggyBank, tKey: 'mod.savings', section: 'finance' },
  { id: 'investments', icon: TrendingUp, tKey: 'mod.investments', section: 'finance' },
  { id: 'loan', icon: CreditCard, tKey: 'mod.loan', section: 'finance' },
  // ── Fonctionnalités incluses (gratuites) ──
  { id: 'premium', icon: Gem, tKey: 'mod.premium', section: 'premium' },
];

export const SECTION_TITLES: Record<NavSection, string> = {
  personal: 'nav.personal',
  finance: 'nav.finance',
  premium: 'nav.premium',
};

export const WIDGET_ICONS: Record<WidgetId, LucideIcon> = Object.fromEntries(
  MODULES.map((m) => [m.id, m.icon]),
) as Record<WidgetId, LucideIcon>;

export const HABIT_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  book: BookOpen,
  brain: Brain,
  droplets: Activity,
  moon: Clock,
  run: Activity,
  water: Activity,
};

export const EVENT_COLORS = ['#495057', '#6c757d', '#5b7388', '#5f7d6a', '#9aa5ad', '#868e96'];

export const CHART_COLORS = ['#6c757d', '#adb5bd', '#495057', '#5b7388', '#5f7d6a', '#9aa5ad', '#868e96', '#343a40', '#b8893c', '#b3594f'];

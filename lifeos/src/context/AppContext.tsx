// ─────────────────────────────────────────────────────────────
// LifeOS – Contexte applicatif (v2)
// Compose les stores Zustand persistés et expose une API unifiée
// (useApp) aux composants. Gère : thème, toasts, verrouillage,
// formatage global (masquage, séparateur décimal, 12h/24h).
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AppState,
  BudgetCategory,
  CalendarEvent,
  Goal,
  Habit,
  Investment,
  JournalEntry,
  LayoutItem,
  Milestone,
  Note,
  Profile,
  SavingsGoal,
  Settings,
  Subtask,
  Task,
  TaskStatus,
  Transaction,
  WidgetId,
} from '../types';
import {
  useChatbotStore,
  useDashboardStore,
  useFinanceStore,
  usePersonalStore,
  useSettingsStore,
  useUIStore,
} from '../store';
import { makeT, type TFunc } from '../i18n/translations';
import {
  ACCENTS,
  resolveTheme,
  systemPrefersDark,
} from '../utils/helpers';
import { setFormatConfig } from '../utils/formatConfig';

export interface Toast {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextValue {
  state: AppState;
  t: TFunc;
  lang: 'fr' | 'en';
  resolvedTheme: 'light' | 'dark';
  toasts: Toast[];
  showToast: (text: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  premiumOpen: boolean;
  openPremium: () => void;
  closePremium: () => void;
  locked: boolean;
  unlock: (pin: string) => boolean;
  lockNow: () => void;
  // Settings
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  // Layout
  setLayout: (layout: LayoutItem[]) => void;
  resetLayout: () => void;
  toggleWidget: (id: WidgetId) => void;
  isHidden: (id: WidgetId) => boolean;
  showAllWidgets: () => void;
  // Tâches
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'done' | 'status' | 'tags' | 'subtasks'> & Partial<Task>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTask: (from: number, to: number) => void;
  reorderTasks: (ordered: Task[]) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  // Notes
  addNote: (n?: Partial<Note>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;
  // Habitudes
  addHabit: (h: Omit<Habit, 'id' | 'days' | 'missed'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (id: string, date: string) => void;
  cycleHabitDay: (id: string, date: string) => void;
  // Journal
  upsertJournal: (entry: Omit<JournalEntry, 'id'> & { id?: string }) => void;
  deleteJournal: (id: string) => void;
  // Objectifs
  addGoal: (g: Omit<Goal, 'id' | 'milestones'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, label: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  // Événements
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
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
  // Chat
  pushChat: (role: 'user' | 'bot', text: string) => void;
  clearChat: () => void;
  setChatUnread: (count: number) => void;
  chatUnread: number;
  coachLastAt: string | null;
  setCoachLastAt: (iso: string) => void;
  // Données
  exportAll: () => void;
  importAll: (data: Partial<AppState>) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let toastSeq = 0;

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Stores ──
  const settings = useSettingsStore((s) => s.settings);
  const profile = useSettingsStore((s) => s.profile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updateProfile = useSettingsStore((s) => s.updateProfile);

  const layout = useDashboardStore((s) => s.layout);
  const hidden = useDashboardStore((s) => s.hidden);
  const setLayout = useDashboardStore((s) => s.setLayout);
  const resetLayout = useDashboardStore((s) => s.resetLayout);
  const toggleWidget = useDashboardStore((s) => s.toggleWidget);
  const showAllWidgets = useDashboardStore((s) => s.showAllWidgets);

  const transactions = useFinanceStore((s) => s.transactions);
  const budget = useFinanceStore((s) => s.budget);
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const investments = useFinanceStore((s) => s.investments);

  const tasks = usePersonalStore((s) => s.tasks);
  const notes = usePersonalStore((s) => s.notes);
  const habits = usePersonalStore((s) => s.habits);
  const journal = usePersonalStore((s) => s.journal);
  const goals = usePersonalStore((s) => s.goals);
  const events = usePersonalStore((s) => s.events);

  const messages = useChatbotStore((s) => s.messages);
  const coachLastAt = useChatbotStore((s) => s.coachLastAt);
  const chatUnread = useChatbotStore((s) => s.unreadCount);

  const premiumOpen = useUIStore((s) => s.premiumOpen);
  const setPremiumOpen = useUIStore((s) => s.setPremiumOpen);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, forceRender] = useState(0);
  const [locked, setLocked] = useState<boolean>(() => {
    // Verrouillage au démarrage si activé dans les paramètres persistés
    try {
      const raw = localStorage.getItem('lifeos:v2:settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.settings?.lockEnabled) return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  });
  const resolvedTheme = resolveTheme(settings.theme);

  // ── État combiné (compatible avec l'ancien AppState) ──
  const state: AppState = useMemo(
    () => ({
      version: 2,
      settings,
      profile,
      tasks,
      notes,
      habits,
      journal,
      goals,
      events,
      transactions,
      budget,
      savingsGoals,
      investments,
      chatHistory: messages,
      layout,
      hidden,
    }),
    [settings, profile, tasks, notes, habits, journal, goals, events, transactions, budget, savingsGoals, investments, messages, layout, hidden],
  );

  const t = useMemo(() => makeT(settings.lang), [settings.lang]);

  // ── Formatage global ──
  useEffect(() => {
    setFormatConfig({
      hideAmounts: settings.hideAmounts,
      decimalSep: settings.decimalSep,
      hour12: settings.hourFormat === '12',
    });
  }, [settings.hideAmounts, settings.decimalSep, settings.hourFormat]);

  // ── Thème / accent / densité ──
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', settings.accent);
    root.setAttribute('data-density', settings.density);
    root.setAttribute('data-anim-page', String(settings.animations.page));
    root.setAttribute('data-anim-cards', String(settings.animations.cards));
    root.setAttribute('data-anim-smoke', String(settings.animations.smoke));
    root.setAttribute('data-card-borders', String(settings.cardBorders));
    root.setAttribute('data-card-shadows', String(settings.cardShadows));
    const accent = ACCENTS[settings.accent]?.color ?? '#6c757d';
    const accentSoft = ACCENTS[settings.accent]?.soft ?? 'rgba(108,117,125,.14)';
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-soft', accentSoft);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#0d0d0d' : '#f8f9fa');
  }, [resolvedTheme, settings.accent, settings.density, settings.animations]);

  // ── Thème auto : écoute du système ──
  useEffect(() => {
    if (settings.theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => forceRender((n) => n + 1);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  // ── Toasts ──
  const dismissToast = useCallback((id: string) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (text: string, type: Toast['type'] = 'info') => {
      const id = `t${++toastSeq}`;
      setToasts((ts) => [...ts.slice(-3), { id, text, type }]);
      window.setTimeout(() => dismissToast(id), 3800);
    },
    [dismissToast],
  );

  // ── Verrouillage ──
  const unlock = useCallback(
    (pin: string) => {
      const expected = settings.pin || '1234';
      if (pin === expected) {
        setLocked(false);
        return true;
      }
      return false;
    },
    [settings.pin],
  );

  const lockNow = useCallback(() => {
    if (settings.lockEnabled) setLocked(true);
  }, [settings.lockEnabled]);

  // ── Données ──
  const exportAll = useCallback(() => {
    import('../utils/helpers').then(({ downloadJSON }) => {
      downloadJSON(`lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`, state);
      try {
        localStorage.setItem('lifeos:last-backup', new Date().toISOString());
      } catch {
        /* ignore */
      }
      showToast(t('toast.exported'), 'success');
    });
  }, [state, t, showToast]);

  const importAll = useCallback(
    (data: Partial<AppState>) => {
      if (data.settings) updateSettings(data.settings);
      if (data.profile) updateProfile(data.profile);
      if (data.layout) setLayout(data.layout);
      if (data.hidden) useDashboardStore.setState({ hidden: data.hidden });
      if (data.transactions) useFinanceStore.setState({ transactions: data.transactions });
      if (data.budget) useFinanceStore.setState({ budget: data.budget });
      if (data.savingsGoals) useFinanceStore.setState({ savingsGoals: data.savingsGoals });
      if (data.investments) useFinanceStore.setState({ investments: data.investments });
      if (data.tasks) usePersonalStore.setState({ tasks: data.tasks });
      if (data.notes) usePersonalStore.setState({ notes: data.notes });
      if (data.habits) usePersonalStore.setState({ habits: data.habits });
      if (data.journal) usePersonalStore.setState({ journal: data.journal });
      if (data.goals) usePersonalStore.setState({ goals: data.goals });
      if (data.events) usePersonalStore.setState({ events: data.events });
      if (data.chatHistory) useChatbotStore.setState({ messages: data.chatHistory });
      showToast(t('toast.imported'), 'success');
    },
    [t, showToast, updateSettings, updateProfile, setLayout],
  );

  const resetAll = useCallback(() => {
    useSettingsStore.getState().resetSettings();
    useDashboardStore.getState().resetLayout();
    useFinanceStore.getState().resetFinance();
    usePersonalStore.getState().resetPersonal();
    useChatbotStore.getState().resetChat();
    setLocked(false);
    showToast(t('toast.reset'), 'success');
  }, [t, showToast]);

  const value: AppContextValue = {
    state,
    t,
    lang: settings.lang,
    resolvedTheme,
    toasts,
    showToast,
    dismissToast,
    premiumOpen,
    openPremium: () => setPremiumOpen(true),
    closePremium: () => setPremiumOpen(false),
    locked,
    unlock,
    lockNow,
    updateSettings,
    updateProfile,
    setLayout,
    resetLayout,
    toggleWidget: (id) => toggleWidget(id),
    isHidden: (id) => Boolean(hidden[id]),
    showAllWidgets,
    addTask: usePersonalStore.getState().addTask,
    updateTask: usePersonalStore.getState().updateTask,
    deleteTask: usePersonalStore.getState().deleteTask,
    setTaskStatus: usePersonalStore.getState().setTaskStatus,
    reorderTask: usePersonalStore.getState().reorderTask,
    reorderTasks: usePersonalStore.getState().reorderTasks,
    addSubtask: usePersonalStore.getState().addSubtask,
    toggleSubtask: usePersonalStore.getState().toggleSubtask,
    deleteSubtask: usePersonalStore.getState().deleteSubtask,
    addNote: usePersonalStore.getState().addNote,
    updateNote: usePersonalStore.getState().updateNote,
    deleteNote: usePersonalStore.getState().deleteNote,
    toggleNotePin: usePersonalStore.getState().toggleNotePin,
    addHabit: usePersonalStore.getState().addHabit,
    deleteHabit: usePersonalStore.getState().deleteHabit,
    toggleHabitDay: usePersonalStore.getState().toggleHabitDay,
    cycleHabitDay: usePersonalStore.getState().cycleHabitDay,
    upsertJournal: usePersonalStore.getState().upsertJournal,
    deleteJournal: usePersonalStore.getState().deleteJournal,
    addGoal: usePersonalStore.getState().addGoal,
    updateGoal: usePersonalStore.getState().updateGoal,
    deleteGoal: usePersonalStore.getState().deleteGoal,
    addMilestone: usePersonalStore.getState().addMilestone,
    toggleMilestone: usePersonalStore.getState().toggleMilestone,
    deleteMilestone: usePersonalStore.getState().deleteMilestone,
    addEvent: usePersonalStore.getState().addEvent,
    deleteEvent: usePersonalStore.getState().deleteEvent,
    addTx: useFinanceStore.getState().addTx,
    deleteTx: useFinanceStore.getState().deleteTx,
    addBudgetCat: useFinanceStore.getState().addBudgetCat,
    updateBudgetCat: useFinanceStore.getState().updateBudgetCat,
    deleteBudgetCat: useFinanceStore.getState().deleteBudgetCat,
    addSavingsGoal: useFinanceStore.getState().addSavingsGoal,
    contributeSavings: useFinanceStore.getState().contributeSavings,
    deleteSavingsGoal: useFinanceStore.getState().deleteSavingsGoal,
    addInvestment: useFinanceStore.getState().addInvestment,
    deleteInvestment: useFinanceStore.getState().deleteInvestment,
    pushChat: useChatbotStore.getState().pushChat,
    clearChat: useChatbotStore.getState().clearChat,
    setChatUnread: useChatbotStore.getState().setUnread,
    chatUnread,
    coachLastAt,
    setCoachLastAt: useChatbotStore.getState().setCoachLastAt,
    exportAll,
    importAll,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { systemPrefersDark };

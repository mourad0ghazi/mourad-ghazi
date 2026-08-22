// ─────────────────────────────────────────────────────────────
// LifeOS – Contexte global (état, persistance, thème, toasts)
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  Note,
  Profile,
  SavingsGoal,
  Settings,
  Task,
  Transaction,
  WidgetId,
} from '../types';
import { initialState } from '../data/initialData';
import { makeT, type TFunc } from '../i18n/translations';
import {
  ACCENTS,
  loadState,
  resolveTheme,
  saveState,
  systemPrefersDark,
  uid,
} from '../utils/helpers';

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
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'done'> & { done?: boolean }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Notes
  addNote: (n?: Partial<Note>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // Habitudes
  addHabit: (h: Omit<Habit, 'id' | 'days'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (id: string, date: string) => void;
  // Journal
  upsertJournal: (entry: Omit<JournalEntry, 'id'> & { id?: string }) => void;
  deleteJournal: (id: string) => void;
  // Objectifs
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
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
  // Données
  exportAll: () => void;
  importAll: (data: Partial<AppState>) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState(initialState));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [locked, setLocked] = useState<boolean>(() => loadState(initialState).settings.lockEnabled ?? false);
  const saveTimer = useRef<number | null>(null);

  // Persistance (debounced)
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveState(state), 250);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state]);

  const resolvedTheme = resolveTheme(state.settings.theme);

  // Application du thème / accent / densité au document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', state.settings.accent);
    root.setAttribute('data-density', state.settings.density);
    const accent = ACCENTS[state.settings.accent]?.color ?? '#6c757d';
    const accentSoft = ACCENTS[state.settings.accent]?.soft ?? 'rgba(108,117,125,.14)';
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-soft', accentSoft);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#14171c' : '#f8f9fa');
  }, [resolvedTheme, state.settings.accent, state.settings.density]);

  // Écoute du thème système en mode "auto"
  useEffect(() => {
    if (state.settings.theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setState((s) => ({ ...s })); // re-render pour recalculer resolvedTheme
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [state.settings.theme]);

  const t = useMemo(() => makeT(state.settings.lang), [state.settings.lang]);

  // ── Toasts ─────────────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (text: string, type: Toast['type'] = 'info') => {
      const id = uid();
      setToasts((ts) => [...ts.slice(-3), { id, text, type }]);
      window.setTimeout(() => dismissToast(id), 3800);
    },
    [dismissToast],
  );

  // ── Verrouillage ───────────────────────────────────────────
  const unlock = useCallback(
    (pin: string) => {
      const expected = state.settings.pin || '1234';
      if (pin === expected) {
        setLocked(false);
        return true;
      }
      return false;
    },
    [state.settings.pin],
  );

  const lockNow = useCallback(() => {
    if (state.settings.lockEnabled) setLocked(true);
  }, [state.settings.lockEnabled]);

  // ── Helpers génériques ─────────────────────────────────────
  const patch = useCallback((p: Partial<AppState>) => setState((s) => ({ ...s, ...p })), []);

  function listUpdate<K extends keyof AppState>(key: K, fn: (items: AppState[K]) => AppState[K]) {
    setState((s) => ({ ...s, [key]: fn(s[key]) }));
  }

  function listAdd<K extends keyof AppState>(key: K, item: AppState[K] extends Array<infer T> ? T : never) {
    listUpdate(key, (items) => [...(items as unknown[]), item] as AppState[K]);
  }

  function listRemove<K extends keyof AppState>(key: K, id: string) {
    listUpdate(key, (items) =>
      (items as Array<{ id: string }>).filter((x) => x.id !== id) as AppState[K],
    );
  }

  // ── Settings / Profile ─────────────────────────────────────
  const updateSettings = useCallback((p: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  }, []);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  }, []);

  // ── Layout ─────────────────────────────────────────────────
  const setLayout = useCallback((layout: LayoutItem[]) => setState((s) => ({ ...s, layout })), []);
  const resetLayout = useCallback(() => {
    setState((s) => ({ ...s, layout: initialState.layout, hidden: {} }));
    showToast(t('toast.layoutReset'), 'success');
  }, [t, showToast]);

  const isHidden = useCallback((id: WidgetId) => Boolean(state.hidden[id]), [state.hidden]);

  const toggleWidget = useCallback((id: WidgetId) => {
    setState((s) => {
      const hidden = { ...s.hidden };
      if (hidden[id]) delete hidden[id];
      else hidden[id] = true;
      return { ...s, hidden };
    });
  }, []);

  const showAllWidgets = useCallback(() => setState((s) => ({ ...s, hidden: {} })), []);

  // ── Tâches ─────────────────────────────────────────────────
  const addTask: AppContextValue['addTask'] = useCallback((task) => {
    listAdd('tasks', {
      ...task,
      id: uid(),
      done: task.done ?? false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const updateTask = useCallback((id: string, p: Partial<Task>) => {
    listUpdate('tasks', (items) => (items as Task[]).map((x) => (x.id === id ? { ...x, ...p } : x)));
  }, []);

  const deleteTask = useCallback((id: string) => listRemove('tasks', id), []);

  // ── Notes ──────────────────────────────────────────────────
  const addNote: AppContextValue['addNote'] = useCallback((n) => {
    const id = uid();
    listAdd('notes', {
      id,
      title: n?.title ?? '',
      content: n?.content ?? '',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    return id;
  }, []);

  const updateNote = useCallback((id: string, p: Partial<Note>) => {
    listUpdate('notes', (items) =>
      (items as Note[]).map((x) =>
        x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString().slice(0, 10) } : x,
      ),
    );
  }, []);

  const deleteNote = useCallback((id: string) => listRemove('notes', id), []);

  // ── Habitudes ──────────────────────────────────────────────
  const addHabit = useCallback((h: Omit<Habit, 'id' | 'days'>) => {
    listAdd('habits', { ...h, id: uid(), days: {} });
  }, []);

  const deleteHabit = useCallback((id: string) => listRemove('habits', id), []);

  const toggleHabitDay = useCallback((id: string, date: string) => {
    listUpdate('habits', (items) =>
      (items as Habit[]).map((h) => {
        if (h.id !== id) return h;
        const days = { ...h.days };
        if (days[date]) delete days[date];
        else days[date] = true;
        return { ...h, days };
      }),
    );
  }, []);

  // ── Journal ────────────────────────────────────────────────
  const upsertJournal = useCallback((entry: Omit<JournalEntry, 'id'> & { id?: string }) => {
    if (entry.id) {
      listUpdate('journal', (items) =>
        (items as JournalEntry[]).map((x) => (x.id === entry.id ? { ...x, ...entry } : x)),
      );
    } else {
      listAdd('journal', { ...entry, id: uid() });
    }
  }, []);

  const deleteJournal = useCallback((id: string) => listRemove('journal', id), []);

  // ── Objectifs ──────────────────────────────────────────────
  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    listAdd('goals', { ...g, id: uid() });
  }, []);

  const updateGoal = useCallback((id: string, p: Partial<Goal>) => {
    listUpdate('goals', (items) => (items as Goal[]).map((x) => (x.id === id ? { ...x, ...p } : x)));
  }, []);

  const deleteGoal = useCallback((id: string) => listRemove('goals', id), []);

  // ── Événements ─────────────────────────────────────────────
  const addEvent = useCallback((e: Omit<CalendarEvent, 'id'>) => {
    listAdd('events', { ...e, id: uid() });
  }, []);

  const deleteEvent = useCallback((id: string) => listRemove('events', id), []);

  // ── Transactions ───────────────────────────────────────────
  const addTx = useCallback((tx: Omit<Transaction, 'id'>) => {
    listAdd('transactions', { ...tx, id: uid() });
  }, []);

  const deleteTx = useCallback((id: string) => listRemove('transactions', id), []);

  // ── Budget ─────────────────────────────────────────────────
  const addBudgetCat = useCallback((c: Omit<BudgetCategory, 'id'>) => {
    listAdd('budget', { ...c, id: uid() });
  }, []);

  const updateBudgetCat = useCallback((id: string, p: Partial<BudgetCategory>) => {
    listUpdate('budget', (items) => (items as BudgetCategory[]).map((x) => (x.id === id ? { ...x, ...p } : x)));
  }, []);

  const deleteBudgetCat = useCallback((id: string) => listRemove('budget', id), []);

  // ── Épargne ────────────────────────────────────────────────
  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id'>) => {
    listAdd('savingsGoals', { ...g, id: uid() });
  }, []);

  const contributeSavings = useCallback((id: string, amount: number) => {
    listUpdate('savingsGoals', (items) =>
      (items as SavingsGoal[]).map((x) =>
        x.id === id ? { ...x, saved: Math.max(0, x.saved + amount) } : x,
      ),
    );
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => listRemove('savingsGoals', id), []);

  // ── Investissements ────────────────────────────────────────
  const addInvestment = useCallback((i: Omit<Investment, 'id'>) => {
    listAdd('investments', { ...i, id: uid() });
  }, []);

  const deleteInvestment = useCallback((id: string) => listRemove('investments', id), []);

  // ── Chat ───────────────────────────────────────────────────
  const pushChat = useCallback((role: 'user' | 'bot', text: string) => {
    listAdd('chatHistory', { id: uid(), role, text, time: new Date().toISOString() });
  }, []);

  const clearChat = useCallback(() => patch({ chatHistory: [] }), [patch]);

  // ── Données ────────────────────────────────────────────────
  const exportAll = useCallback(() => {
    import('../utils/helpers').then(({ downloadJSON }) => {
      downloadJSON(`lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`, state);
      showToast(t('toast.exported'), 'success');
    });
  }, [state, t, showToast]);

  const importAll = useCallback(
    (data: Partial<AppState>) => {
      setState((s) => ({
        ...s,
        ...data,
        settings: { ...s.settings, ...(data.settings ?? {}) },
        version: 1,
      }));
      showToast(t('toast.imported'), 'success');
    },
    [t, showToast],
  );

  const resetAll = useCallback(() => {
    setState({ ...initialState, layout: initialState.layout.map((l) => ({ ...l })) });
    setLocked(initialState.settings.lockEnabled);
    showToast(t('toast.reset'), 'success');
  }, [t, showToast]);

  const value: AppContextValue = {
    state,
    t,
    lang: state.settings.lang,
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
    toggleWidget,
    isHidden,
    showAllWidgets,
    addTask,
    updateTask,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
    addHabit,
    deleteHabit,
    toggleHabitDay,
    upsertJournal,
    deleteJournal,
    addGoal,
    updateGoal,
    deleteGoal,
    addEvent,
    deleteEvent,
    addTx,
    deleteTx,
    addBudgetCat,
    updateBudgetCat,
    deleteBudgetCat,
    addSavingsGoal,
    contributeSavings,
    deleteSavingsGoal,
    addInvestment,
    deleteInvestment,
    pushChat,
    clearChat,
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

// ─────────────────────────────────────────────────────────────
// LifeOS – Store UI (navigation entre pages, panneaux) – non persisté
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { View } from '../types';

interface UIState {
  view: View;
  settingsOpen: boolean;
  financeTab: string;
  personalTab: string;
  setView: (view: View) => void;
  setSettingsOpen: (open: boolean) => void;
  setFinanceTab: (tab: string) => void;
  setPersonalTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'dashboard',
  settingsOpen: false,
  financeTab: 'overview',
  personalTab: 'tasks',
  setView: (view) => set({ view }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setFinanceTab: (financeTab) => set({ financeTab }),
  setPersonalTab: (personalTab) => set({ personalTab }),
}));

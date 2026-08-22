// ─────────────────────────────────────────────────────────────
// LifeOS – Store paramètres & profil (Zustand + persist)
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Settings } from '../types';
import { initialSettingsSlice } from '../data/initialData';

interface SettingsState {
  settings: Settings;
  profile: Profile;
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialSettingsSlice,
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      resetSettings: () => set({ ...initialSettingsSlice }),
    }),
    { name: 'lifeos:v2:settings', version: 1 },
  ),
);

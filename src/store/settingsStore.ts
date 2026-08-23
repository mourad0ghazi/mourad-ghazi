import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Settings } from '../types'
import { initialSettings } from '../data/initialData'

interface SettingsState extends Settings {
  update: (patch: Partial<Settings>) => void
  updateProfile: (patch: Partial<Profile>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
  ...initialSettings,
  update: (patch) => set(patch),
  updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
  reset: () => set(initialSettings),
}), { name: 'lifeos:v2:settings' }))

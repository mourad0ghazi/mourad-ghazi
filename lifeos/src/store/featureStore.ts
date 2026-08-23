// ─────────────────────────────────────────────────────────────
// LifeOS – Store des fonctionnalités (v2.5 : 100 % gratuit)
// État persistant des 12 fonctionnalités avancées : sync
// bancaire, intégrations, famille, thèmes personnalisés,
// alertes, API, rapports, cloud, support…
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '../utils/helpers';

export interface FamilyMember {
  id: string;
  name: string;
  budget: number;
}

export interface CustomTheme {
  id: string;
  name: string;
  color: string; // hex
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  date: string; // ISO
}

export type FeatureId =
  | 'ai'
  | 'reports'
  | 'bank'
  | 'cloud'
  | 'family'
  | 'integrations'
  | 'pwa'
  | 'templates'
  | 'alerts'
  | 'api'
  | 'themes'
  | 'support';

interface FeatureState {
  // Sync bancaire
  bankName: string | null;
  bankConnectedAt: string | null;
  // Intégrations
  integrations: Record<string, boolean>; // google / outlook / notion / trello
  // Famille
  family: FamilyMember[];
  // Thèmes personnalisés
  customThemes: CustomTheme[];
  // Alertes
  alertEmail: string;
  desktopAlerts: boolean;
  smsAlerts: boolean;
  // API
  apiKey: string | null;
  apiGeneratedAt: string | null;
  // Rapports
  reports: { lastPdf: string | null; lastExcel: string | null };
  // Support
  tickets: SupportTicket[];
  // Cloud
  autoBackup: boolean;
  lastCloudSync: string | null;

  connectBank: (name: string) => void;
  disconnectBank: () => void;
  toggleIntegration: (key: string, on: boolean) => void;
  addFamilyMember: (name: string, budget: number) => void;
  removeFamilyMember: (id: string) => void;
  addCustomTheme: (name: string, color: string) => string;
  deleteCustomTheme: (id: string) => void;
  setAlertEmail: (email: string) => void;
  setDesktopAlerts: (on: boolean) => void;
  setSmsAlerts: (on: boolean) => void;
  generateApiKey: () => string;
  markReport: (kind: 'pdf' | 'excel') => void;
  addTicket: (subject: string, message: string) => void;
  removeTicket: (id: string) => void;
  setAutoBackup: (on: boolean) => void;
  setLastCloudSync: (iso: string) => void;
  resetFeatures: () => void;
}

const initialFeatureState = {
  bankName: null as string | null,
  bankConnectedAt: null as string | null,
  integrations: {} as Record<string, boolean>,
  family: [] as FamilyMember[],
  customThemes: [] as CustomTheme[],
  alertEmail: '',
  desktopAlerts: false,
  smsAlerts: false,
  apiKey: null as string | null,
  apiGeneratedAt: null as string | null,
  reports: { lastPdf: null as string | null, lastExcel: null as string | null },
  tickets: [] as SupportTicket[],
  autoBackup: false,
  lastCloudSync: null as string | null,
};

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      ...initialFeatureState,
      connectBank: (name) =>
        set({ bankName: name, bankConnectedAt: new Date().toISOString() }),
      disconnectBank: () => set({ bankName: null, bankConnectedAt: null }),
      toggleIntegration: (key, on) =>
        set((s) => ({ integrations: { ...s.integrations, [key]: on } })),
      addFamilyMember: (name, budget) =>
        set((s) => ({ family: [...s.family, { id: uid(), name, budget }] })),
      removeFamilyMember: (id) =>
        set((s) => ({ family: s.family.filter((m) => m.id !== id) })),
      addCustomTheme: (name, color) => {
        const id = uid();
        set((s) => ({ customThemes: [...s.customThemes, { id, name, color }] }));
        return id;
      },
      deleteCustomTheme: (id) =>
        set((s) => ({ customThemes: s.customThemes.filter((t) => t.id !== id) })),
      setAlertEmail: (alertEmail) => set({ alertEmail }),
      setDesktopAlerts: (desktopAlerts) => set({ desktopAlerts }),
      setSmsAlerts: (smsAlerts) => set({ smsAlerts }),
      generateApiKey: () => {
        const key = `los_${cryptoRandom(32)}`;
        set({ apiKey: key, apiGeneratedAt: new Date().toISOString() });
        return key;
      },
      markReport: (kind) =>
        set((s) => ({
          reports: { ...s.reports, [kind === 'pdf' ? 'lastPdf' : 'lastExcel']: new Date().toISOString() },
        })),
      addTicket: (subject, message) =>
        set((s) => ({
          tickets: [...s.tickets, { id: uid(), subject, message, date: new Date().toISOString() }],
        })),
      removeTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),
      setAutoBackup: (autoBackup) => set({ autoBackup }),
      setLastCloudSync: (lastCloudSync) => set({ lastCloudSync }),
      resetFeatures: () => set({ ...initialFeatureState }),
    }),
    { name: 'lifeos:v2:features', version: 1 },
  ),
);

/** Clé aléatoire sécurisée (crypto.getRandomValues) */
function cryptoRandom(bytes: number): string {
  try {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

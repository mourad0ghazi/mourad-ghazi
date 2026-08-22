// ─────────────────────────────────────────────────────────────
// LifeOS – Migration v1 → v2 des données localStorage
// À importer AVANT tout store (side-effect) : les stores Zustand
// hydratent au moment de leur création, la migration doit donc
// avoir déjà écrit les nouvelles clés.
// ─────────────────────────────────────────────────────────────

import {
  initialChatSlice,
  initialDashboardSlice,
  initialFinanceSlice,
  initialPersonalSlice,
  initialSettingsSlice,
  initialState,
} from '../data/initialData';
import type { AppState } from '../types';

const V1_KEY = 'lifeos:v1:state';
const V2_KEYS = {
  settings: 'lifeos:v2:settings',
  dashboard: 'lifeos:v2:dashboard',
  finance: 'lifeos:v2:finance',
  personal: 'lifeos:v2:personal',
  chat: 'lifeos:v2:chat',
};

function write(key: string, state: unknown) {
  localStorage.setItem(key, JSON.stringify({ state, version: 1 }));
}

export function migrateFromV1(): void {
  try {
    const raw = localStorage.getItem(V1_KEY);
    if (!raw) return;
    const old = JSON.parse(raw) as Partial<AppState>;
    if (!old || typeof old !== 'object') return;
    // Si v2 existe déjà, on supprime simplement l'ancienne clé
    if (localStorage.getItem(V2_KEYS.settings)) {
      localStorage.removeItem(V1_KEY);
      return;
    }

    const merged = { ...initialState, ...old } as AppState;

    // ── Settings + profil ──
    write(V2_KEYS.settings, {
      settings: { ...initialSettingsSlice.settings, ...(old.settings ?? {}) },
      profile: { ...initialSettingsSlice.profile, ...(old.profile ?? {}) },
    });

    // ── Dashboard ──
    write(V2_KEYS.dashboard, {
      layout: Array.isArray(old.layout) && old.layout.length > 0 ? old.layout : initialDashboardSlice.layout,
      hidden: old.hidden ?? {},
    });

    // ── Finance ──
    write(V2_KEYS.finance, {
      transactions: old.transactions ?? initialFinanceSlice.transactions,
      budget: old.budget ?? initialFinanceSlice.budget,
      savingsGoals: old.savingsGoals ?? initialFinanceSlice.savingsGoals,
      investments: old.investments ?? initialFinanceSlice.investments,
    });

    // ── Personnel (avec nouveaux champs v2) ──
    write(V2_KEYS.personal, {
      tasks: (old.tasks ?? initialPersonalSlice.tasks).map((t) => ({
        ...t,
        status: t.done ? 'done' : 'todo',
        tags: [],
        subtasks: [],
      })),
      notes: old.notes ?? initialPersonalSlice.notes,
      habits: (old.habits ?? initialPersonalSlice.habits).map((h) => ({ ...h, missed: {} })),
      journal: old.journal ?? initialPersonalSlice.journal,
      goals: (old.goals ?? initialPersonalSlice.goals).map((g) => ({ ...g, milestones: [] })),
      events: old.events ?? initialPersonalSlice.events,
    });

    // ── Chat ──
    write(V2_KEYS.chat, {
      messages: old.chatHistory ?? initialChatSlice.messages,
      unreadCount: 0,
      coachLastAt: null,
    });

    localStorage.removeItem(V1_KEY);
  } catch {
    /* migration impossible : on démarre sur les données v2 par défaut */
  }
}

migrateFromV1();

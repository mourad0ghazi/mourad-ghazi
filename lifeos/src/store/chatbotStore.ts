// ─────────────────────────────────────────────────────────────
// LifeOS – Store chatbot (messages, état, coach proactif)
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../types';
import { initialChatSlice } from '../data/initialData';
import { uid } from '../utils/helpers';

interface ChatbotState {
  messages: ChatMessage[];
  unreadCount: number;
  coachLastAt: string | null; // ISO date de la dernière analyse coach
  pushChat: (role: 'user' | 'bot', text: string) => void;
  clearChat: () => void;
  setUnread: (count: number) => void;
  setCoachLastAt: (iso: string) => void;
  resetChat: () => void;
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      ...initialChatSlice,
      pushChat: (role, text) =>
        set((s) => ({
          messages: [...s.messages, { id: uid(), role, text, time: new Date().toISOString() }],
        })),
      clearChat: () => set({ messages: [] }),
      setUnread: (unreadCount) => set({ unreadCount }),
      setCoachLastAt: (coachLastAt) => set({ coachLastAt }),
      resetChat: () => set({ ...initialChatSlice }),
    }),
    { name: 'lifeos:v2:chat', version: 1 },
  ),
);

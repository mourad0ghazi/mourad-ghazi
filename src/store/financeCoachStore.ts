import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '../types'
import type { FinanceCoachTone } from '../utils/financeCoach'

interface FinanceCoachState {
  messages: ChatMessage[]
  tone: FinanceCoachTone
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setTone: (tone: FinanceCoachTone) => void
}

export const useFinanceCoachStore = create<FinanceCoachState>()(persist((set) => ({
  messages: [],
  tone: 'simple',
  addMessage: (message) => set((state) => ({ messages: [...state.messages.slice(-79), message] })),
  clearMessages: () => set({ messages: [] }),
  setTone: (tone) => set({ tone }),
}), {
  name: 'lifeos-finance-coach',
  partialize: (state) => ({ messages: state.messages, tone: state.tone }),
}))

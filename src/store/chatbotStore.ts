import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '../types'

interface ChatState {
  isOpen: boolean
  isTyping: boolean
  unread: number
  messages: ChatMessage[]
  setOpen: (value: boolean) => void
  setTyping: (value: boolean) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clear: () => void
}

const welcome: ChatMessage = {
  id: 'welcome', role: 'assistant', timestamp: new Date().toISOString(),
  content: 'Bonjour Mourad 👋 Je suis votre coach LifeOS. Je peux analyser votre budget, vos tâches, vos objectifs ou vous aider à organiser la journée. Tout fonctionne localement et gratuitement.',
}

export const useChatbotStore = create<ChatState>()(persist((set) => ({
  isOpen: false, isTyping: false, unread: 0, messages: [welcome],
  setOpen: (isOpen) => set((state) => ({ isOpen, unread: isOpen ? 0 : state.unread })),
  setTyping: (isTyping) => set({ isTyping }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, { ...message, id: crypto.randomUUID(), timestamp: new Date().toISOString() }], unread: message.role === 'assistant' && !state.isOpen ? state.unread + 1 : state.unread })),
  clear: () => set({ messages: [welcome], unread: 0 }),
}), { name: 'lifeos:v2:chat', partialize: (state) => ({ messages: state.messages, unread: state.unread }) }))

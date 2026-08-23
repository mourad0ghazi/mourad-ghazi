import { create } from 'zustand'
import type { View } from '../types'

type ModalType = 'transaction' | 'task' | 'event' | 'search' | 'notifications' | null
interface UIState {
  view: View
  sidebarOpen: boolean
  modal: ModalType
  toast: string | null
  locked: boolean
  setView: (view: View) => void
  setSidebarOpen: (value: boolean) => void
  setModal: (modal: ModalType) => void
  setLocked: (value: boolean) => void
  showToast: (message: string) => void
  clearToast: () => void
}
const validViews: View[]=['dashboard','finances','finance-settings','personal','tools','settings']
const hashView=location.hash.replace('#/','').split('/')[0]
export const useUIStore = create<UIState>((set) => ({
  view: validViews.includes(hashView as View)?hashView as View:'dashboard', sidebarOpen: false, modal: null, toast: null, locked: false,
  setView: (view) => { location.hash = view === 'dashboard' ? '#/' : `#/${view}`; set({ view, sidebarOpen: false }) },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setModal: (modal) => set({ modal }),
  setLocked: (locked) => set({locked}),
  showToast: (toast) => { set({ toast }); window.setTimeout(() => set({ toast: null }), 3000) },
  clearToast: () => set({ toast: null }),
}))

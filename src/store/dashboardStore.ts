import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GridItem } from '../types'
import { modules, type ModuleId } from '../data/modules'

export const defaultLayout: GridItem[] = [
  { i: 'clock', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'weather', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'pomodoro', x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'goals', x: 9, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { i: 'finance', x: 0, y: 3, w: 6, h: 6, minW: 4, minH: 5 },
  { i: 'expenses', x: 6, y: 3, w: 6, h: 6, minW: 4, minH: 5 },
  { i: 'tasks', x: 0, y: 9, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'calendar', x: 4, y: 9, w: 5, h: 6, minW: 4, minH: 5 },
  { i: 'habits', x: 9, y: 9, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'budget', x: 0, y: 15, w: 6, h: 6, minW: 4, minH: 5 },
  { i: 'savings', x: 6, y: 15, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'investments', x: 9, y: 15, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'notes', x: 0, y: 21, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'journal', x: 4, y: 21, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'transactions', x: 8, y: 21, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'simulator', x: 0, y: 28, w: 8, h: 7, minW: 5, minH: 6 },
  { i: 'loan', x: 8, y: 28, w: 4, h: 7, minW: 3, minH: 6 },
]

interface DashboardState {
  layout: GridItem[]
  visible: Record<string, boolean>
  editMode: boolean
  setLayout: (layout: GridItem[]) => void
  toggleWidget: (id: ModuleId) => void
  setEditMode: (value: boolean) => void
  showAll: () => void
  resetLayout: () => void
}

export const useDashboardStore = create<DashboardState>()(persist((set) => ({
  layout: defaultLayout,
  visible: Object.fromEntries(modules.map((m) => [m.id, true])),
  editMode: false,
  setLayout: (layout) => set({ layout }),
  toggleWidget: (id) => set((state) => ({ visible: { ...state.visible, [id]: !state.visible[id] } })),
  setEditMode: (editMode) => set({ editMode }),
  showAll: () => set({ visible: Object.fromEntries(modules.map((m) => [m.id, true])) }),
  resetLayout: () => set({ layout: defaultLayout, visible: Object.fromEntries(modules.map((m) => [m.id, true])) }),
}), { name: 'lifeos:v2:dashboard' }))

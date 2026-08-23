import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GridItem } from '../types'
import { dashboardPresets, type DashboardPresetId } from '../data/dashboardPresets'
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

export function layoutForModules(priority: readonly ModuleId[]) {
  const order = [...new Set<ModuleId>([...priority, ...modules.map((module) => module.id)])]
  let x = 0
  let y = 0
  let rowHeight = 0
  return order.map((id) => defaultLayout.find((item) => item.i === id)).filter((item): item is GridItem => Boolean(item)).map((item) => {
    if (x + item.w > 12) {
      x = 0
      y += rowHeight
      rowHeight = 0
    }
    const next = { ...item, x, y }
    x += item.w
    rowHeight = Math.max(rowHeight, item.h)
    return next
  })
}

interface DashboardState {
  layout: GridItem[]
  visible: Record<string, boolean>
  editMode: boolean
  setLayout: (layout: GridItem[]) => void
  toggleWidget: (id: ModuleId) => void
  moveWidget: (id: ModuleId, direction: -1 | 1) => void
  setEditMode: (value: boolean) => void
  applyPreset: (id: DashboardPresetId) => void
  showAll: () => void
  resetLayout: () => void
}

export const useDashboardStore = create<DashboardState>()(persist((set) => ({
  layout: defaultLayout,
  visible: Object.fromEntries(modules.map((module) => [module.id, true])),
  editMode: false,
  setLayout: (layout) => set({ layout }),
  toggleWidget: (id) => set((state) => ({ visible: { ...state.visible, [id]: !state.visible[id] } })),
  moveWidget: (id, direction) => set((state) => {
    const index = state.layout.findIndex((item) => item.i === id)
    let targetIndex = index + direction
    while (targetIndex >= 0 && targetIndex < state.layout.length && state.visible[state.layout[targetIndex].i] === false) targetIndex += direction
    if (index < 0 || targetIndex < 0 || targetIndex >= state.layout.length) return state
    const current = state.layout[index]
    const target = state.layout[targetIndex]
    const layout = [...state.layout]
    layout[index] = { ...target, x: current.x, y: current.y }
    layout[targetIndex] = { ...current, x: target.x, y: target.y }
    return { layout }
  }),
  setEditMode: (editMode) => set({ editMode }),
  applyPreset: (id) => set(() => {
    const preset = dashboardPresets.find((item) => item.id === id) ?? dashboardPresets[0]
    const active = new Set(preset.modules)
    return {
      editMode: true,
      layout: layoutForModules(preset.modules),
      visible: Object.fromEntries(modules.map((module) => [module.id, active.has(module.id)])),
    }
  }),
  showAll: () => set({ visible: Object.fromEntries(modules.map((module) => [module.id, true])) }),
  resetLayout: () => set({ layout: defaultLayout, visible: Object.fromEntries(modules.map((module) => [module.id, true])) }),
}), { name: 'lifeos:v2:dashboard' }))

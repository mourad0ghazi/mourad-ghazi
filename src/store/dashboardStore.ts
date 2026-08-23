import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GridItem } from '../types'
import { dashboardPresets, type DashboardPresetId } from '../data/dashboardPresets'
import { modules, type ModuleId } from '../data/modules'

interface WidgetSizing {
  h: number
  minW: number
  minH: number
}

/** Minimum readable dimensions on the 12-column desktop grid. */
const widgetSizing: Record<ModuleId, WidgetSizing> = {
  clock: { h: 4, minW: 4, minH: 4 },
  weather: { h: 4, minW: 4, minH: 4 },
  pomodoro: { h: 4, minW: 4, minH: 4 },
  tasks: { h: 6, minW: 5, minH: 6 },
  notes: { h: 6, minW: 4, minH: 5 },
  habits: { h: 6, minW: 5, minH: 6 },
  journal: { h: 6, minW: 4, minH: 5 },
  goals: { h: 5, minW: 4, minH: 5 },
  calendar: { h: 6, minW: 5, minH: 6 },
  finance: { h: 6, minW: 5, minH: 6 },
  expenses: { h: 6, minW: 5, minH: 6 },
  transactions: { h: 7, minW: 5, minH: 6 },
  budget: { h: 6, minW: 5, minH: 6 },
  savings: { h: 6, minW: 4, minH: 5 },
  simulator: { h: 7, minW: 6, minH: 6 },
  investments: { h: 6, minW: 5, minH: 6 },
  loan: { h: 7, minW: 4, minH: 6 },
}

const allVisible = () => Object.fromEntries(modules.map((module) => [module.id, true]))
const isModuleId = (id: string): id is ModuleId => modules.some((module) => module.id === id)

export function sortLayout(layout: readonly GridItem[]) {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x || a.i.localeCompare(b.i))
}

/**
 * Builds a dense professional desktop layout. Three cards fill the opening
 * row, followed by seven full two-card rows. Every row consumes all 12 columns.
 */
export function layoutForModules(priority: readonly ModuleId[]) {
  const order = [...new Set<ModuleId>([...priority, ...modules.map((module) => module.id)])]
  const layout: GridItem[] = []
  let cursor = 0
  let y = 0

  while (cursor < order.length) {
    const rowSize = cursor === 0 ? Math.min(3, order.length) : Math.min(2, order.length - cursor)
    const row = order.slice(cursor, cursor + rowSize)
    const width = Math.floor(12 / rowSize)
    const rowHeight = Math.max(...row.map((id) => widgetSizing[id].h))

    row.forEach((id, index) => {
      const sizing = widgetSizing[id]
      const isLast = index === row.length - 1
      const w = isLast ? 12 - width * index : width
      layout.push({ i: id, x: width * index, y, w, h: rowHeight, minW: sizing.minW, minH: sizing.minH })
    })

    cursor += rowSize
    y += rowHeight
  }

  return layout
}

export const defaultLayout: GridItem[] = layoutForModules(dashboardPresets[0].modules)

function normalizeItem(item: GridItem): GridItem | null {
  if (!isModuleId(item.i)) return null
  const sizing = widgetSizing[item.i]
  const minW = sizing.minW
  const minH = sizing.minH
  const w = Math.min(12, Math.max(minW, Math.round(Number(item.w) || minW)))
  const h = Math.max(minH, Math.round(Number(item.h) || minH))
  const x = Math.min(12 - w, Math.max(0, Math.round(Number(item.x) || 0)))
  const y = Math.max(0, Math.round(Number(item.y) || 0))
  return { i: item.i, x, y, w, h, minW, minH }
}

function normalizeLayout(layout: readonly GridItem[], fallback: readonly GridItem[] = defaultLayout) {
  const candidates = [...layout, ...fallback, ...defaultLayout]
  const seen = new Set<string>()
  const normalized: GridItem[] = []

  for (const candidate of candidates) {
    if (seen.has(candidate.i)) continue
    const item = normalizeItem(candidate)
    if (!item) continue
    seen.add(item.i)
    normalized.push(item)
  }

  return sortLayout(normalized)
}

function sameGeometry(a: readonly GridItem[], b: readonly GridItem[]) {
  if (a.length !== b.length) return false
  const byId = new Map(a.map((item) => [item.i, item]))
  return b.every((item) => {
    const current = byId.get(item.i)
    return current?.x === item.x && current.y === item.y && current.w === item.w && current.h === item.h
  })
}

/** Dense responsive layouts used below the 12-column desktop breakpoint. */
export function layoutForColumns(source: readonly GridItem[], columns: number) {
  const seen = new Set<string>()
  const ordered = sortLayout(source).flatMap((candidate) => {
    if (seen.has(candidate.i)) return []
    const item = normalizeItem(candidate)
    if (!item) return []
    seen.add(item.i)
    return [item]
  })
  const cardsPerRow = columns >= 8 ? 2 : 1
  const layout: GridItem[] = []
  let cursor = 0
  let y = 0

  while (cursor < ordered.length) {
    const rowSize = Math.min(cardsPerRow, ordered.length - cursor)
    const row = ordered.slice(cursor, cursor + rowSize)
    const width = Math.floor(columns / rowSize)
    const rowHeight = Math.max(...row.map((item) => widgetSizing[item.i as ModuleId].h))

    row.forEach((item, index) => {
      const isLast = index === row.length - 1
      const w = isLast ? columns - width * index : width
      layout.push({ i: item.i, x: width * index, y, w, h: rowHeight, minW: w, minH: widgetSizing[item.i as ModuleId].minH })
    })

    cursor += rowSize
    y += rowHeight
  }

  return layout
}

interface DashboardState {
  layout: GridItem[]
  visible: Record<string, boolean>
  editMode: boolean
  activePreset: DashboardPresetId | null
  setLayout: (layout: GridItem[]) => void
  reorderWidgets: (order: ModuleId[]) => void
  toggleWidget: (id: ModuleId) => void
  moveWidget: (id: ModuleId, direction: -1 | 1) => void
  setEditMode: (value: boolean) => void
  applyPreset: (id: DashboardPresetId) => void
  showAll: () => void
  resetLayout: () => void
}

export const useDashboardStore = create<DashboardState>()(persist((set) => ({
  layout: defaultLayout,
  visible: allVisible(),
  editMode: false,
  activePreset: 'essential',
  setLayout: (next) => set((state) => {
    const layout = normalizeLayout(next, state.layout)
    if (sameGeometry(layout, state.layout)) return state
    return { layout, activePreset: null }
  }),
  reorderWidgets: (order) => set({ layout: layoutForModules(order), activePreset: null }),
  toggleWidget: (id) => set((state) => ({ visible: { ...state.visible, [id]: !state.visible[id] }, activePreset: null })),
  moveWidget: (id, direction) => set((state) => {
    const order = sortLayout(state.layout).map((item) => item.i as ModuleId)
    const visibleOrder = order.filter((moduleId) => state.visible[moduleId] !== false)
    const visibleIndex = visibleOrder.indexOf(id)
    const targetId = visibleOrder[visibleIndex + direction]
    if (visibleIndex < 0 || !targetId) return state
    const first = order.indexOf(id)
    const second = order.indexOf(targetId)
    ;[order[first], order[second]] = [order[second], order[first]]
    return { layout: layoutForModules(order), activePreset: null }
  }),
  setEditMode: (editMode) => set({ editMode }),
  applyPreset: (id) => set(() => {
    const preset = dashboardPresets.find((item) => item.id === id) ?? dashboardPresets[0]
    return {
      editMode: true,
      activePreset: preset.id,
      layout: layoutForModules(preset.modules),
      visible: allVisible(),
    }
  }),
  showAll: () => set({ visible: allVisible(), activePreset: null }),
  resetLayout: () => set({ layout: defaultLayout, visible: allVisible(), editMode: false, activePreset: 'essential' }),
}), {
  name: 'lifeos:v2:dashboard',
  version: 3,
  partialize: (state) => ({ layout: state.layout, visible: state.visible, activePreset: state.activePreset }),
  migrate: (persisted, version) => {
    const previous = (persisted ?? {}) as Partial<Pick<DashboardState, 'layout' | 'visible' | 'activePreset'>>
    const visible = { ...allVisible(), ...previous.visible }
    const allEnabled = modules.every((module) => visible[module.id] !== false)
    return {
      layout: version < 3 ? defaultLayout : normalizeLayout(previous.layout ?? defaultLayout),
      visible,
      activePreset: version < 3 ? allEnabled ? 'essential' as const : null : previous.activePreset ?? null,
    }
  },
  merge: (persisted, current) => {
    const previous = (persisted ?? {}) as Partial<Pick<DashboardState, 'layout' | 'visible' | 'activePreset'>>
    return {
      ...current,
      ...previous,
      layout: normalizeLayout(previous.layout ?? defaultLayout),
      visible: { ...allVisible(), ...previous.visible },
      editMode: false,
    }
  },
}))

// ─────────────────────────────────────────────────────────────
// LifeOS – Store du dashboard (layout, visibilité des modules)
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutItem } from '../types';
import { initialDashboardSlice } from '../data/initialData';

interface DashboardState {
  layout: LayoutItem[];
  hidden: Record<string, boolean>;
  setLayout: (layout: LayoutItem[]) => void;
  resetLayout: () => void;
  toggleWidget: (id: string) => void;
  showAllWidgets: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialDashboardSlice,
      setLayout: (layout) => set({ layout }),
      resetLayout: () => set({ ...initialDashboardSlice }),
      toggleWidget: (id) =>
        set((s) => {
          const hidden = { ...s.hidden };
          if (hidden[id]) delete hidden[id];
          else hidden[id] = true;
          return { hidden };
        }),
      showAllWidgets: () => set({ hidden: {} }),
    }),
    { name: 'lifeos:v2:dashboard', version: 1 },
  ),
);

// ─────────────────────────────────────────────────────────────
// LifeOS – Stores (barrel)
// ─────────────────────────────────────────────────────────────

export { useSettingsStore } from './settingsStore';
export { useDashboardStore } from './dashboardStore';
export { useFinanceStore } from './financeStore';
export { selectMonthTotals, selectSpentByCategory } from './financeStore';
export { usePersonalStore } from './personalStore';
export { useChatbotStore } from './chatbotStore';
export { useUIStore } from './uiStore';
export { migrateFromV1 } from './migrate';

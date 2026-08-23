import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Check, CloudSun, FileSpreadsheet, Flame, Gift, LayoutTemplate, Move, Pencil, Sparkles, Wallet, X } from 'lucide-react'
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { layoutForColumns, monthTransactions, sortLayout, useDashboardStore, useFinanceStore, usePersonalStore, useSettingsStore, useUIStore } from '../../store'
import { dashboardPresets } from '../../data/dashboardPresets'
import { modules, type ModuleId } from '../../data/modules'
import { formatCurrency } from '../../utils/helpers'
import { useDateFormatter } from '../../utils/formatting'
import { Badge, Button, IconButton } from '../ui'
import { CalendarModule, ClockModule, PomodoroModule, WeatherModule } from '../modules/personal'
import { GoalsModule, HabitsModule, JournalModule, NotesModule, TasksModule } from '../modules/planner'
import { BudgetModule, ExpenseChartModule, FinanceSummaryModule, InvestmentsModule, LoanCalculatorModule, SavingsModule, SavingsSimulatorModule, TransactionsModule } from '../modules/finance'

const ResponsiveGrid = WidthProvider(Responsive)
const widgetMap: Record<ModuleId, ComponentType<{ extended?: boolean }>> = {
  clock: ClockModule,
  weather: WeatherModule,
  pomodoro: PomodoroModule,
  tasks: TasksModule,
  notes: NotesModule,
  habits: HabitsModule,
  journal: JournalModule,
  goals: GoalsModule,
  calendar: CalendarModule,
  finance: FinanceSummaryModule,
  expenses: ExpenseChartModule,
  transactions: TransactionsModule,
  budget: BudgetModule,
  savings: SavingsModule,
  simulator: SavingsSimulatorModule,
  investments: InvestmentsModule,
  loan: LoanCalculatorModule,
}

export function DashboardPage() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore((state) => state.update)
  const tasks = usePersonalStore((state) => state.tasks)
  const habits = usePersonalStore((state) => state.habits)
  const transactions = useFinanceStore((state) => state.transactions)
  const layout = useDashboardStore((state) => state.layout)
  const setLayout = useDashboardStore((state) => state.setLayout)
  const reorderWidgets = useDashboardStore((state) => state.reorderWidgets)
  const visible = useDashboardStore((state) => state.visible)
  const editMode = useDashboardStore((state) => state.editMode)
  const activePreset = useDashboardStore((state) => state.activePreset)
  const setEditMode = useDashboardStore((state) => state.setEditMode)
  const applyPreset = useDashboardStore((state) => state.applyPreset)
  const moveWidget = useDashboardStore((state) => state.moveWidget)
  const setView = useUIStore((state) => state.setView)
  const showToast = useUIStore((state) => state.showToast)
  const formatDate = useDateFormatter()
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 640px)').matches)
  const [breakpoint, setBreakpoint] = useState<'lg' | 'md' | 'sm' | 'xs' | 'xxs'>('lg')

  useEffect(() => {
    const media = matchMedia('(max-width: 640px)')
    const change = () => setMobile(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  const current = monthTransactions(transactions)
  const income = current.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0)
  const expense = current.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0)
  const active = tasks.filter((task) => task.status !== 'done').length
  const streak = Math.max(...habits.map((habit) => habit.streak), 0)
  const greeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'
  const money = (value: number) => formatCurrency(value, settings.currency, settings.hideAmounts, { fractionDigits: settings.amountDecimals, currencyDisplay: settings.currencyDisplay, language: settings.language })
  const orderedIds = useMemo(() => [...new Set<ModuleId>([
    ...sortLayout(layout).map((item) => item.i as ModuleId),
    ...modules.map((module) => module.id),
  ])].filter((id) => visible[id] !== false), [layout, visible])
  const children = useMemo(() => orderedIds.map((id) => {
    const Component = widgetMap[id]
    return <div key={id}><Component /></div>
  }), [orderedIds])
  const responsiveLayouts = useMemo(() => {
    const activeLayout = layout.filter((item) => visible[item.i] !== false)
    return {
      lg: layout as Layout[],
      md: layoutForColumns(activeLayout, 8) as Layout[],
      sm: layoutForColumns(activeLayout, 4) as Layout[],
      xs: layoutForColumns(activeLayout, 2) as Layout[],
      xxs: layoutForColumns(activeLayout, 1) as Layout[],
    }
  }, [layout, visible])
  const activeCount = Object.values(visible).filter(Boolean).length

  return <motion.div className="page dashboard-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <section className="welcome-banner">
      <div className="smoke-orb one"/><div className="smoke-orb two"/>
      <div className="welcome-copy"><Badge tone="free"><Gift size={12}/>TOUT EST GRATUIT</Badge><h1>{greeting}, {settings.profile.name.split(' ')[0]} <span>✦</span></h1><p>{formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><div className="daily-focus"><Sparkles size={15}/><span>Votre focus du jour</span><b>Avancer sur l’essentiel, sans oublier de respirer.</b></div></div>
      <div className="welcome-stats"><div><span className="stat-icon"><Wallet size={18}/></span><span><small>Solde ce mois</small><b>{money(income - expense)}</b></span><em>Mis à jour</em></div><div><span className="stat-icon"><Pencil size={18}/></span><span><small>Tâches actives</small><b>{active} tâches</b></span><em>{tasks.filter((task) => task.status === 'done').length} terminées</em></div><div><span className="stat-icon"><Flame size={18}/></span><span><small>Meilleure série</small><b>{streak} jours</b></span><em>Habitudes</em></div><button className="weather-chip"><CloudSun size={28}/><span><b>24°</b><small>{settings.profile.city} · Clair</small></span></button></div>
    </section>

    <div className="dashboard-toolbar"><div><h2>Votre espace</h2><p>{activeCount} modules actifs · Déplacement libre, dimensions ajustables sur grand écran</p></div><Button variant={editMode ? 'primary' : 'secondary'} onClick={() => setEditMode(!editMode)}>{editMode ? <X size={16}/> : <Pencil size={16}/>} {editMode ? 'Terminer' : 'Personnaliser'}</Button></div>

    {editMode && <motion.section className="customization-studio" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <header><span><Move size={18}/><span><b>Mode personnalisation actif</b><small>Saisissez la poignée du titre pour déplacer une carte. Sur grand écran, agrandissez-la depuis son coin inférieur droit.</small></span></span><button onClick={() => setEditMode(false)} aria-label="Fermer la personnalisation"><X size={17}/></button></header>
      <div className="customization-studio-body">
        <div className="preset-area"><b><LayoutTemplate size={15}/>Suggestions complètes · 17 modules</b><div className="dashboard-presets">{dashboardPresets.map((preset) => {
          const selected = activePreset === preset.id
          return <button key={preset.id} className={selected ? 'active' : ''} aria-pressed={selected} onClick={() => { applyPreset(preset.id); showToast(`Disposition « ${preset.label} » appliquée — aucun module masqué`) }}><span>{selected ? <Check size={15}/> : <LayoutTemplate size={15}/>}</span><b>{preset.label}</b><small>{preset.description}</small></button>
        })}</div></div>
        <div className="format-area"><b>Format des cartes</b><div className="density-buttons">{([
          ['compact', 'Compact'],
          ['comfortable', 'Confort'],
          ['spacious', 'Aéré'],
        ] as const).map(([id, label]) => <button key={id} className={settings.density === id ? 'active' : ''} onClick={() => updateSettings({ density: id })}>{label}</button>)}</div><button className="format-settings-link" onClick={() => { sessionStorage.setItem('lifeos:settings-section', 'locale'); setView('settings') }}>Formats des prix, dates et heures →</button></div>
      </div>
      <div className="mobile-order-editor"><b>Ordre des cartes</b>{orderedIds.map((id, index) => { const module = modules.find((item) => item.id === id); if (!module) return null; return <div key={id}><module.icon size={15}/><span>{module.label}</span><IconButton label={`Monter ${module.label}`} disabled={index === 0} onClick={() => moveWidget(id, -1)}><ArrowUp size={14}/></IconButton><IconButton label={`Descendre ${module.label}`} disabled={index === orderedIds.length - 1} onClick={() => moveWidget(id, 1)}><ArrowDown size={14}/></IconButton></div> })}</div>
    </motion.section>}

    {!mobile && <div className={`desktop-grid ${editMode ? 'editing' : ''}`}><ResponsiveGrid
      className="layout"
      layouts={responsiveLayouts}
      breakpoints={{ lg: 1100, md: 900, sm: 640, xs: 420, xxs: 0 }}
      cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
      rowHeight={54}
      margin={[16, 16]}
      compactType="vertical"
      isDraggable={editMode}
      isResizable={editMode && breakpoint === 'lg'}
      draggableHandle=".drag-handle"
      draggableCancel="button, input, textarea, select, a, [contenteditable='true']"
      resizeHandles={['se']}
      preventCollision={false}
      onBreakpointChange={(next) => setBreakpoint(next as typeof breakpoint)}
      onLayoutChange={(_, all) => { if (breakpoint === 'lg' && all.lg) setLayout(all.lg) }}
      onDragStop={(next) => {
        if (breakpoint !== 'lg') reorderWidgets(sortLayout(next).map((item) => item.i as ModuleId))
      }}
      useCSSTransforms
    >{children}</ResponsiveGrid></div>}
    {mobile && <div className="mobile-grid">{children}</div>}
    {activeCount === 0 && <div className="empty-dashboard"><Sparkles size={32}/><h3>Votre espace est vide</h3><p>Réactivez vos modules depuis la barre latérale.</p><Button onClick={() => useDashboardStore.getState().showAll()}>Tout afficher</Button></div>}
    <section className="free-cta excel-dashboard-cta"><span><FileSpreadsheet size={20}/></span><div><b>Personnalisez LifeOS depuis votre fichier Excel</b><p>LifeOS analyse vos feuilles, importe les prix et dates, puis adapte automatiquement les widgets.</p></div><Button variant="secondary" onClick={() => { sessionStorage.setItem('lifeos:open-tool', 'bank'); setView('tools') }}>Importer un fichier <span>→</span></Button></section>
  </motion.div>
}

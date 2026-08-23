import { motion } from 'framer-motion'
import { CloudSun, FileSpreadsheet, Flame, Gift, Pencil, Sparkles, Wallet, X } from 'lucide-react'
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useDashboardStore, useFinanceStore, usePersonalStore, useSettingsStore, useUIStore, monthTransactions } from '../../store'
import { formatCurrency } from '../../utils/helpers'
import { Badge, Button } from '../ui'
import { CalendarModule, ClockModule, PomodoroModule, WeatherModule } from '../modules/personal'
import { GoalsModule, HabitsModule, JournalModule, NotesModule, TasksModule } from '../modules/planner'
import { BudgetModule, ExpenseChartModule, FinanceSummaryModule, InvestmentsModule, LoanCalculatorModule, SavingsModule, SavingsSimulatorModule, TransactionsModule } from '../modules/finance'

const ResponsiveGrid = WidthProvider(Responsive)
const widgetMap: Record<string, ComponentType<{ extended?: boolean }>> = {
  clock: ClockModule, weather: WeatherModule, pomodoro: PomodoroModule, tasks: TasksModule, notes: NotesModule,
  habits: HabitsModule, journal: JournalModule, goals: GoalsModule, calendar: CalendarModule,
  finance: FinanceSummaryModule, expenses: ExpenseChartModule, transactions: TransactionsModule, budget: BudgetModule,
  savings: SavingsModule, simulator: SavingsSimulatorModule, investments: InvestmentsModule, loan: LoanCalculatorModule,
}

export function DashboardPage() {
  const profile = useSettingsStore((s) => s.profile), currency = useSettingsStore((s) => s.currency), hidden = useSettingsStore((s) => s.hideAmounts)
  const tasks = usePersonalStore((s) => s.tasks), habits = usePersonalStore((s) => s.habits)
  const transactions = useFinanceStore((s) => s.transactions)
  const layout = useDashboardStore((s) => s.layout), setLayout = useDashboardStore((s) => s.setLayout), visible = useDashboardStore((s) => s.visible), editMode = useDashboardStore((s) => s.editMode), setEditMode = useDashboardStore((s) => s.setEditMode)
  const setView = useUIStore((s) => s.setView), [mobile,setMobile]=useState(()=>matchMedia('(max-width: 640px)').matches)
  useEffect(()=>{const media=matchMedia('(max-width: 640px)'),change=()=>setMobile(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[])
  const current = monthTransactions(transactions), income = current.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), expense = current.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const active = tasks.filter((t) => t.status !== 'done').length, streak = Math.max(...habits.map((h) => h.streak), 0)
  const greeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'
  const children = useMemo(() => Object.entries(widgetMap).filter(([id]) => visible[id] !== false).map(([id, Component]) => <div key={id}><Component /></div>), [visible])
  return <motion.div className="page dashboard-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <section className="welcome-banner">
      <div className="smoke-orb one"/><div className="smoke-orb two"/>
      <div className="welcome-copy"><Badge tone="free"><Gift size={12}/>TOUT EST GRATUIT</Badge><h1>{greeting}, {profile.name.split(' ')[0]} <span>✦</span></h1><p>{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p><div className="daily-focus"><Sparkles size={15}/><span>Votre focus du jour</span><b>Avancer sur l’essentiel, sans oublier de respirer.</b></div></div>
      <div className="welcome-stats"><div><span className="stat-icon"><Wallet size={18}/></span><span><small>Solde ce mois</small><b>{formatCurrency(income - expense, currency, hidden)}</b></span><em>+12%</em></div><div><span className="stat-icon"><Pencil size={18}/></span><span><small>Tâches actives</small><b>{active} tâches</b></span><em>{tasks.filter((t) => t.status === 'done').length} terminées</em></div><div><span className="stat-icon"><Flame size={18}/></span><span><small>Meilleure série</small><b>{streak} jours</b></span><em>Lecture</em></div><button className="weather-chip"><CloudSun size={28}/><span><b>24°</b><small>Casablanca · Clair</small></span></button></div>
    </section>
    <div className="dashboard-toolbar"><div><h2>Votre espace</h2><p>{Object.values(visible).filter(Boolean).length} modules actifs · Modifiez tout selon vos besoins</p></div><Button variant={editMode ? 'primary' : 'secondary'} onClick={() => setEditMode(!editMode)}>{editMode ? <X size={16}/> : <Pencil size={16}/>} {editMode ? 'Terminer' : 'Personnaliser'}</Button></div>
    {editMode && <motion.div className="edit-hint" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><Pencil size={16}/><span><b>Mode personnalisation actif</b> — Glissez les cartes par leur en-tête et redimensionnez depuis le coin inférieur droit.</span><button onClick={() => setEditMode(false)}><X size={16}/></button></motion.div>}
    {!mobile&&<div className={`desktop-grid ${editMode ? 'editing' : ''}`}><ResponsiveGrid className="layout" layouts={{ lg: layout as Layout[] }} breakpoints={{ lg: 1100, md: 900, sm: 640, xs: 420, xxs: 0 }} cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }} rowHeight={54} margin={[16, 16]} compactType="vertical" isDraggable={editMode} isResizable={editMode} draggableHandle=".drag-handle" resizeHandles={['se']} onLayoutChange={(current, all) => { if (all.lg) setLayout(all.lg) }} useCSSTransforms>{children}</ResponsiveGrid></div>}
    {mobile&&<div className="mobile-grid">{children}</div>}
    {Object.values(visible).every((v) => !v) && <div className="empty-dashboard"><Sparkles size={32}/><h3>Votre espace est vide</h3><p>Réactivez vos modules depuis la barre latérale.</p><Button onClick={() => useDashboardStore.getState().showAll()}>Tout afficher</Button></div>}
    <section className="free-cta excel-dashboard-cta"><span><FileSpreadsheet size={20}/></span><div><b>Personnalisez LifeOS depuis votre fichier Excel</b><p>LifeOS analyse vos feuilles, importe vos données et adapte automatiquement les widgets du dashboard.</p></div><Button variant="secondary" onClick={() => { sessionStorage.setItem('lifeos:open-tool','bank');setView('tools') }}>Importer un fichier <span>→</span></Button></section>
  </motion.div>
}

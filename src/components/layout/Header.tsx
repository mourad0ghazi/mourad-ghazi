import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, ChevronDown, LockKeyhole, Menu, Moon, Plus, Search, Settings, Sun, X } from 'lucide-react'
import { monthTransactions, useFinanceStore, usePersonalStore, useSettingsStore, useUIStore } from '../../store'
import type { SearchResult, Theme } from '../../types'
import { formatCurrency, initials } from '../../utils/helpers'
import { Badge, IconButton } from '../ui'
import { Logo } from './Sidebar'

export function Header() {
  const [query, setQuery] = useState(''), [quickOpen, setQuickOpen] = useState(false), [profileOpen, setProfileOpen] = useState(false), [notificationsOpen, setNotificationsOpen] = useState(false)
  const setModal = useUIStore((s) => s.setModal), setView = useUIStore((s) => s.setView), setSidebarOpen = useUIStore((s) => s.setSidebarOpen), setLocked = useUIStore((s) => s.setLocked)
  const settings = useSettingsStore(), updateSettings = useSettingsStore((s) => s.update)
  const tasks = usePersonalStore((s) => s.tasks), notes = usePersonalStore((s) => s.notes), goals = usePersonalStore((s) => s.goals), events = usePersonalStore((s) => s.events)
  const transactions = useFinanceStore((s) => s.transactions), budgets = useFinanceStore((s) => s.budgets)
  const themeOrder: Theme[] = ['light', 'dark', 'auto']; const cycleTheme = () => updateSettings({ theme: themeOrder[(themeOrder.indexOf(settings.theme) + 1) % 3] })
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase(); if (!q) return []
    return [
      ...tasks.filter((x) => x.title.toLowerCase().includes(q)).map((x): SearchResult => ({ id: x.id, type: 'Tâche', title: x.title, subtitle: x.category, target: 'personal' })),
      ...notes.filter((x) => `${x.title} ${x.content}`.toLowerCase().includes(q)).map((x): SearchResult => ({ id: x.id, type: 'Note', title: x.title, subtitle: x.content.slice(0, 50), target: 'personal' })),
      ...transactions.filter((x) => `${x.title} ${x.category}`.toLowerCase().includes(q)).map((x): SearchResult => ({ id: x.id, type: 'Transaction', title: x.title, subtitle: formatCurrency(x.amount, settings.currency, settings.hideAmounts), target: 'finances' })),
      ...events.filter((x) => x.title.toLowerCase().includes(q)).map((x): SearchResult => ({ id: x.id, type: 'Événement', title: x.title, subtitle: x.date, target: 'personal' })),
      ...goals.filter((x) => x.title.toLowerCase().includes(q)).map((x): SearchResult => ({ id: x.id, type: 'Objectif', title: x.title, subtitle: `${x.progress}%`, target: 'personal' })),
    ].slice(0, 8)
  }, [query, tasks, notes, transactions, events, goals, settings.currency, settings.hideAmounts])
  const expenses = monthTransactions(transactions).filter((t) => t.type === 'expense')
  const alerts = settings.notifications && settings.budgetAlerts ? budgets.map((budget) => { const spent = expenses.filter((t) => t.category === budget.category).reduce((s, t) => s + t.amount, 0); return { ...budget, spent, percent: Math.round(spent / budget.planned * 100) } }).filter((x) => x.percent >= 80) : []
  const ThemeIcon = settings.theme === 'light' ? Sun : settings.theme === 'dark' ? Moon : Settings
  const quick = (modal: 'task' | 'transaction' | 'event') => { setModal(modal); setQuickOpen(false) }
  return <header className="topbar">
    <div className="topbar-left"><IconButton label="Ouvrir le menu" className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={21}/></IconButton><div className="topbar-logo"><Logo /></div></div>
    <div className="global-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher tâches, notes, transactions…" aria-label="Recherche globale"/><kbd>⌘ K</kbd>{query && <IconButton label="Effacer" onClick={() => setQuery('')}><X size={14}/></IconButton>}{query && <div className="search-results">{results.length ? results.map((result) => <button key={`${result.type}-${result.id}`} onClick={() => { setView(result.target); setQuery('') }}><Badge tone="neutral">{result.type}</Badge><span><b>{result.title}</b><small>{result.subtitle}</small></span></button>) : <p>Aucun résultat pour « {query} »</p>}</div>}</div>
    <div className="top-actions">
      <div className="popover-wrap"><button className="quick-add" onClick={() => setQuickOpen(!quickOpen)}><Plus size={18}/><span>Créer</span><ChevronDown size={14}/></button>{quickOpen && <div className="popover quick-menu"><button onClick={() => quick('task')}>Nouvelle tâche <kbd>⌘T</kbd></button><button onClick={() => { usePersonalStore.getState().addNote(); setView('personal'); setQuickOpen(false) }}>Nouvelle note <kbd>⌘N</kbd></button><button onClick={() => quick('event')}>Nouvel événement</button><button onClick={() => quick('transaction')}>Nouvelle transaction <kbd>⌘M</kbd></button></div>}</div>
      <IconButton label={`Thème ${settings.theme}`} onClick={cycleTheme}><ThemeIcon size={19}/></IconButton>
      <div className="popover-wrap"><IconButton label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={19}/>{alerts.length > 0 && <i className="notification-dot">{alerts.length}</i>}</IconButton>{notificationsOpen && <div className="popover notifications"><header><b>Notifications</b><Badge tone={alerts.length ? 'warning' : 'success'}>{alerts.length || 'À jour'}</Badge></header>{alerts.length ? alerts.map((alert) => <button key={alert.id} onClick={() => { setView('finances'); setNotificationsOpen(false) }}><span className={alert.percent > 100 ? 'danger-dot' : 'warning-dot'}><Bell size={15}/></span><span><b>{alert.category} à {alert.percent}%</b><small>{formatCurrency(alert.spent, settings.currency, settings.hideAmounts)} utilisés sur {formatCurrency(alert.planned, settings.currency, settings.hideAmounts)}</small></span></button>) : <div className="all-clear"><CheckCircle2/><b>Tout est sous contrôle</b><small>Aucune alerte budgétaire.</small></div>}</div>}</div>
      <div className="popover-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar">{settings.profile.avatar?<img src={settings.profile.avatar} alt=""/>:initials(settings.profile.name)}</span><span><b>{settings.profile.name.split(' ')[0]}</b><small>{settings.profile.city}</small></span><ChevronDown size={14}/></button>{profileOpen && <div className="popover profile-menu"><div><span className="avatar large">{settings.profile.avatar?<img src={settings.profile.avatar} alt=""/>:initials(settings.profile.name)}</span><span><b>{settings.profile.name}</b><small>{settings.profile.email}</small></span></div><button onClick={() => { setView('settings'); setProfileOpen(false) }}><Settings size={16}/>Paramètres</button><button onClick={() => { setLocked(true); setProfileOpen(false) }}><LockKeyhole size={16}/>Verrouiller LifeOS</button></div>}</div>
    </div>
  </header>
}

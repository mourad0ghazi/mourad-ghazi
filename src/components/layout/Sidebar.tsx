import { BarChart3, ChevronLeft, Gift, Heart, LayoutDashboard, RotateCcw, Settings, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { modules } from '../../data/modules'
import { useDashboardStore, useSettingsStore, useUIStore } from '../../store'
import type { View } from '../../types'
import { initials } from '../../utils/helpers'
import { Badge, IconButton, Toggle } from '../ui'

const navigation: { id: View; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { id: 'dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'finances', label: 'Finances', icon: BarChart3 },
  { id: 'finance-settings', label: 'Paramètres de finance', icon: SlidersHorizontal },
  { id: 'personal', label: 'Vie personnelle', icon: Heart },
  { id: 'tools', label: 'Outils gratuits', icon: Gift, badge: 'INCLUS' },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span><Sparkles size={18} /></span>{!compact && <div><strong>LifeOS</strong><small>PERSONAL SYSTEM</small></div>}</div>
}

export function Sidebar() {
  const view = useUIStore((s) => s.view), setView = useUIStore((s) => s.setView)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen), setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const visible = useDashboardStore((s) => s.visible), toggle = useDashboardStore((s) => s.toggleWidget), reset = useDashboardStore((s) => s.resetLayout)
  const editMode = useDashboardStore((s) => s.editMode), setEditMode = useDashboardStore((s) => s.setEditMode)
  const profile = useSettingsStore((s) => s.profile)
  const scrollTo = (id: string) => { if (view !== 'dashboard') setView('dashboard'); window.setTimeout(() => document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }
  return <><aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Navigation principale">
    <div className="sidebar-brand"><Logo /><IconButton label="Fermer la navigation" className="mobile-only" onClick={() => setSidebarOpen(false)}><X size={19}/></IconButton></div>
    <nav className="main-nav">{navigation.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><item.icon size={19}/><span>{item.label}</span>{item.badge && <Badge tone="free">{item.badge}</Badge>}</button>)}</nav>
    <div className="sidebar-divider" />
    <div className="edit-mode"><span><b>Personnaliser</b><small>Déplacer et redimensionner</small></span><Toggle checked={editMode} onChange={setEditMode} label="Mode personnalisation" /></div>
    <div className="module-section"><header><span>MODULES</span><button onClick={() => useDashboardStore.getState().showAll()}>Tout afficher</button></header><div className="module-list">{modules.map((item) => <div key={item.id}><button className="module-link" onClick={() => scrollTo(item.id)}><item.icon size={16}/><span>{item.label}</span></button><Toggle checked={visible[item.id] !== false} onChange={() => toggle(item.id)} label={`Afficher ${item.label}`} /></div>)}</div></div>
    <button className="reset-layout" onClick={() => { if (confirm('Réinitialiser la disposition du dashboard ?')) reset() }}><RotateCcw size={15}/>Réinitialiser la grille</button>
    <div className="sidebar-profile"><span className="avatar">{profile.avatar?<img src={profile.avatar} alt=""/>:initials(profile.name)}</span><div><b>{profile.name}</b><small>{profile.email}</small></div><ChevronLeft size={16}/></div>
  </aside>{sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}</>
}

import { BarChart3, Gift, Heart, LayoutDashboard, Settings } from 'lucide-react'
import type { View } from '../../types'
import { useUIStore } from '../../store'

const items: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { id: 'finances', label: 'Finances', icon: BarChart3 },
  { id: 'personal', label: 'Vie', icon: Heart },
  { id: 'tools', label: 'Outils', icon: Gift },
  { id: 'settings', label: 'Réglages', icon: Settings },
]
export function MobileNav() { const view = useUIStore((s) => s.view), setView = useUIStore((s) => s.setView); return <nav className="mobile-nav" aria-label="Navigation mobile">{items.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><item.icon size={19}/><span>{item.label}</span></button>)}</nav> }

// ─────────────────────────────────────────────────────────────
// LifeOS – Navigation mobile (barre basse, < 768px)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Gem, LayoutDashboard, LineChart, Settings as SettingsIcon, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUIStore } from '../../store';
import type { View } from '../../types';

const ITEMS: { view: View; icon: typeof LayoutDashboard; key: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, key: 'page.dashboard' },
  { view: 'finances', icon: LineChart, key: 'page.finances' },
  { view: 'personal', icon: UserRound, key: 'page.personal' },
  { view: 'settings', icon: SettingsIcon, key: 'page.settings' },
  { view: 'premium', icon: Gem, key: 'page.premium' },
];

export function MobileNav() {
  const { t } = useApp();
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);

  const navigate = (v: View) => {
    setView(v);
    try {
      window.location.hash = v === 'dashboard' ? '/dashboard' : `/${v}`;
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  };

  return (
    <nav className="mobile-nav" aria-label="Navigation mobile">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.view;
        return (
          <button key={item.view} className={`mobile-nav-item ${active ? 'active' : ''}`} onClick={() => navigate(item.view)} aria-label={t(item.key)}>
            <Icon size={19} />
            <span>{t(item.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}

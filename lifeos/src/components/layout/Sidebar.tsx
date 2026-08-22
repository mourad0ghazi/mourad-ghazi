// ─────────────────────────────────────────────────────────────
// LifeOS – Sidebar de navigation (v2)
// Pages (Dashboard / Finances / Vie perso / Paramètres / Premium)
// + visibilité des modules du dashboard (hash routing).
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  Eye,
  EyeOff,
  Gem,
  LayoutDashboard,
  LineChart,
  Pencil,
  PencilOff,
  Settings as SettingsIcon,
  UserRound,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MODULES, SECTION_TITLES, type NavSection } from '../../data/modules';
import { useDashboardStore, useUIStore } from '../../store';
import { rippleHandler } from '../ui';
import type { View, WidgetId } from '../../types';

const NAV_ITEMS: { view: View; icon: typeof LayoutDashboard; key: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, key: 'page.dashboard' },
  { view: 'finances', icon: LineChart, key: 'page.finances' },
  { view: 'personal', icon: UserRound, key: 'page.personal' },
  { view: 'settings', icon: SettingsIcon, key: 'page.settings' },
  { view: 'premium', icon: Gem, key: 'page.premium' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, state, isHidden, toggleWidget, showAllWidgets, showToast } = useApp();
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const setEditMode = useDashboardStore((s) => s.setEditMode);

  const navigate = (v: View) => {
    setView(v);
    try {
      window.location.hash = v === 'dashboard' ? '/dashboard' : `/${v}`;
    } catch {
      /* ignore */
    }
    onClose();
    window.scrollTo({ top: 0 });
  };

  const scrollToModule = (id: string) => {
    if (view !== 'dashboard') navigate('dashboard');
    onClose();
    window.setTimeout(() => {
      const el = document.getElementById(`widget-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('widget-pulse');
        void (el as HTMLElement).offsetWidth;
        el.classList.add('widget-pulse');
        window.setTimeout(() => el.classList.remove('widget-pulse'), 1600);
      } else {
        toggleWidget(id as WidgetId); // module masqué → on l'affiche
      }
    }, view !== 'dashboard' ? 450 : 0);
  };

  const sections: NavSection[] = ['personal', 'finance', 'premium'];
  const initials = state.profile.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div className={`menu-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Navigation">
        <div className="sidebar-brand">
          <span className="sidebar-logo">
            <LayoutDashboard size={20} />
          </span>
          <span>
            <span className="sb-name">{t('app.title')}</span>
            <br />
            <span className="sb-sub">{t('app.subtitle')}</span>
          </span>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label={t('act.close')}>
            <X size={15} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">NAV</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.view;
            return (
              <button
                key={item.view}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={(e) => {
                  rippleHandler(e);
                  navigate(item.view);
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{t(item.key)}</span>
                {item.view === 'premium' && <span className="badge warning" style={{ fontSize: 8.5 }}>⭐ {t('prem.badge')}</span>}
              </button>
            );
          })}

          {/* Mode édition de la grille (drag & drop) */}
          <button
            className={`nav-item ${isEditMode ? 'active' : ''}`}
            onClick={(e) => {
              rippleHandler(e);
              if (view !== 'dashboard') navigate('dashboard');
              setEditMode(!isEditMode);
              showToast(isEditMode ? t('grid.editOff') : t('grid.editOn'), isEditMode ? 'info' : 'success');
            }}
            title={t('grid.editHint')}
          >
            {isEditMode ? <Pencil size={16} /> : <PencilOff size={16} />}
            <span style={{ flex: 1 }}>{t('nav.customize')}</span>
            {isEditMode && <span className="badge accent" style={{ fontSize: 8.5 }}>ON</span>}
          </button>

          {sections.map((section) => (
            <div key={section} className="nav-section">
              <div className="nav-section-title">{t(SECTION_TITLES[section])}</div>
              {MODULES.filter((m) => m.section === section).map((m) => {
                const Icon = m.icon;
                const hidden = isHidden(m.id);
                return (
                  <button
                    key={m.id}
                    className={`nav-item ${hidden ? 'hidden-module' : ''}`}
                    onClick={(e) => {
                      rippleHandler(e);
                      scrollToModule(m.id);
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ flex: 1 }}>{t(m.tKey)}</span>
                    <span
                      className="ni-eye"
                      role="button"
                      title={hidden ? t('nav.show') : t('nav.hide')}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWidget(m.id);
                      }}
                    >
                      {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {Object.keys(state.hidden).length > 0 && (
            <button className="btn sm ghost" style={{ marginTop: 14, width: '100%' }} onClick={() => showAllWidgets()}>
              {t('nav.viewAll')}
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar">
              {state.profile.avatar ? <img src={state.profile.avatar} alt="" /> : initials}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="su-name">{state.profile.name}</span>
              <br />
              <span className="su-email">{state.profile.email}</span>
            </span>
          </div>
          <button className="nav-item" onClick={(e) => { rippleHandler(e); navigate('settings'); }}>
            <SettingsIcon size={16} />
            {t('nav.settings')}
          </button>
        </div>
      </aside>
    </>
  );
}

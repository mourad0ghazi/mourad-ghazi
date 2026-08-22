// ─────────────────────────────────────────────────────────────
// LifeOS – Sidebar de navigation (sections + visibilité modules)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Eye, EyeOff, LayoutDashboard, Settings as SettingsIcon, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MODULES, SECTION_TITLES, type NavSection } from '../../data/modules';
import { rippleHandler } from '../ui';
import type { WidgetId } from '../../types';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, state, isHidden, toggleWidget, showAllWidgets } = useApp();

  const scrollToModule = (id: string) => {
    onClose();
    const el = document.getElementById(`widget-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Pulse visuel
      el.classList.remove('widget-pulse');
      void (el as HTMLElement).offsetWidth;
      el.classList.add('widget-pulse');
      window.setTimeout(() => el.classList.remove('widget-pulse'), 1600);
    } else {
      // module masqué → on l'affiche
      toggleWidget(id as WidgetId);
    }
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
          <button className="nav-item" onClick={(e) => { rippleHandler(e); window.scrollTo({ top: 0, behavior: 'smooth' }); onClose(); }}>
            <LayoutDashboard size={16} />
            {t('nav.overview')}
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
                    onClick={(e) => { rippleHandler(e); scrollToModule(m.id); }}
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
          <button className="nav-item" onClick={(e) => { rippleHandler(e); onClose(); window.dispatchEvent(new CustomEvent('lifeos:open-settings')); }}>
            <SettingsIcon size={16} />
            {t('nav.settings')}
          </button>
        </div>
      </aside>
    </>
  );
}

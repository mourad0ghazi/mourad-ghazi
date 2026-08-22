// ─────────────────────────────────────────────────────────────
// LifeOS – Header : salutation, horloge temps réel, recherche
// globale, notifications, actions rapides, menu mobile
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Lock,
  Menu,
  Monitor,
  Moon,
  NotebookPen,
  Plus,
  Search,
  StickyNote,
  Sun,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatClock, formatDate, formatMoney, monthKey, todayISO } from '../../utils/helpers';
import { rippleHandler } from '../ui';
import type { WidgetId } from '../../types';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t, state, lang, updateSettings, addTask, addNote, addEvent, addTx, lockNow, showToast } = useApp();
  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const fmt = state.settings.dateFormat;
  const cur = state.settings.currency;

  useEffect(() => {
    const iv = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  // Parallax léger du décor du header
  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) parallaxRef.current.style.transform = `translateY(${Math.min(80, window.scrollY * 0.25)}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clic extérieur → fermer les popovers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour >= 5 && hour < 18 ? t('app.goodmorning') : t('app.goodevening');
  const firstName = state.profile.name.split(' ')[0];

  // ── Alertes budgétaires ──
  const alerts = useMemo(() => {
    if (!state.settings.budgetAlerts) return [];
    const thisMonth = monthKey(todayISO());
    const spentByCat = new Map<string, number>();
    state.transactions
      .filter((x) => x.type === 'expense' && monthKey(x.date) === thisMonth)
      .forEach((x) => spentByCat.set(x.category, (spentByCat.get(x.category) ?? 0) + x.amount));
    return state.budget
      .filter((c) => (spentByCat.get(c.name) ?? 0) > c.planned)
      .map((c) => ({ cat: c.name, over: (spentByCat.get(c.name) ?? 0) - c.planned }));
  }, [state.transactions, state.budget, state.settings.budgetAlerts]);

  // ── Recherche globale ──
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { type: string; icon: 'task' | 'note' | 'tx' | 'event' | 'goal' | 'habit'; title: string; sub: string; widget: WidgetId }[] = [];
    state.tasks.forEach((x) => {
      if (x.title.toLowerCase().includes(q)) out.push({ type: t('mod.tasks'), icon: 'task', title: x.title, sub: x.done ? t('tasks.done') : t('tasks.active'), widget: 'tasks' });
    });
    state.notes.forEach((x) => {
      if ((x.title + ' ' + x.content).toLowerCase().includes(q)) out.push({ type: t('mod.notes'), icon: 'note', title: x.title || x.content.slice(0, 40), sub: formatDate(x.updatedAt, fmt), widget: 'notes' });
    });
    state.transactions.forEach((x) => {
      if ((x.label + ' ' + x.category).toLowerCase().includes(q)) out.push({ type: t('mod.finance'), icon: 'tx', title: `${x.label} · ${formatMoney(x.amount, cur)}`, sub: formatDate(x.date, fmt), widget: 'finance' });
    });
    state.events.forEach((x) => {
      if (x.title.toLowerCase().includes(q)) out.push({ type: t('mod.calendar'), icon: 'event', title: x.title, sub: formatDate(x.date, fmt), widget: 'calendar' });
    });
    state.goals.forEach((x) => {
      if (x.title.toLowerCase().includes(q)) out.push({ type: t('mod.goals'), icon: 'goal', title: x.title, sub: `${x.progress}%`, widget: 'goals' });
    });
    state.habits.forEach((x) => {
      if (x.name.toLowerCase().includes(q)) out.push({ type: t('mod.habits'), icon: 'habit', title: x.name, sub: '', widget: 'habits' });
    });
    return out.slice(0, 8);
  }, [query, state, t, fmt, cur]);

  const goTo = (widget: WidgetId) => {
    setSearchOpen(false);
    setQuery('');
    const el = document.getElementById(`widget-${widget}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('widget-pulse');
      void (el as HTMLElement).offsetWidth;
      el.classList.add('widget-pulse');
      window.setTimeout(() => el.classList.remove('widget-pulse'), 1600);
    }
  };

  const quickActions = [
    {
      label: t('header.newTask'),
      icon: CheckSquare,
      run: () => {
        setQuickOpen(false);
        goTo('tasks');
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('lifeos:focus-tasks')), 650);
      },
    },
    {
      label: t('header.newNote'),
      icon: StickyNote,
      run: () => {
        addNote();
        setQuickOpen(false);
        goTo('notes');
      },
    },
    {
      label: t('header.newEvent'),
      icon: CalendarDays,
      run: () => {
        addEvent({ date: todayISO(), title: t('cal.addEvent'), color: '#495057' });
        setQuickOpen(false);
        showToast(t('toast.added'), 'success');
        goTo('calendar');
      },
    },
    {
      label: t('header.newTx'),
      icon: Wallet,
      run: () => {
        setQuickOpen(false);
        goTo('finance');
      },
    },
  ];

  const initials = state.profile.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="app-header">
      <span ref={parallaxRef} />
      <button className="icon-btn menu-btn" style={{ display: 'none' }} onClick={onOpenMenu} aria-label="Menu">
        <Menu size={17} />
      </button>
      <span className="avatar">
        {state.profile.avatar ? <img src={state.profile.avatar} alt="" /> : initials}
      </span>
      <div className="header-greeting">
        <small>{greeting} 👋</small>
        <strong>{firstName}</strong>
      </div>

      <div className="header-search" ref={searchRef}>
        <Search size={15} style={{ color: 'var(--text-muted)' }} />
        <input
          value={query}
          placeholder={t('header.search')}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          aria-label={t('header.search')}
        />
        {query ? (
          <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'grid' }} onClick={() => setQuery('')} aria-label={t('act.close')}>
            <X size={13} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
        {searchOpen && query.trim().length >= 2 && (
          <div className="search-results">
            {results.length === 0 ? (
              <div style={{ padding: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
                {t('header.searchNoResults')} « {query} »
              </div>
            ) : (
              results.map((r, i) => (
                <div key={i} className="search-result" onClick={() => goTo(r.widget)}>
                  <span className="sr-icon">
                    {r.icon === 'task' && <CheckSquare size={14} />}
                    {r.icon === 'note' && <StickyNote size={14} />}
                    {r.icon === 'tx' && <Wallet size={14} />}
                    {r.icon === 'event' && <CalendarDays size={14} />}
                    {r.icon === 'goal' && <NotebookPen size={14} />}
                    {r.icon === 'habit' && <Bell size={14} />}
                  </span>
                  <span className="sr-text">
                    <strong>{r.title}</strong>
                    <small>{r.type} · {r.sub}</small>
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="header-clock">
        <span className="hc-time">{formatClock(now, state.settings.timezone, locale)}</span>
        <span className="hc-date">{formatDate(todayISO(), fmt, locale)}</span>
      </div>

      <div className="header-actions">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label={t('header.notifications')}>
            <Bell size={16} />
            {alerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: 9.5,
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {alerts.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="search-results" style={{ width: 300, left: 'auto', right: 0 }}>
              {alerts.length === 0 ? (
                <div style={{ padding: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>{t('header.noNotif')}</div>
              ) : (
                alerts.map((a, i) => (
                  <div key={i} style={{ padding: '10px 12px', fontSize: 12.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--danger)' }}>⚠</span>
                    <span>
                      <strong>{a.cat}</strong> {t('budget.over')} {formatMoney(a.over, cur)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div style={{ position: 'relative' }} ref={quickRef}>
          <button className="icon-btn" onClick={() => setQuickOpen((o) => !o)} aria-label={t('header.quick')}>
            <Plus size={17} />
            <ChevronDown size={11} style={{ marginLeft: -2 }} />
          </button>
          {quickOpen && (
            <div className="search-results" style={{ width: 220, left: 'auto', right: 0 }}>
              {quickActions.map((a) => (
                <button key={a.label} className="search-result" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }} onClick={a.run}>
                  <span className="sr-icon"><a.icon size={14} /></span>
                  <span className="sr-text"><strong>{a.label}</strong></span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thème */}
        <button
          className="icon-btn"
          onClick={() =>
            updateSettings({
              theme: state.settings.theme === 'light' ? 'dark' : state.settings.theme === 'dark' ? 'auto' : 'light',
            })
          }
          aria-label={t('header.theme')}
        >
          {state.settings.theme === 'light' ? <Sun size={16} /> : state.settings.theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
        </button>

        {/* Verrouiller */}
        <button className="icon-btn" onClick={() => { if (state.settings.lockEnabled) lockNow(); else { updateSettings({ lockEnabled: true }); lockNow(); } }} aria-label={t('header.lock')}>
          <Lock size={15} />
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) { .menu-btn { display: grid !important; } }
      `}</style>
    </header>
  );
}

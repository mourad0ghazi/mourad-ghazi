// ─────────────────────────────────────────────────────────────
// LifeOS – Application principale
// Grille drag & drop (react-grid-layout), raccourcis clavier,
// skeleton de démarrage, écran de verrouillage, toasts.
// ─────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle, Lock, Delete } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Chatbot } from './components/chatbot/Chatbot';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { PremiumModal } from './components/premium';
import { useMediaQuery } from './components/ui';
import { ClockWidget, WeatherWidget, CalendarWidget, PomodoroWidget } from './components/modules/personal';
import { TasksWidget, NotesWidget, HabitsWidget, JournalWidget, GoalsWidget } from './components/modules/planner';
import { FinanceWidget, BudgetWidget } from './components/modules/finance';
import { SavingsWidget, InvestmentsWidget, LoanWidget } from './components/modules/finance2';
import { PremiumWidget } from './components/premium';
import type { LayoutItem, WidgetId } from './types';

const ResponsiveGrid = WidthProvider(Responsive);

/* ── Rendering des widgets ── */
function renderWidget(id: WidgetId) {
  switch (id) {
    case 'clock': return <ClockWidget id={id} />;
    case 'weather': return <WeatherWidget id={id} />;
    case 'calendar': return <CalendarWidget id={id} />;
    case 'tasks': return <TasksWidget id={id} />;
    case 'notes': return <NotesWidget id={id} />;
    case 'habits': return <HabitsWidget id={id} />;
    case 'journal': return <JournalWidget id={id} />;
    case 'goals': return <GoalsWidget id={id} />;
    case 'pomodoro': return <PomodoroWidget id={id} />;
    case 'finance': return <FinanceWidget id={id} />;
    case 'budget': return <BudgetWidget id={id} />;
    case 'savings': return <SavingsWidget id={id} />;
    case 'investments': return <InvestmentsWidget id={id} />;
    case 'loan': return <LoanWidget id={id} />;
    case 'premium': return <PremiumWidget id={id} />;
    default: return null;
  }
}

/* ── Toasts ── */
function Toasts() {
  const { toasts, dismissToast } = useApp();
  const icons = {
    info: <Info size={16} style={{ color: 'var(--info)' }} />,
    success: <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />,
    warning: <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />,
    error: <XCircle size={16} style={{ color: 'var(--danger)' }} />,
  };
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={() => dismissToast(toast.id)}
            role="status"
          >
            {icons[toast.type]}
            <span>{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Écran de verrouillage ── */
function LockScreen() {
  const { t, unlock } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    if (digit === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (unlock(next)) {
        setPin('');
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  return (
    <div className="lock-screen">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} style={{ textAlign: 'center' }}>
        <span className="sidebar-logo" style={{ width: 64, height: 64, borderRadius: 20, fontSize: 26, margin: '0 auto' }}>
          <Lock size={26} />
        </span>
        <h2 style={{ marginTop: 16 }}>{t('lock.title')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('lock.enter')}</p>
        <div className={`pin-dots ${error ? 'lock-shake' : ''}`} style={{ justifyContent: 'center', marginTop: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
          ))}
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: 12.5 }}>{t('lock.wrong')}</p>}
        <div className="pin-pad" style={{ marginTop: 18 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="pin-key" onClick={() => press(d)}>{d}</button>
          ))}
          <span />
          <button className="pin-key" onClick={() => press('0')}>0</button>
          <button className="pin-key del" onClick={() => press('del')} aria-label="Effacer">
            <Delete size={18} />
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 20, maxWidth: 300 }}>{t('lock.forgot')}</p>
      </motion.div>
    </div>
  );
}

/* ── Skeleton de démarrage ── */
function BootSkeleton() {
  return (
    <div className="app-content">
      <div className="boot-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="widget-card" style={{ gridColumn: 'span 4', height: 220, animation: 'none' }}>
            <div className="skeleton" style={{ width: 130, height: 18, marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 14, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
          </div>
        ))}
      </div>
      <style>{`
        .boot-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--gap); }
        @media (max-width: 1023px) { .boot-grid .widget-card { grid-column: span 6 !important; } }
        @media (max-width: 767px) { .boot-grid .widget-card { grid-column: span 12 !important; } }
      `}</style>
    </div>
  );
}

/* ── Dashboard (grille) ── */
function Dashboard() {
  const { state, setLayout, isHidden, t, updateSettings, lockNow } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  // RGL uniquement ≥ 1024px ; en dessous, cartes empilées (tablette & mobile)
  const isStacked = useMediaQuery('(max-width: 1023px)');

  // Skeleton de démarrage
  useEffect(() => {
    const iv = window.setTimeout(() => setBooted(true), 750);
    return () => window.clearTimeout(iv);
  }, []);

  // Raccourcis clavier globaux
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lifeos:focus-search'));
      } else if (e.key.toLowerCase() === 'n' && !e.shiftKey) {
        window.dispatchEvent(new CustomEvent('lifeos:focus-tasks'));
      } else if (e.key.toLowerCase() === 'n' && e.shiftKey) {
        window.dispatchEvent(new CustomEvent('lifeos:focus-note'));
      } else if (e.key.toLowerCase() === 't') {
        updateSettings({ theme: state.settings.theme === 'light' ? 'dark' : state.settings.theme === 'dark' ? 'auto' : 'light' });
      } else if (e.key.toLowerCase() === 'p') {
        window.dispatchEvent(new CustomEvent('lifeos:pomo-toggle'));
      } else if (e.key === '?') {
        setSettingsOpen(true);
      } else if (e.key.toLowerCase() === 'l') {
        if (state.settings.lockEnabled) lockNow();
        else { updateSettings({ lockEnabled: true }); lockNow(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.settings.theme, state.settings.lockEnabled, updateSettings, lockNow]);

  // Ouvrir les paramètres depuis la sidebar
  useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener('lifeos:open-settings', handler);
    return () => window.removeEventListener('lifeos:open-settings', handler);
  }, []);

  const visibleWidgets = useMemo(
    () => (Object.keys(renderWidgetMap()) as WidgetId[]).filter((id) => !isHidden(id)),
    [state.hidden, isHidden],
  );

  const layouts = useMemo(() => {
    const items = state.layout.filter((l) => visibleWidgets.includes(l.i as WidgetId));
    return { lg: items, md: items, sm: items, xs: items, xxs: items };
  }, [state.layout, visibleWidgets]);

  const rowHeight = state.settings.density === 'compact' ? 52 : state.settings.density === 'spacious' ? 68 : 58;
  const margin: [number, number] = state.settings.density === 'compact' ? [12, 12] : state.settings.density === 'spacious' ? [22, 22] : [16, 16];

  return (
    <div className="app-shell">
      <div className="smoke-overlay" aria-hidden="true" />
      <div className="app-bg-dots" aria-hidden="true" />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header onOpenMenu={() => setMenuOpen(true)} />

      <main className="app-main">
        <div className="app-content" id="dashboard-grid">
          {!booted ? (
            <BootSkeleton />
          ) : isStacked ? (
            /* ── Tablette & mobile : cartes empilées ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <AnimatePresence>
                {visibleWidgets.map((id) => (
                  <motion.div
                    key={id}
                    id={`widget-${id}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.08 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 26 }}
                  >
                    {renderWidget(id)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Desktop : grille drag & drop ── */
            <ResponsiveGrid
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1024 }}
              cols={{ lg: 12 }}
              rowHeight={rowHeight}
              margin={margin}
              containerPadding={[0, 0]}
              draggableHandle=".wh-card-titlebar"
              compactType="vertical"
              onLayoutChange={(_l, allLayouts) => {
                if (allLayouts.lg && allLayouts.lg.length > 0) {
                  setLayout(allLayouts.lg as LayoutItem[]);
                }
              }}
            >
              {visibleWidgets.map((id) => (
                <div key={id} id={`widget-${id}`} style={{ animation: `card-in .55s cubic-bezier(.22,1,.36,1) both`, animationDelay: `${Math.min(visibleWidgets.indexOf(id), 12) * 70}ms` }}>
                  <div className="widget-drag-hint">{t('misc.tip')} ↕</div>
                  {renderWidget(id)}
                </div>
              ))}
            </ResponsiveGrid>
          )}
        </div>
      </main>

      <Chatbot />
      <Toasts />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PremiumModal />

      <style>{`
        .widget-pulse { animation: widget-pulse 1.5s ease; }
        @keyframes widget-pulse {
          0%, 100% { box-shadow: var(--shadow-sm); }
          30% { box-shadow: 0 0 0 4px var(--accent-soft), var(--shadow-lg); }
        }
        .layout .react-grid-item > div { height: 100%; }
      `}</style>
    </div>
  );
}

/* ── Registre des widgets (ordre d'affichage) ── */
function renderWidgetMap(): Record<WidgetId, boolean> {
  return {
    clock: true,
    weather: true,
    finance: true,
    tasks: true,
    calendar: true,
    budget: true,
    pomodoro: true,
    habits: true,
    goals: true,
    notes: true,
    journal: true,
    savings: true,
    investments: true,
    loan: true,
    premium: true,
  };
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

function Root() {
  const { locked } = useApp();
  return (
    <AnimatePresence mode="wait">
      {locked ? <LockScreen key="lock" /> : <Dashboard key="app" />}
    </AnimatePresence>
  );
}

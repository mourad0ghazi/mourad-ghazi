// ─────────────────────────────────────────────────────────────
// LifeOS – Application principale (v2)
// Routage par pages (hash), raccourcis clavier (Ctrl+),
// skeleton de démarrage, écran de verrouillage, toasts,
// overlays globaux (chatbot, premium, fumée).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle, Lock, Delete } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { Chatbot } from './components/chatbot/Chatbot';
import { PremiumModal } from './components/premium';
import { SettingsContent } from './components/settings/SettingsPanel';
import { DashboardPage } from './components/pages/DashboardPage';
import { FinancePage } from './components/pages/FinancePage';
import { PersonalPage } from './components/pages/PersonalPage';
import { PremiumPage } from './components/pages/PremiumPage';
import { pageTransition, toastVariants } from './utils/animations';
import { useUIStore } from './store';
import type { View } from './types';

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
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
      if (unlock(next)) setPin('');
      else {
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

/* ── Shell applicatif ── */
function Shell() {
  const { state, t, updateSettings, lockNow } = useApp();
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const setFinanceTab = useUIStore((s) => s.setFinanceTab);
  const setPersonalTab = useUIStore((s) => s.setPersonalTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  // Skeleton de démarrage
  useEffect(() => {
    const iv = window.setTimeout(() => setBooted(true), 750);
    return () => window.clearTimeout(iv);
  }, []);

  // Hash routing : #/finances, #/personal, #/premium, #/settings
  useEffect(() => {
    const parse = () => {
      const h = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      const valid: View[] = ['dashboard', 'finances', 'personal', 'premium', 'settings'];
      if (valid.includes(h as View) && h !== view) setView(h as View);
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, [view, setView]);

  // Raccourcis clavier globaux (Ctrl+)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lifeos:focus-search'));
      } else if (mod && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setView('personal');
        setPersonalTab('tasks');
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('lifeos:focus-tasks')), 450);
      } else if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lifeos:focus-note'));
      } else if (mod && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setView('finances');
        setFinanceTab('transactions');
      } else if (mod && e.key.toLowerCase() === 'l' && e.shiftKey) {
        e.preventDefault();
        updateSettings({ theme: state.settings.theme === 'light' ? 'dark' : state.settings.theme === 'dark' ? 'auto' : 'light' });
      } else if (mod && e.key === ',') {
        e.preventDefault();
        setView('settings');
      } else if (mod && e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lifeos:chat-toggle'));
      } else if (mod && e.key === '?') {
        e.preventDefault();
        setView('settings');
      } else if (!mod && !typing && e.key.toLowerCase() === 'p') {
        window.dispatchEvent(new CustomEvent('lifeos:pomo-toggle'));
      } else if (!mod && !typing && e.key.toLowerCase() === 'l') {
        if (state.settings.lockEnabled) lockNow();
        else {
          updateSettings({ lockEnabled: true });
          lockNow();
        }
      } else if (!mod && !typing && e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lifeos:focus-search'));
      } else if (!mod && !typing && e.key.toLowerCase() === 'n') {
        window.dispatchEvent(new CustomEvent('lifeos:focus-tasks'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.settings.theme, state.settings.lockEnabled, updateSettings, lockNow, setView, setFinanceTab, setPersonalTab]);

  // Ouvrir les paramètres depuis la sidebar (compat)
  useEffect(() => {
    const handler = () => setView('settings');
    window.addEventListener('lifeos:open-settings', handler);
    return () => window.removeEventListener('lifeos:open-settings', handler);
  }, [setView]);

  const pages: Record<View, React.ReactNode> = {
    dashboard: <DashboardPage />,
    finances: <FinancePage />,
    personal: <PersonalPage />,
    premium: <PremiumPage />,
    settings: (
      <div className="page-wrap">
        <div className="page-head">
          <h1>{t('set.title')}</h1>
        </div>
        <div className="widget-card">
          <SettingsContent />
        </div>
      </div>
    ),
  };

  return (
    <div className="app-shell">
      {state.settings.animations.smoke && <div className="smoke-overlay" aria-hidden="true" />}
      <div className="app-bg-dots" aria-hidden="true" />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header onOpenMenu={() => setMenuOpen(true)} />

      <main className="app-main">
        <div className="app-content">
          {!booted ? (
            <BootSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                variants={pageTransition}
                initial={state.settings.animations.page ? 'initial' : false}
                animate="animate"
                exit={state.settings.animations.page ? 'exit' : undefined}
              >
                {pages[view]}
              </motion.div>
            </AnimatePresence>
          )}
          <Footer />
        </div>
      </main>

      <MobileNav />
      <Chatbot />
      <Toasts />
      <PremiumModal />
    </div>
  );
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
  return <AnimatePresence mode="wait">{locked ? <LockScreen key="lock" /> : <Shell key="app" />}</AnimatePresence>;
}

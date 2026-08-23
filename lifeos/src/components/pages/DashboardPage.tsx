// ─────────────────────────────────────────────────────────────
// LifeOS – Page Dashboard (v2)
// Bannière d'accueil (gradient smoke + parallax + mini-stats)
// + grille drag & drop des modules.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, Flame, GripVertical, PencilOff, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMediaQuery } from '../ui';
import { useDashboardStore } from '../../store';
import { formatClock, formatMoney, lastNDays, monthKey, todayISO } from '../../utils/helpers';
import { ClockWidget, WeatherWidget, CalendarWidget, PomodoroWidget } from '../modules/personal';
import { TasksWidget, NotesWidget, HabitsWidget, JournalWidget, GoalsWidget } from '../modules/planner';
import { FinanceWidget, BudgetWidget } from '../modules/finance';
import { SavingsWidget, InvestmentsWidget, LoanWidget } from '../modules/finance2';
import { FeaturesWidget } from '../premium';
import type { LayoutItem, WidgetId } from '../../types';

const ResponsiveGrid = WidthProvider(Responsive);

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
    case 'premium': return <FeaturesWidget id={id} />;
    default: return null;
  }
}

const WIDGET_ORDER: WidgetId[] = [
  'clock', 'weather', 'finance', 'tasks', 'calendar', 'budget', 'pomodoro',
  'habits', 'goals', 'notes', 'journal', 'savings', 'investments', 'loan', 'premium',
];

/* ── Bannière d'accueil ── */
function WelcomeBanner() {
  const { t, state, lang } = useApp();
  const [now, setNow] = useState(new Date());
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!state.settings.animations.parallax) return;
    const onScroll = () => {
      if (parallaxRef.current) parallaxRef.current.style.transform = `translateY(${Math.min(60, window.scrollY * 0.18)}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [state.settings.animations.parallax]);

  const hour = now.getHours();
  const greeting = hour >= 5 && hour < 18 ? t('app.goodmorning') : t('app.goodevening');
  const firstName = state.profile.name.split(' ')[0];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const cur = state.settings.currency;

  const thisMonth = monthKey(todayISO());
  const monthTx = state.transactions.filter((x) => monthKey(x.date) === thisMonth);
  const balance =
    monthTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0) -
    monthTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
  const tasksLeft = state.tasks.filter((x) => !x.done).length;
  const days = lastNDays(7);
  const bestStreak = state.habits.reduce((best, h) => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (h.days[days[i]]) streak++;
      else break;
    }
    return Math.max(best, streak);
  }, 0);

  let dateLabel = '';
  try {
    dateLabel = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: state.settings.timezone });
  } catch {
    dateLabel = now.toLocaleDateString(locale);
  }

  return (
    <motion.div
      className="welcome-banner"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wb-smoke" ref={parallaxRef} aria-hidden="true" />
      <div className="wb-content">
        <div>
          <div className="wb-greeting">
            {greeting}, <strong>{firstName}</strong> 👋
          </div>
          <div className="wb-date">{dateLabel} · {formatClock(now, state.settings.timezone, locale)}</div>
          <div className="wb-quote">{t('welcome.quote')}</div>
          <div className="wb-sub">{t('welcome.sub')}</div>
        </div>
        <div className="wb-stats">
          <div className="wb-stat">
            <Wallet size={15} style={{ color: 'var(--accent)' }} />
            <span>
              <span className="wb-stat-value">{formatMoney(balance, cur, { compact: true, sign: true })}</span>
              <span className="wb-stat-label">{t('welcome.balance')}</span>
            </span>
          </div>
          <div className="wb-stat">
            <CheckSquare size={15} style={{ color: 'var(--accent)' }} />
            <span>
              <span className="wb-stat-value">{tasksLeft}</span>
              <span className="wb-stat-label">{t('welcome.tasks')}</span>
            </span>
          </div>
          <div className="wb-stat">
            <Flame size={15} style={{ color: 'var(--accent)' }} />
            <span>
              <span className="wb-stat-value">{bestStreak} 🔥</span>
              <span className="wb-stat-label">{t('welcome.streak')}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page Dashboard ── */
export function DashboardPage() {
  const { state, setLayout, isHidden, t } = useApp();
  const isStacked = useMediaQuery('(max-width: 1023px)');
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const setEditMode = useDashboardStore((s) => s.setEditMode);

  const visibleWidgets = useMemo(
    () => WIDGET_ORDER.filter((id) => !isHidden(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.hidden],
  );

  const layouts = useMemo(() => {
    const items = state.layout.filter((l) => visibleWidgets.includes(l.i as WidgetId));
    return { lg: items };
  }, [state.layout, visibleWidgets]);

  const rowHeight = state.settings.density === 'compact' ? 52 : state.settings.density === 'spacious' ? 68 : 58;
  const margin: [number, number] = state.settings.density === 'compact' ? [12, 12] : state.settings.density === 'spacious' ? [22, 22] : [16, 16];

  return (
    <>
      <WelcomeBanner />
      {isStacked ? (
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
        <div className={`grid-wrap ${isEditMode ? 'grid-editing' : ''}`}>
          {isEditMode && (
            <motion.div
              className="grid-edit-hint"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <GripVertical size={13} />
              <span>{t('grid.editHint')}</span>
              <button className="btn sm primary" onClick={() => setEditMode(false)}>
                <PencilOff size={12} /> {t('grid.editDone')}
              </button>
            </motion.div>
          )}
          <ResponsiveGrid
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1024 }}
            cols={{ lg: 12 }}
            rowHeight={rowHeight}
            margin={margin}
            containerPadding={[0, 0]}
            draggableHandle=".wh-card-titlebar"
            isDraggable={isEditMode}
            isResizable={isEditMode}
            resizeHandles={['se']}
            compactType="vertical"
            onLayoutChange={(_l, allLayouts) => {
              if (allLayouts.lg && allLayouts.lg.length > 0) setLayout(allLayouts.lg as LayoutItem[]);
            }}
          >
            {visibleWidgets.map((id) => (
              <div key={id} id={`widget-${id}`}>
                <div className="widget-drag-hint">{t('misc.tip')} ↕</div>
                {renderWidget(id)}
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </>
  );
}

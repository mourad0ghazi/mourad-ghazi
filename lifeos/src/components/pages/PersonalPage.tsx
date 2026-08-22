// ─────────────────────────────────────────────────────────────
// LifeOS – Page Vie personnelle (v2)
// Onglets : Tâches (liste + Kanban) / Calendrier / Notes /
// Habitudes (grille + mensuel) / Journal / Objectifs
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CalendarDays, CheckSquare, NotebookPen, StickyNote, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUIStore } from '../../store';
import { CalendarWidget } from '../modules/personal';
import { TasksWidget, NotesWidget, HabitsWidget, JournalWidget, GoalsWidget } from '../modules/planner';
import { TaskKanban, HabitMonthly } from '../modules/extended';
import { rippleHandler } from '../ui';

const TABS = [
  { id: 'tasks', icon: CheckSquare, key: 'page.tasks' },
  { id: 'calendar', icon: CalendarDays, key: 'page.calendar' },
  { id: 'notes', icon: StickyNote, key: 'page.notes' },
  { id: 'habits', icon: Activity, key: 'page.habits' },
  { id: 'journal', icon: NotebookPen, key: 'page.journal' },
  { id: 'goals', icon: Target, key: 'page.goals' },
];

export function PersonalPage() {
  const { t } = useApp();
  const tab = useUIStore((s) => s.personalTab);
  const setTab = useUIStore((s) => s.setPersonalTab);

  return (
    <div className="page-wrap">
      <div className="page-head">
        <h1>{t('page.personal')}</h1>
        <div className="page-tabs">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            return (
              <button key={tb.id} className={`page-tab ${tab === tb.id ? 'active' : ''}`} onClick={(e) => { rippleHandler(e); setTab(tb.id); }}>
                <Icon size={14} />
                {t(tb.key)}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {tab === 'tasks' && (
          <div className="page-grid-2">
            <TasksWidget id="tasks" />
            <TaskKanban id="tasks" />
          </div>
        )}
        {tab === 'calendar' && (
          <div className="page-grid-1" style={{ maxWidth: 980, margin: '0 auto' }}>
            <CalendarWidget id="calendar" />
          </div>
        )}
        {tab === 'notes' && <NotesWidget id="notes" />}
        {tab === 'habits' && (
          <div className="page-grid-2">
            <HabitsWidget id="habits" />
            <HabitMonthly id="habits" />
          </div>
        )}
        {tab === 'journal' && (
          <div className="page-grid-1" style={{ maxWidth: 980, margin: '0 auto' }}>
            <JournalWidget id="journal" />
          </div>
        )}
        {tab === 'goals' && <GoalsWidget id="goals" />}
      </motion.div>
    </div>
  );
}

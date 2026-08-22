// ─────────────────────────────────────────────────────────────
// LifeOS – Modules "Organisation" : Tâches, Notes, Habitudes,
// Journal, Objectifs SMART
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BookOpen,
  Brain,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Download,
  Droplets,
  Lock,
  Moon,
  NotebookPen,
  Pencil,
  Plus,
  Smile,
  StickyNote,
  Target,
  Trash2,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog, EmptyState, Modal, ProgressBar, WidgetHead, rippleHandler } from '../ui';
import { daysUntil, downloadCSV, formatDate, lastNDays, parseISODate, percent, todayISO } from '../../utils/helpers';
import type { Priority, WidgetId } from '../../types';

const fmt = (lang: string) => (lang === 'fr' ? 'fr-FR' : 'en-US');

/* ══════════════ TÂCHES ══════════════ */
const PRIORITY_META: Record<Priority, { cls: string; key: string; color: string }> = {
  low: { cls: 'neutral', key: 'tasks.pLow', color: 'var(--text-muted)' },
  medium: { cls: 'info', key: 'tasks.pMedium', color: 'var(--info)' },
  high: { cls: 'danger', key: 'tasks.pHigh', color: 'var(--danger)' },
  urgent: { cls: 'warning', key: 'tasks.pUrgent', color: 'var(--warning)' },
};

export function TasksWidget({ id }: { id: WidgetId }) {
  const { t, state, addTask, updateTask, deleteTask, setTaskStatus, reorderTasks, addSubtask, toggleSubtask, deleteSubtask } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [text, setText] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subText, setSubText] = useState<string>('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ordre = ordre personnalisé de l'utilisateur (réordonnable par drag & drop).
  // Les tâches terminées sont regroupées en fin de liste.
  const list = useMemo(() => {
    const base = [...state.tasks];
    const active = base.filter((x) => !x.done);
    const done = base.filter((x) => x.done);
    if (filter === 'active') return active;
    if (filter === 'done') return done;
    return [...active, ...done];
  }, [state.tasks, filter]);

  // Raccourci clavier / action rapide : focus sur le champ "nouvelle tâche"
  useEffect(() => {
    const handler = () => {
      setFilter('all');
      inputRef.current?.focus();
    };
    window.addEventListener('lifeos:focus-tasks', handler);
    return () => window.removeEventListener('lifeos:focus-tasks', handler);
  }, []);

  const doneCount = state.tasks.filter((x) => x.done).length;

  const submit = () => {
    const title = text.trim();
    if (!title) return;
    addTask({ title, priority: 'medium' });
    setText('');
  };

  const setPriority = (id: string, p: Priority) => updateTask(id, { priority: p });

  const exportCsv = () => {
    downloadCSV(
      `lifeos-tasks-${todayISO()}.csv`,
      list.map((x) => ({
        title: x.title,
        status: x.status,
        priority: x.priority,
        due: x.due ?? '',
        tags: x.tags.join(';'),
        subtasks_done: `${x.subtasks.filter((s) => s.done).length}/${x.subtasks.length}`,
      })),
    );
  };

  // Réordonnancement par drag & drop (HTML5) — réordonne le tableau de stockage
  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    // Reconstruit l'ordre global : actives (dans l'ordre du store) + terminées
    const activeIds = state.tasks.filter((x) => !x.done).map((x) => x.id);
    const fromId = list[dragIndex].id;
    const toId = list[targetIndex].id;
    const fromIdx = activeIds.indexOf(fromId);
    const toIdx = activeIds.indexOf(toId);
    if (fromIdx >= 0 && toIdx >= 0) {
      const [moved] = activeIds.splice(fromIdx, 1);
      activeIds.splice(toIdx, 0, moved);
      const byId = new Map(state.tasks.map((x) => [x.id, x]));
      const newOrder = [
        ...activeIds.map((id) => byId.get(id)!),
        ...state.tasks.filter((x) => x.done),
      ];
      reorderTasks(newOrder);
    }
    setDragIndex(null);
  };

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<CheckSquare size={17} />}
        title={t('mod.tasks')}
        sub={`${doneCount}/${state.tasks.length} ${t('tasks.completed')}`}
        actions={
          <button className="btn sm" onClick={(e) => { rippleHandler(e); exportCsv(); }} title={t('tasks.exportCsv')}>
            <Download size={13} />
          </button>
        }
      />
      <div className="widget-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            ref={inputRef}
            className="input"
            placeholder={t('tasks.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
          <button className="btn primary" style={{ padding: '0 12px' }} onClick={submit} aria-label={t('tasks.new')}>
            <Plus size={16} />
          </button>
        </div>
        <div className="seg-group" style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
          {(['all', 'active', 'done'] as const).map((f) => (
            <button key={f} className={`seg-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {t(`tasks.${f}`)}
            </button>
          ))}
        </div>
        <div className="scroll-y" style={{ flex: 1, minHeight: 120 }}>
          {list.length === 0 && (
            <EmptyState icon={<CheckSquare size={22} />} text={t('tasks.empty')} />
          )}
          {list.map((task, i) => {
            const overdue = !task.done && task.due && task.due < todayISO();
            const isExpanded = expanded === task.id;
            return (
              <div
                key={task.id}
                className="list-item"
                style={{ opacity: task.done ? 0.55 : 1, cursor: 'grab' }}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                onDragEnd={() => setDragIndex(null)}
              >
                <button
                  className={`checkbox ${task.done ? 'on' : ''}`}
                  onClick={() => {
                    updateTask(task.id, { done: !task.done });
                    setTaskStatus(task.id, task.done ? 'todo' : 'done');
                  }}
                  aria-label="toggle"
                >
                  {task.done && <CheckSquare size={12} />}
                </button>
                <div className="li-main">
                  <div className="li-title" style={{ textDecoration: task.done ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>{task.title}</span>
                    {task.subtasks.length > 0 && (
                      <span className="badge neutral" style={{ fontSize: 9, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : task.id)}>
                        {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} {t('tasks.subtasks').toLowerCase()} {isExpanded ? '▴' : '▾'}
                      </span>
                    )}
                    {task.tags.map((tag) => (
                      <span key={tag} className="badge accent" style={{ fontSize: 9 }}>#{tag}</span>
                    ))}
                  </div>
                  {task.due && (
                    <div className="li-sub" style={{ color: overdue ? 'var(--danger)' : undefined }}>
                      <CalendarClock size={10} style={{ verticalAlign: -1 }} /> {formatDate(task.due, state.settings.dateFormat)}
                      {overdue && ` · ${t('tasks.overdue')}`}
                    </div>
                  )}
                  {isExpanded && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {task.subtasks.map((st) => (
                        <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <button className={`checkbox ${st.done ? 'on' : ''}`} style={{ width: 15, height: 15, borderRadius: 5 }} onClick={() => toggleSubtask(task.id, st.id)} aria-label="toggle subtask">
                            {st.done && <CheckSquare size={9} />}
                          </button>
                          <span style={{ flex: 1, textDecoration: st.done ? 'line-through' : 'none', color: 'var(--text-soft)' }}>{st.title}</span>
                          <button className="icon-btn" style={{ width: 18, height: 18, opacity: 0.35 }} onClick={() => deleteSubtask(task.id, st.id)} aria-label={t('act.delete')}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="input"
                          style={{ height: 26, fontSize: 11.5 }}
                          placeholder={t('tasks.subtaskPh')}
                          value={subText}
                          onChange={(e) => setSubText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && subText.trim()) {
                              addSubtask(task.id, subText.trim());
                              setSubText('');
                            }
                          }}
                        />
                        <button
                          className="btn sm"
                          onClick={() => {
                            if (subText.trim()) {
                              addSubtask(task.id, subText.trim());
                              setSubText('');
                            }
                          }}
                          aria-label={t('act.add')}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <div className="seg-group" style={{ padding: 2 }}>
                    {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                      <button
                        key={p}
                        className="seg-btn"
                        title={t(PRIORITY_META[p].key)}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          padding: 0,
                          background: p === task.priority ? PRIORITY_META[p].color : 'var(--border)',
                        }}
                        onClick={() => setPriority(task.id, p)}
                      />
                    ))}
                  </div>
                  <button className="icon-btn" style={{ width: 26, height: 26, opacity: 0.45 }} onClick={() => setConfirmId(task.id)} aria-label={t('act.delete')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8 }}>{t('tasks.dragHint')}</div>
      </div>
      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteTask(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ NOTES ══════════════ */
export function NotesWidget({ id }: { id: WidgetId }) {
  const { t, state, addNote, updateNote, deleteNote } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => addNote();
    window.addEventListener('lifeos:focus-note', handler);
    return () => window.removeEventListener('lifeos:focus-note', handler);
  }, [addNote]);

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<StickyNote size={17} />}
        title={t('mod.notes')}
        sub={t('notes.autosave')}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); addNote(); }} aria-label={t('notes.new')}>
            <Plus size={16} />
          </button>
        }
      />
      <div className="widget-body scroll-y" style={{ gap: 10 }}>
        {state.notes.length === 0 && <EmptyState icon={<StickyNote size={22} />} text={t('notes.empty')} />}
        {state.notes.map((note) => (
          <div key={note.id} className="note-card">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="note-title-input"
                value={note.title}
                placeholder={t('notes.titlePh')}
                onChange={(e) => updateNote(note.id, { title: e.target.value })}
              />
              <button className="icon-btn" style={{ width: 24, height: 24, opacity: 0.4 }} onClick={() => setConfirmId(note.id)} aria-label={t('act.delete')}>
                <Trash2 size={12} />
              </button>
            </div>
            <textarea
              className="note-content-input"
              value={note.content}
              placeholder={t('notes.contentPh')}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
            />
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              {t('notes.updated')} {formatDate(note.updatedAt, state.settings.dateFormat)}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteNote(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ HABITUDES ══════════════ */
const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  book: BookOpen,
  brain: Brain,
  droplets: Droplets,
  moon: Moon,
  target: Target,
  pencil: Pencil,
};

export function HabitsWidget({ id }: { id: WidgetId }) {
  const { t, state, addHabit, deleteHabit, cycleHabitDay } = useApp();
  const [name, setName] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const days = lastNDays(7);

  const streakOf = (habitId: string) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return 0;
    let streak = 0;
    let d = todayISO();
    if (!habit.days[d]) d = days[days.length - 2];
    for (let i = days.length - 1; i >= 0; i--) {
      if (habit.days[days[i]]) streak++;
      else if (days[i] < d) break;
    }
    return streak;
  };

  const submit = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), icon: 'activity', color: '#6c757d' });
    setName('');
  };

  return (
    <div className="widget-card">
      <WidgetHead icon={<Activity size={17} />} title={t('mod.habits')} sub={t('habits.week')} />
      <div className="widget-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            className="input"
            placeholder={t('habits.new')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="btn primary" style={{ padding: '0 12px' }} onClick={submit} aria-label={t('habits.new')}>
            <Plus size={16} />
          </button>
        </div>
        {state.habits.length === 0 && <EmptyState icon={<Activity size={22} />} text={t('habits.empty')} />}
        <div className="habit-grid scroll-y" style={{ flex: 1, minHeight: 120 }}>
          {state.habits.map((habit) => {
            const Icon = HABIT_ICON_MAP[habit.icon] ?? Activity;
            const streak = streakOf(habit.id);
            const best = Object.keys(habit.days).length;
            return (
              <div key={habit.id} className="habit-row">
                <span className="hr-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} style={{ color: habit.color, flex: 'none' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{habit.name}</span>
                </span>
                <div className="habit-days">
                  {days.map((d) => {
                    const done = Boolean(habit.days[d]);
                    const missed = Boolean(habit.missed[d]);
                    const isToday = d === todayISO();
                    const dowLabel = parseISODate(d).toLocaleDateString(fmt(state.settings.lang), { weekday: 'short' }).slice(0, 1).toUpperCase();
                    return (
                      <button
                        key={d}
                        className={`habit-day ${done ? 'on' : ''} ${isToday ? 'today' : ''}`}
                        style={
                          done
                            ? { background: habit.color }
                            : missed
                              ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }
                              : undefined
                        }
                        title={`${dowLabel} ${formatDate(d, state.settings.dateFormat)} — ${done ? t('habits.doneToday') : missed ? t('habits.missed') : ''}`}
                        onClick={() => cycleHabitDay(habit.id, d)}
                        aria-label={d}
                      >
                        {done ? '✓' : missed ? '✗' : ''}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 4, width: 66, flex: 'none', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span title={t('habits.streak')} style={{ fontSize: 11, color: 'var(--text-soft)', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Trophy size={11} style={{ color: streak > 0 ? habit.color : 'var(--text-muted)' }} />
                    {streak}
                  </span>
                  <button className="icon-btn" style={{ width: 22, height: 22, opacity: 0.35 }} onClick={() => setConfirmId(habit.id)} aria-label={t('act.delete')}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8 }}>{t('habits.clickCycle')}</div>
      </div>
      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteHabit(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ JOURNAL ══════════════ */
export function JournalWidget({ id }: { id: WidgetId }) {
  const { t, state, upsertJournal, deleteJournal, unlock } = useApp();
  const today = todayISO();
  const existing = state.journal.find((j) => j.date === today);
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [savedFlash, setSavedFlash] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  // Protection par PIN
  const [pinOpen, setPinOpen] = useState(state.settings.journalProtected);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const tryPin = () => {
    if (unlock(pinInput)) {
      setPinOpen(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const entryForSelected = state.journal.find((j) => j.date === selectedDate);

  const save = () => {
    upsertJournal({ id: existing?.id, date: today, content, mood });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const sortedEntries = useMemo(
    () => [...state.journal].sort((a, b) => b.date.localeCompare(a.date)),
    [state.journal],
  );

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<NotebookPen size={17} />}
        title={t('mod.journal')}
        sub={state.settings.journalProtected ? `🔒 ${t('journal.protected')}` : t('journal.today')}
      />
      {pinOpen ? (
        <div className="widget-body" style={{ alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
          <Lock size={28} style={{ color: 'var(--text-muted)' }} />
          <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{t('journal.enterPin')}</div>
          <input
            className="input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            placeholder="••••"
            style={{ width: 140, textAlign: 'center' }}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && tryPin()}
            autoFocus
          />
          {pinError && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{t('lock.wrong')}</span>}
          <button className="btn primary" onClick={tryPin}>
            <Lock size={14} /> {t('journal.unlock')}
          </button>
        </div>
      ) : (
      <div className="widget-body">
        <textarea
          className="textarea"
          style={{ minHeight: 96 }}
          placeholder={t('journal.write')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('journal.mood')}</span>
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              className="seg-btn"
              onClick={() => setMood(m)}
              style={{
                background: mood === m ? 'var(--accent-soft)' : 'transparent',
                opacity: mood === m ? 1 : 0.55,
                fontSize: 15,
              }}
              aria-label={`mood ${m}`}
            >
              {m === 1 ? '😞' : m === 2 ? '😕' : m === 3 ? '😐' : m === 4 ? '🙂' : '😄'}
            </button>
          ))}
        </div>
        <button className="btn primary" onClick={save} style={{ alignSelf: 'flex-start' }}>
          {t('journal.save')}
        </button>
        {savedFlash && <span style={{ fontSize: 12, color: 'var(--success)', marginLeft: 10 }}>{t('journal.saved')}</span>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 6px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('journal.history')}
          </span>
          <select className="select" style={{ width: 'auto', height: 28, fontSize: 11.5 }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            {sortedEntries.map((j) => (
              <option key={j.id} value={j.date}>{formatDate(j.date, state.settings.dateFormat)}</option>
            ))}
          </select>
        </div>
        <div className="scroll-y" style={{ flex: 1, minHeight: 80, gap: 8, display: 'flex', flexDirection: 'column' }}>
          {sortedEntries.length === 0 && <EmptyState icon={<NotebookPen size={20} />} text={t('journal.empty')} />}
          {entryForSelected ? (
            <div className="note-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatDate(entryForSelected.date, state.settings.dateFormat)} · {['😞', '😕', '😐', '🙂', '😄'][entryForSelected.mood - 1]}
                </span>
                <button className="icon-btn" style={{ width: 22, height: 22, opacity: 0.4 }} onClick={() => setConfirmId(entryForSelected.id)} aria-label={t('journal.delete')}>
                  <Trash2 size={11} />
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-soft)', whiteSpace: 'pre-wrap' }}>{entryForSelected.content}</p>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
          )}
        </div>
      </div>
      )}
      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteJournal(confirmId)}
        title={t('journal.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ OBJECTIFS SMART ══════════════ */
export function GoalsWidget({ id }: { id: WidgetId }) {
  const { t, state, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [mileTexts, setMileTexts] = useState<Record<string, string>>({});
  const setMileText = (goalId: string, v: string) => setMileTexts((m) => ({ ...m, [goalId]: v }));
  const [form, setForm] = useState({
    title: '',
    specific: '',
    measurable: '',
    deadline: todayISO(),
    progress: 0,
    category: 'Finance',
  });

  const save = () => {
    if (!form.title.trim()) return;
    addGoal({ ...form, title: form.title.trim() });
    setForm({ title: '', specific: '', measurable: '', deadline: todayISO(), progress: 0, category: 'Finance' });
    setModalOpen(false);
  };

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<Target size={17} />}
        title={t('mod.goals')}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('goals.new')}>
            <Plus size={16} />
          </button>
        }
      />
      <div className="widget-body scroll-y" style={{ gap: 12 }}>
        {state.goals.length === 0 && <EmptyState icon={<Target size={22} />} text={t('goals.empty')} />}
        {state.goals.map((goal) => {
          const left = daysUntil(goal.deadline);
          const overdue = left < 0;
          const done = goal.progress >= 100;
          const milestonesDone = goal.milestones.filter((m) => m.done).length;
          return (
            <div key={goal.id} className="note-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <strong style={{ fontSize: 13 }}>{goal.title}</strong>
                <button className="icon-btn" style={{ width: 22, height: 22, opacity: 0.35 }} onClick={() => setConfirmId(goal.id)} aria-label={t('act.delete')}>
                  <Trash2 size={11} />
                </button>
              </div>
              {goal.specific && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{goal.specific}</div>}
              <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                <span className="badge neutral">{goal.category}</span>
                {done ? (
                  <span className="badge success">{t('goals.completed')}</span>
                ) : overdue ? (
                  <span className="badge danger">{t('goals.overdue')}</span>
                ) : (
                  <span className="badge info">{left} {t('goals.daysLeft')}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={goal.progress} color={done ? 'success' : overdue ? 'danger' : 'accent'} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, width: 38, textAlign: 'right' }}>{goal.progress}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goal.progress}
                  style={{ width: 70 }}
                  onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                  aria-label={t('goals.progress')}
                />
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6 }}>
                {t('goals.measurable')}: {goal.measurable}
              </div>
              {/* Milestones */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {t('goals.milestones')} · {milestonesDone}/{goal.milestones.length} {t('goals.milestoneDone')}
                </div>
                {goal.milestones.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12 }}>
                    <button className={`checkbox ${m.done ? 'on' : ''}`} style={{ width: 15, height: 15, borderRadius: 5 }} onClick={() => toggleMilestone(goal.id, m.id)} aria-label="toggle milestone">
                      {m.done && <CheckSquare size={9} />}
                    </button>
                    <span style={{ flex: 1, textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--text-muted)' : 'var(--text-soft)' }}>{m.label}</span>
                    <button className="icon-btn" style={{ width: 18, height: 18, opacity: 0.3 }} onClick={() => deleteMilestone(goal.id, m.id)} aria-label={t('act.delete')}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    className="input"
                    style={{ height: 26, fontSize: 11.5 }}
                    placeholder={t('goals.milestonePh')}
                    value={mileTexts[goal.id] ?? ''}
                    onChange={(e) => setMileText(goal.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (mileTexts[goal.id] ?? '').trim()) {
                        addMilestone(goal.id, (mileTexts[goal.id] ?? '').trim());
                        setMileText(goal.id, '');
                      }
                    }}
                  />
                  <button className="btn sm" onClick={() => { const v = (mileTexts[goal.id] ?? '').trim(); if (v) { addMilestone(goal.id, v); setMileText(goal.id, ''); } }} aria-label={t('act.add')}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('goals.new')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={save}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>{t('goals.titlePh')}</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="field">
            <label>{t('goals.specific')}</label>
            <input className="input" value={form.specific} onChange={(e) => setForm({ ...form, specific: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('goals.measurable')}</label>
            <input className="input" value={form.measurable} onChange={(e) => setForm({ ...form, measurable: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('goals.deadline')}</label>
              <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('goals.category')}</label>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['Finance', 'Santé', 'Carrière', 'Développement', 'Loisirs'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t('goals.progress')}: {form.progress}%</label>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteGoal(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

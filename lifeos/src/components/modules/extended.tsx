// ─────────────────────────────────────────────────────────────
// LifeOS – Composants étendus (v2)
// Kanban de tâches, progression mensuelle des habitudes,
// liste de transactions complète (pagination + filtres).
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  Download,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState, ProgressBar, WidgetHead, rippleHandler } from '../ui';
import {
  downloadCSV,
  formatDate,
  formatMoney,
  lastNDays,
  monthKey,
  parseISODate,
  todayISO,
} from '../../utils/helpers';
import type { TaskStatus, WidgetId } from '../../types';

/* ══════════════ KANBAN TÂCHES ══════════════ */
const KANBAN_COLUMNS: { status: TaskStatus; key: string; icon: typeof Circle; color: string }[] = [
  { status: 'todo', key: 'tasks.todo', icon: Circle, color: 'var(--text-muted)' },
  { status: 'doing', key: 'tasks.doing', icon: CircleDot, color: 'var(--info)' },
  { status: 'done', key: 'tasks.done', icon: CheckCircle2, color: 'var(--success)' },
];

export function TaskKanban({ id }: { id: WidgetId }) {
  const { t, state, setTaskStatus, addTask, deleteTask } = useApp();
  const [dragId, setDragId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const fmt = state.settings.dateFormat;

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, typeof state.tasks> = { todo: [], doing: [], done: [] };
    state.tasks.forEach((task) => map[task.status].push(task));
    return map;
  }, [state.tasks]);

  const drop = (status: TaskStatus) => {
    if (dragId) setTaskStatus(dragId, status);
    setDragId(null);
  };

  return (
    <div className="widget-card" id={`widget-${id}`}>
      <WidgetHead icon={<CheckSquare size={17} />} title={t('tasks.kanban')} />
      <div className="widget-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="input"
            placeholder={t('tasks.placeholder')}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newText.trim()) {
                addTask({ title: newText.trim(), priority: 'medium' });
                setNewText('');
              }
            }}
          />
          <button
            className="btn primary"
            style={{ padding: '0 12px' }}
            onClick={() => {
              if (newText.trim()) {
                addTask({ title: newText.trim(), priority: 'medium' });
                setNewText('');
              }
            }}
            aria-label={t('tasks.new')}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="kanban-grid">
          {KANBAN_COLUMNS.map((col) => {
            const Icon = col.icon;
            const items = byStatus[col.status];
            return (
              <div
                key={col.status}
                className="kanban-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(col.status)}
              >
                <div className="kanban-col-head">
                  <Icon size={14} style={{ color: col.color }} />
                  <strong>{t(col.key)}</strong>
                  <span className="badge neutral">{items.length}</span>
                </div>
                <div className="kanban-col-body">
                  {items.length === 0 && <div className="empty-state" style={{ padding: 10 }}><span style={{ fontSize: 11 }}>—</span></div>}
                  {items.map((task) => {
                    const overdue = task.due && task.due < todayISO();
                    return (
                      <div
                        key={task.id}
                        className="kanban-card"
                        draggable
                        onDragStart={() => setDragId(task.id)}
                        onDragEnd={() => setDragId(null)}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{task.title}</div>
                        {task.subtasks.length > 0 && (
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>
                            {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} {t('tasks.subtasks').toLowerCase()}
                          </div>
                        )}
                        {task.due && (
                          <div style={{ fontSize: 10.5, marginTop: 4, color: overdue ? 'var(--danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarClock size={10} /> {formatDate(task.due, fmt)}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                          <span className={`badge ${task.priority === 'urgent' ? 'warning' : task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'info' : 'neutral'}`} style={{ fontSize: 8.5 }}>
                            {t(`tasks.p${task.priority === 'urgent' ? 'Urgent' : task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}`)}
                          </span>
                          <button className="icon-btn" style={{ width: 20, height: 20, opacity: 0.35 }} onClick={() => deleteTask(task.id)} aria-label={t('act.delete')}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ HABITUDES MENSUELLES ══════════════ */
export function HabitMonthly({ id }: { id: WidgetId }) {
  const { t, state } = useApp();
  const days30 = lastNDays(30);
  const weeks = useMemo(() => {
    const out: { label: string; days: string[] }[] = [];
    for (let i = 0; i < days30.length; i += 7) {
      out.push({ label: days30[i].slice(5).replace('-', '/'), days: days30.slice(i, i + 7) });
    }
    return out;
  }, [days30]);

  return (
    <div className="widget-card" id={`widget-${id}`}>
      <WidgetHead icon={<Activity size={17} />} title={t('habits.monthly')} sub={t('habits.weekAvg')} />
      <div className="widget-body" style={{ gap: 10 }}>
        {state.habits.length === 0 && <EmptyState icon={<Activity size={22} />} text={t('habits.empty')} />}
        {state.habits.map((habit) => {
          const done30 = days30.filter((d) => habit.days[d]).length;
          const pct = Math.round((done30 / 30) * 100);
          return (
            <div key={habit.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: habit.color }} />
                  {habit.name}
                </span>
                <span className="badge neutral" style={{ fontSize: 9.5 }}>{pct}% · {t('habits.completion')}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {weeks.map((w) => {
                  const done = w.days.filter((d) => habit.days[d]).length;
                  const weekPct = Math.round((done / 7) * 100);
                  return (
                    <div key={w.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          height: 34,
                          borderRadius: 8,
                          background: 'var(--chip)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                        }}
                        title={`${w.label} : ${weekPct}%`}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${weekPct}%`,
                            background: habit.color,
                            opacity: 0.85,
                            transition: 'height 0.8s cubic-bezier(.22,1,.36,1)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{w.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ TRANSACTIONS COMPLÈTES (pagination) ══════════════ */
const PAGE_SIZE = 20;

export function TransactionsFull({ id }: { id: WidgetId }) {
  const { t, state, deleteTx, showToast } = useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const cur = state.settings.currency;
  const fmt = state.settings.dateFormat;

  const months = useMemo(() => {
    const set = new Set(state.transactions.map((x) => monthKey(x.date)));
    return [...set].sort().reverse();
  }, [state.transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.transactions
      .filter((x) => (typeFilter === 'all' ? true : x.type === typeFilter))
      .filter((x) => (monthFilter === 'all' ? true : monthKey(x.date) === monthFilter))
      .filter((x) => (q ? (x.label + ' ' + x.category).toLowerCase().includes(q) : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, search, typeFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const income = filtered.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
  const expenses = filtered.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);

  const exportCsv = () => {
    downloadCSV(
      `lifeos-transactions-${todayISO()}.csv`,
      filtered.map((x) => ({ date: x.date, label: x.label, category: x.category, type: x.type, amount: x.amount, currency: cur })),
    );
    showToast(t('toast.exported'), 'success');
  };

  return (
    <div className="widget-card" id={`widget-${id}`}>
      <WidgetHead
        icon={<ArrowDownRight size={17} />}
        title={`${t('page.transactions')} · ${filtered.length} ${t('tx.count')}`}
        actions={
          <button className="btn sm" onClick={(e) => { rippleHandler(e); exportCsv(); }}>
            <Download size={13} /> {t('tx.export')}
          </button>
        }
      />
      <div className="widget-body">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div className="header-search" style={{ flex: 1, minWidth: 200, position: 'static' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input value={search} placeholder={t('tx.search')} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="select" style={{ width: 150 }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as never); setPage(1); }}>
            <option value="all">{t('tx.filterAll')}</option>
            <option value="income">{t('tx.incomeOnly')}</option>
            <option value="expense">{t('tx.expenseOnly')}</option>
          </select>
          <select className="select" style={{ width: 150 }} value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}>
            <option value="all">{t('tx.filterAll')} — {t('tx.month')}</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="stat-grid" style={{ marginBottom: 12 }}>
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label" style={{ display: 'flex', gap: 4, alignItems: 'center' }}><ArrowUpRight size={11} /> {t('fin.revenue')}</div>
            <div className="st-value" style={{ fontSize: 15, color: 'var(--success)' }}>{formatMoney(income, cur, { compact: true })}</div>
          </div>
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label" style={{ display: 'flex', gap: 4, alignItems: 'center' }}><ArrowDownRight size={11} /> {t('fin.expenses')}</div>
            <div className="st-value" style={{ fontSize: 15, color: 'var(--danger)' }}>{formatMoney(expenses, cur, { compact: true })}</div>
          </div>
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label">{t('fin.balance')}</div>
            <div className="st-value" style={{ fontSize: 15 }}>{formatMoney(income - expenses, cur, { compact: true, sign: true })}</div>
          </div>
        </div>

        <div className="table-wrap scroll-y" style={{ flex: 1, minHeight: 300 }}>
          {pageItems.length === 0 ? (
            <EmptyState icon={<Search size={20} />} text={t('tx.noResults')} />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('tx.date')}</th>
                  <th>{t('tx.label')}</th>
                  <th>{t('tx.category')}</th>
                  <th style={{ textAlign: 'right' }}>{t('tx.amount')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((x) => (
                  <tr key={x.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(x.date, fmt)}</td>
                    <td style={{ fontWeight: 500 }}>{x.label}</td>
                    <td><span className="badge neutral">{x.category}</span></td>
                    <td className={x.type === 'income' ? 'amount-pos' : 'amount-neg'} style={{ textAlign: 'right' }}>
                      {x.type === 'income' ? '+' : '−'}{formatMoney(x.amount, cur)}
                    </td>
                    <td>
                      <button className="icon-btn" style={{ width: 24, height: 24, opacity: 0.35 }} onClick={() => setConfirmId(x.id)} aria-label={t('act.delete')}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {t('tx.pagination', { page: String(page), total: String(totalPages) })}
          </span>
          <span style={{ display: 'flex', gap: 6 }}>
            <button className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label={t('page.prev')}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label={t('page.next')}>
              <ChevronRight size={14} />
            </button>
          </span>
        </div>
      </div>

      {confirmId && (
        <ConfirmInline
          message={t('act.delete') + ' ?'}
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteTx(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}

function ConfirmInline({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useApp();
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <p style={{ margin: '0 0 16px', color: 'var(--text-soft)' }}>{message}</p>
        <div className="modal-foot" style={{ marginTop: 0 }}>
          <button className="btn ghost" onClick={onCancel}>{t('act.cancel')}</button>
          <button className="btn danger" onClick={onConfirm}>{t('act.delete')}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LifeOS – Modules "Finances" : aperçu (graphiques + transactions)
// et budget mensuel
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Download,
  LineChart as LineIcon,
  Plus,
  Scale,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber, ConfirmDialog, EmptyState, Modal, ProgressBar, WidgetHead, rippleHandler } from '../ui';
import { downloadCSV, firstOfMonth, formatDate, formatMoney, monthKey, todayISO } from '../../utils/helpers';
import { CHART_COLORS } from '../../data/modules';
import type { TxType, WidgetId } from '../../types';

/* ── Couleurs de graphique adaptées au thème ── */
function useChartPalette() {
  const { resolvedTheme } = useApp();
  const dark = resolvedTheme === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    axis: dark ? '#6f7882' : '#868e96',
    tooltipBg: dark ? '#1f242c' : '#ffffff',
    tooltipBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    text: dark ? '#e9ecef' : '#212529',
    income: dark ? '#7cab8a' : '#5f8d6a',
    expense: dark ? '#c77b72' : '#b3594f',
    accent: dark ? '#8a939c' : '#6c757d',
  };
}

function ChartTooltipStyle(palette: ReturnType<typeof useChartPalette>) {
  return {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,.15)',
    fontSize: 12,
    color: palette.text,
  };
}

/* ══════════════ APERÇU FINANCES ══════════════ */
export function FinanceWidget({ id }: { id: WidgetId }) {
  const { t, state, addTx, deleteTx, showToast } = useApp();
  const palette = useChartPalette();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', amount: '', category: 'Autre', type: 'expense' as TxType, date: todayISO() });
  const cur = state.settings.currency;
  const thisMonth = monthKey(todayISO());
  const fmt = state.settings.dateFormat;

  const monthTx = useMemo(() => state.transactions.filter((x) => monthKey(x.date) === thisMonth), [state.transactions, thisMonth]);

  const revenue = monthTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
  const expenses = monthTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
  const balance = revenue - expenses;

  // 6 derniers mois
  const series = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, label: m.toLocaleDateString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }) });
    }
    return months.map((m) => {
      const txs = state.transactions.filter((x) => monthKey(x.date) === m.key);
      return {
        label: m.label,
        [t('fin.revenue')]: txs.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0),
        [t('fin.expenses')]: txs.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
        [t('fin.netSavings')]: txs.reduce((s, x) => s + (x.type === 'income' ? x.amount : -x.amount), 0),
      };
    });
  }, [state.transactions, state.settings.lang, t]);

  // Répartition par catégorie (mois courant)
  const catData = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter((x) => x.type === 'expense').forEach((x) => map.set(x.category, (map.get(x.category) ?? 0) + x.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    state.transactions.forEach((x) => set.add(x.category));
    return [...set].sort();
  }, [state.transactions]);

  const save = () => {
    const amount = Number(form.amount);
    if (!form.label.trim() || !amount || amount <= 0) return;
    addTx({ label: form.label.trim(), amount, category: form.category, type: form.type, date: form.date });
    setForm({ label: '', amount: '', category: 'Autre', type: 'expense', date: todayISO() });
    setModalOpen(false);
    showToast(t('toast.added'), 'success');
  };

  const exportCsv = () => {
    downloadCSV(
      `lifeos-transactions-${todayISO()}.csv`,
      state.transactions.map((x) => ({
        date: x.date,
        label: x.label,
        category: x.category,
        type: x.type,
        amount: x.amount,
        currency: cur,
      })),
    );
    showToast(t('toast.exported'), 'success');
  };

  const recent = [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<LineIcon size={17} />}
        title={t('mod.finance')}
        sub={t('fin.thisMonth')}
        actions={
          <>
            <button className="btn sm" onClick={(e) => { rippleHandler(e); exportCsv(); }}>
              <Download size={13} /> {t('tx.export')}
            </button>
            <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('tx.new')}>
              <Plus size={16} />
            </button>
          </>
        }
      />
      <div className="widget-body" style={{ gap: 12 }}>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="st-label" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <ArrowUpRight size={11} /> {t('fin.revenue')}
            </div>
            <div className="st-value" style={{ color: 'var(--success)' }}>
              <AnimatedNumber value={revenue} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
          <div className="stat-box">
            <div className="st-label" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <ArrowDownRight size={11} /> {t('fin.expenses')}
            </div>
            <div className="st-value" style={{ color: 'var(--danger)' }}>
              <AnimatedNumber value={expenses} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
          <div className="stat-box">
            <div className="st-label" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Wallet size={11} /> {t('fin.balance')}
            </div>
            <div className="st-value">
              <AnimatedNumber value={balance} format={(n) => formatMoney(n, cur, { compact: true, sign: true })} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, minHeight: 200 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('fin.last6')}
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.income} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={palette.income} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.expense} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={palette.expense} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.accent} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: palette.axis }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ChartTooltipStyle(palette)} formatter={(v: number) => formatMoney(v, cur, { compact: true })} />
                <Area type="monotone" dataKey={t('fin.revenue')} stroke={palette.income} strokeWidth={2.2} fill="url(#gIncome)" animationDuration={1000} />
                <Area type="monotone" dataKey={t('fin.expenses')} stroke={palette.expense} strokeWidth={2.2} fill="url(#gExpense)" animationDuration={1000} />
                <Area type="monotone" dataKey={t('fin.netSavings')} stroke={palette.accent} strokeWidth={2} strokeDasharray="5 4" fill="url(#gNet)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('fin.byCategory')}
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={3} strokeWidth={0} animationDuration={1000}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ChartTooltipStyle(palette)} formatter={(v: number, name: string) => [formatMoney(v, cur, { compact: true }), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('tx.recent')}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{monthTx.length} {t('tx.month').toLowerCase()} →</span>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<Wallet size={20} />} text={t('tx.empty')} />
          ) : (
            <div className="table-wrap" style={{ maxHeight: 200 }}>
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
                  {recent.map((x) => (
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
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('tx.new')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={save}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>{t('tx.label')}</label>
            <input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('tx.amount')} ({cur})</label>
              <input className="input" type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('tx.date')}</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('tx.category')}</label>
              <input className="input" list="cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <datalist id="cats">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('tx.type')}</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TxType })}>
                <option value="expense">{t('tx.expense')}</option>
                <option value="income">{t('tx.income')}</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteTx(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ BUDGET MENSUEL ══════════════ */
export function BudgetWidget({ id }: { id: WidgetId }) {
  const { t, state, addBudgetCat, deleteBudgetCat, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', planned: '' });
  const cur = state.settings.currency;
  const thisMonth = monthKey(todayISO());

  const spentByCat = useMemo(() => {
    const map = new Map<string, number>();
    state.transactions
      .filter((x) => x.type === 'expense' && monthKey(x.date) === thisMonth)
      .forEach((x) => map.set(x.category, (map.get(x.category) ?? 0) + x.amount));
    return map;
  }, [state.transactions, thisMonth]);

  const totalPlanned = state.budget.reduce((s, c) => s + c.planned, 0);
  const totalSpent = state.budget.reduce((s, c) => s + (spentByCat.get(c.name) ?? 0), 0);
  const warnThreshold = state.settings.budgetWarningThreshold;
  const criticalCats = state.budget.filter((c) => (spentByCat.get(c.name) ?? 0) > c.planned);
  const warningCats = state.budget.filter((c) => {
    const spent = spentByCat.get(c.name) ?? 0;
    return spent <= c.planned && c.planned > 0 && (spent / c.planned) * 100 >= warnThreshold;
  });
  const overCount = criticalCats.length;
  // Prévision fin de mois : dépense moyenne quotidienne × jours du mois
  const monthProjection = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (day <= 1 || totalSpent <= 0) return null;
    return Math.round((totalSpent / day) * daysInMonth);
  }, [totalSpent]);

  const save = () => {
    const planned = Number(form.planned);
    if (!form.name.trim() || !planned || planned <= 0) return;
    addBudgetCat({ name: form.name.trim(), planned, color: CHART_COLORS[state.budget.length % CHART_COLORS.length] });
    setForm({ name: '', planned: '' });
    setModalOpen(false);
    showToast(t('toast.added'), 'success');
  };

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<ClipboardList size={17} />}
        title={t('mod.budget')}
        sub={overCount > 0 ? `⚠ ${overCount} ${t('budget.alert')}` : t('budget.ok')}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('budget.newCat')}>
            <Plus size={16} />
          </button>
        }
      />
      <div className="widget-body">
        <div className="stat-grid" style={{ marginBottom: 14 }}>
          <div className="stat-box">
            <div className="st-label">{t('budget.planned')}</div>
            <div className="st-value" style={{ fontSize: 16 }}><AnimatedNumber value={totalPlanned} format={(n) => formatMoney(n, cur, { compact: true })} /></div>
          </div>
          <div className="stat-box">
            <div className="st-label">{t('budget.spent')}</div>
            <div className="st-value" style={{ fontSize: 16, color: totalSpent > totalPlanned ? 'var(--danger)' : undefined }}>
              <AnimatedNumber value={totalSpent} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
          <div className="stat-box">
            <div className="st-label">{t('budget.remaining')}</div>
            <div className="st-value" style={{ fontSize: 16 }}>
              <AnimatedNumber value={Math.max(0, totalPlanned - totalSpent)} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <ProgressBar value={totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0} color={totalSpent > totalPlanned ? 'danger' : 'accent'} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {formatMoney(totalSpent, cur)} / {formatMoney(totalPlanned, cur)} · {t('budget.left')}
          </div>
          {monthProjection !== null && (
            <div style={{ fontSize: 10.5, marginTop: 3, color: monthProjection > totalPlanned ? 'var(--warning)' : 'var(--text-muted)' }}>
              {t('budget.projection')} : <strong>{formatMoney(monthProjection, cur)}</strong>
            </div>
          )}
        </div>

        <div className="scroll-y" style={{ flex: 1, minHeight: 140, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.budget.map((cat) => {
            const spent = spentByCat.get(cat.name) ?? 0;
            const pct = cat.planned > 0 ? (spent / cat.planned) * 100 : 0;
            const critical = spent > cat.planned;
            const warning = !critical && pct >= warnThreshold;
            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: cat.color, flex: 'none' }} />
                    {cat.name}
                    {critical && <span className="badge danger" style={{ fontSize: 9 }}>⚠ {t('budget.levelCritical')}</span>}
                    {warning && <span className="badge warning" style={{ fontSize: 9 }}>{t('budget.levelWarning')}</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                    <span style={{ color: critical ? 'var(--danger)' : warning ? 'var(--warning)' : 'var(--text-soft)', fontWeight: 600 }}>
                      {formatMoney(spent, cur)} / {formatMoney(cat.planned, cur)} · {Math.round(pct)}%
                    </span>
                    <button className="icon-btn" style={{ width: 20, height: 20, opacity: 0.35 }} onClick={() => setConfirmId(cat.id)} aria-label={t('act.delete')}>
                      <Trash2 size={10} />
                    </button>
                  </span>
                </div>
                <ProgressBar value={Math.min(100, pct)} color={critical ? 'danger' : warning ? 'warning' : 'accent'} height={6} />
                {critical && (
                  <div style={{ fontSize: 10.5, color: 'var(--danger)', marginTop: 2 }}>
                    {t('budget.over')} {formatMoney(spent - cat.planned, cur)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('budget.newCat')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={save}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>{t('budget.catName')}</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="field">
            <label>{t('budget.catAmount')} ({cur})</label>
            <input className="input" type="number" min={0} value={form.planned} onChange={(e) => setForm({ ...form, planned: e.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteBudgetCat(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LifeOS – Modules "Finances" (2) : Épargne + simulateur,
// Investissements, Calculateur de prêt
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { CreditCard, PiggyBank, Plus, Trash2, TrendingUp, Wallet2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { AnimatedNumber, ConfirmDialog, Modal, ProgressBar, WidgetHead, rippleHandler } from '../ui';
import { daysUntil, formatMoney, formatPct, percent, todayISO } from '../../utils/helpers';
import { CHART_COLORS } from '../../data/modules';
import type { InvestmentType, WidgetId } from '../../types';

function useChartPalette() {
  const { resolvedTheme } = useApp();
  const dark = resolvedTheme === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    axis: dark ? '#6f7882' : '#868e96',
    tooltipBg: dark ? '#1f242c' : '#ffffff',
    tooltipBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    text: dark ? '#e9ecef' : '#212529',
    accent: dark ? '#8a939c' : '#6c757d',
    soft: dark ? '#3d454f' : '#c3c9cf',
  };
}

const tooltipStyle = (p: ReturnType<typeof useChartPalette>) => ({
  backgroundColor: p.tooltipBg,
  border: `1px solid ${p.tooltipBorder}`,
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,.15)',
  fontSize: 12,
  color: p.text,
});

/* ══════════════ ÉPARGNE + SIMULATEUR ══════════════ */
export function SavingsWidget({ id }: { id: WidgetId }) {
  const { t, state, addSavingsGoal, contributeSavings, deleteSavingsGoal } = useApp();
  const palette = useChartPalette();
  const cur = state.settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [contribId, setContribId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  // Simulateur
  const [sim, setSim] = useState({ initial: 5000, monthly: 1000, rate: 8, years: 10 });

  const [form, setForm] = useState({ name: '', target: '', deadline: '' });

  const projection = useMemo(() => {
    const r = sim.rate / 100 / 12;
    const months = sim.years * 12;
    let capital = sim.initial;
    const pts: { year: string; value: number; invested: number }[] = [];
    let invested = sim.initial;
    for (let m = 1; m <= months; m++) {
      capital = capital * (1 + r) + sim.monthly;
      invested += sim.monthly;
      if (m % 12 === 0) {
        pts.push({ year: `${m / 12}`, value: Math.round(capital), invested: Math.round(invested) });
      }
    }
    return pts;
  }, [sim]);

  const finalValue = projection.length ? projection[projection.length - 1].value : 0;
  const totalInvested = projection.length ? projection[projection.length - 1].invested : 0;
  const interest = finalValue - totalInvested;

  const save = () => {
    const target = Number(form.target);
    if (!form.name.trim() || !target || target <= 0) return;
    addSavingsGoal({ name: form.name.trim(), target, saved: 0, deadline: form.deadline || undefined, color: CHART_COLORS[state.savingsGoals.length % CHART_COLORS.length] });
    setForm({ name: '', target: '', deadline: '' });
    setModalOpen(false);
  };

  const doContribute = () => {
    const amount = Number(contribAmount);
    if (contribId && amount > 0) {
      contributeSavings(contribId, amount);
      setContribId(null);
      setContribAmount('');
    }
  };

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<PiggyBank size={17} />}
        title={t('mod.savings')}
        sub={t('sav.goals')}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('sav.new')}>
            <Plus size={16} />
          </button>
        }
      />
      <div className="widget-body scroll-y" style={{ gap: 14 }}>
        {state.savingsGoals.length === 0 && <div className="empty-state"><PiggyBank size={20} /><span>{t('misc.none')}</span></div>}
        {state.savingsGoals.map((g) => {
          const pct = percent(g.saved, g.target);
          const left = g.deadline ? daysUntil(g.deadline) : null;
          const remaining = Math.max(0, g.target - g.saved);
          const monthlyNeeded =
            left !== null && left > 0 && remaining > 0 ? remaining / Math.max(1, Math.ceil(left / 30.4)) : null;
          return (
            <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 13, padding: 12, background: 'var(--card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{g.name}</strong>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="badge accent" style={{ fontSize: 10 }}>{pct}%</span>
                  <button className="icon-btn" style={{ width: 22, height: 22, opacity: 0.35 }} onClick={() => setConfirmId(g.id)} aria-label={t('act.delete')}>
                    <Trash2 size={11} />
                  </button>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 6px' }}>
                <span>{formatMoney(g.saved, cur)} / {formatMoney(g.target, cur)}</span>
                <span>
                  {pct >= 100
                    ? t('sav.complete')
                    : left !== null && left >= 0
                      ? `${left} ${t('sav.countdown')}`
                      : ''}
                </span>
              </div>
              <ProgressBar value={pct} color={pct >= 100 ? 'success' : 'accent'} height={7} />
              {monthlyNeeded !== null && remaining > 0 && (
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('sav.monthlyNeeded')} : <strong style={{ color: 'var(--text-soft)' }}>{formatMoney(Math.round(monthlyNeeded), cur)}</strong>
                </div>
              )}
              <button className="btn sm ghost" style={{ marginTop: 8 }} onClick={(e) => { rippleHandler(e); setContribId(g.id); }}>
                <Wallet2 size={13} /> {t('sav.contribute')}
              </button>
            </div>
          );
        })}

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            {t('sav.sim')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
            <SimField label={t('sav.initial')} value={sim.initial} min={0} max={200000} step={1000} onChange={(v) => setSim({ ...sim, initial: v })} />
            <SimField label={t('sav.monthly')} value={sim.monthly} min={0} max={10000} step={100} onChange={(v) => setSim({ ...sim, monthly: v })} />
            <SimField label={t('sav.rate')} value={sim.rate} min={0} max={20} step={0.5} suffix="%" onChange={(v) => setSim({ ...sim, rate: v })} />
            <SimField label={t('sav.years')} value={sim.years} min={1} max={40} step={1} onChange={(v) => setSim({ ...sim, years: v })} />
          </div>
          <div style={{ height: 170, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.accent} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: palette.axis }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number, n: string) => [formatMoney(v, cur, { compact: true }), n]} />
                <Area type="monotone" dataKey="value" stroke={palette.accent} strokeWidth={2.2} fill="url(#gSav)" animationDuration={1000} />
                {/* Référence "sans intérêts" (capital versé uniquement) */}
                <Area type="monotone" dataKey="invested" stroke={palette.soft} strokeWidth={1.5} strokeDasharray="5 4" fill="none" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 3, borderRadius: 2, background: palette.accent, display: 'inline-block' }} />
              {t('budget.withInterest')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 0, borderTop: `2px dashed ${palette.soft}`, display: 'inline-block' }} />
              {t('budget.noInterest')}
            </span>
          </div>
          <div className="stat-grid" style={{ marginTop: 8 }}>
            <div className="stat-box" style={{ padding: 8 }}>
              <div className="st-label" style={{ fontSize: 9.5 }}>{t('sav.final')}</div>
              <div className="st-value" style={{ fontSize: 14 }}>
                <AnimatedNumber value={finalValue} format={(n) => formatMoney(n, cur, { compact: true })} />
              </div>
            </div>
            <div className="stat-box" style={{ padding: 8 }}>
              <div className="st-label" style={{ fontSize: 9.5 }}>{t('sav.invested')}</div>
              <div className="st-value" style={{ fontSize: 14 }}>
                <AnimatedNumber value={totalInvested} format={(n) => formatMoney(n, cur, { compact: true })} />
              </div>
            </div>
            <div className="stat-box" style={{ padding: 8 }}>
              <div className="st-label" style={{ fontSize: 9.5 }}>{t('sav.interest')}</div>
              <div className="st-value" style={{ fontSize: 14, color: 'var(--success)' }}>
                <AnimatedNumber value={interest} format={(n) => formatMoney(n, cur, { compact: true })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('sav.new')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={save}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>{t('sav.name')}</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('sav.target')} ({cur})</label>
              <input className="input" type="number" min={0} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('sav.deadline')}</label>
              <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={contribId !== null}
        onClose={() => setContribId(null)}
        title={t('sav.contribute')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setContribId(null)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={doContribute}>{t('act.save')}</button>
          </>
        }
      >
        <div className="field">
          <label>{t('sav.contribute')} ({cur})</label>
          <input className="input" type="number" min={0} value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} autoFocus />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteSavingsGoal(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

function SimField({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field" style={{ gap: 2 }}>
      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{value.toLocaleString()}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/* ══════════════ INVESTISSEMENTS ══════════════ */
const INV_TYPES: Record<InvestmentType, string> = {
  stock: 'inv.stock',
  crypto: 'inv.crypto',
  realestate: 'inv.realestate',
  cash: 'inv.cash',
};

export function InvestmentsWidget({ id }: { id: WidgetId }) {
  const { t, state, addInvestment, deleteInvestment } = useApp();
  const palette = useChartPalette();
  const cur = state.settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', symbol: '', type: 'stock' as InvestmentType, amount: '', changePct: '' });

  const total = state.investments.reduce((s, x) => s + x.amount, 0);
  const perf = total > 0 ? state.investments.reduce((s, x) => s + x.amount * x.changePct, 0) / total : 0;

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    state.investments.forEach((x) => map.set(t(x.type), (map.get(t(x.type)) ?? 0) + x.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [state.investments, t]);

  const save = () => {
    const amount = Number(form.amount);
    if (!form.name.trim() || !amount || amount <= 0) return;
    addInvestment({
      name: form.name.trim(),
      symbol: form.symbol.trim() || form.name.slice(0, 4).toUpperCase(),
      type: form.type,
      amount,
      changePct: Number(form.changePct) || 0,
    });
    setForm({ name: '', symbol: '', type: 'stock', amount: '', changePct: '' });
    setModalOpen(false);
  };

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<TrendingUp size={17} />}
        title={t('mod.investments')}
        sub={t('inv.value') + ' · ' + formatMoney(total, cur, { compact: true })}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('inv.new')}>
            <Plus size={16} />
          </button>
        }
      />
      <div className="widget-body" style={{ gap: 12 }}>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="st-label">{t('inv.value')}</div>
            <div className="st-value" style={{ fontSize: 16 }}>
              <AnimatedNumber value={total} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
          <div className="stat-box">
            <div className="st-label">{t('inv.perf')}</div>
            <div className="st-value" style={{ fontSize: 16, color: perf >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              <AnimatedNumber value={perf} format={(n) => formatPct(n, true)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 150 }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={3} strokeWidth={0} animationDuration={1000}>
                  {byType.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number, n: string) => [formatMoney(v, cur, { compact: true }), n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="scroll-y" style={{ maxHeight: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {state.investments.map((inv) => (
              <div key={inv.id} className="list-item" style={{ padding: '7px 8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: inv.changePct >= 0 ? 'var(--success)' : 'var(--danger)', flex: 'none' }} />
                <div className="li-main">
                  <div className="li-title">{inv.name} <span style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>{inv.symbol}</span></div>
                  <div className="li-sub">{t(inv.type)} · {formatMoney(inv.amount, cur, { compact: true })}</div>
                </div>
                <span className={`badge ${inv.changePct >= 0 ? 'success' : 'danger'}`}>{formatPct(inv.changePct, true)}</span>
                <button className="icon-btn" style={{ width: 20, height: 20, opacity: 0.3 }} onClick={() => setConfirmId(inv.id)} aria-label={t('act.delete')}>
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('inv.new')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={save}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 2 }}>
              <label>{t('inv.name')}</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('inv.symbol')}</label>
              <input className="input" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>{t('inv.type')}</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}>
              {(Object.keys(INV_TYPES) as InvestmentType[]).map((k) => (
                <option key={k} value={k}>{t(INV_TYPES[k])}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('inv.amount')} ({cur})</label>
              <input className="input" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('inv.change')} (%)</label>
              <input className="input" type="number" step="0.1" value={form.changePct} onChange={(e) => setForm({ ...form, changePct: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && deleteInvestment(confirmId)}
        title={t('act.delete')}
        message={t('act.delete') + ' ?'}
      />
    </div>
  );
}

/* ══════════════ CALCULATEUR DE PRÊT ══════════════ */
export function LoanWidget({ id }: { id: WidgetId }) {
  const { t, state } = useApp();
  const palette = useChartPalette();
  const cur = state.settings.currency;
  const [loan, setLoan] = useState({ amount: 300000, rate: 5.5, years: 20 });

  const calc = useMemo(() => {
    const r = loan.rate / 100 / 12;
    const n = loan.years * 12;
    const monthly = r > 0 ? (loan.amount * r) / (1 - Math.pow(1 + r, -n)) : loan.amount / n;
    const total = monthly * n;
    // Amortissement par année (stacked capital / intérêts)
    const yearly: { year: string; [k: string]: number | string }[] = [];
    let remaining = loan.amount;
    for (let y = 1; y <= loan.years; y++) {
      let principalYear = 0;
      let interestYear = 0;
      for (let m = 0; m < 12; m++) {
        const interest = remaining * r;
        const principal = monthly - interest;
        principalYear += principal;
        interestYear += interest;
        remaining = Math.max(0, remaining - principal);
      }
      yearly.push({ year: `${y}`, [t('loan.principal')]: Math.round(principalYear), [t('loan.interestPart')]: Math.round(interestYear) });
    }
    return { monthly, total, interest: total - loan.amount, yearly };
  }, [loan, t]);

  return (
    <div className="widget-card">
      <WidgetHead icon={<CreditCard size={17} />} title={t('mod.loan')} />
      <div className="widget-body" style={{ gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
          <SimField label={t('loan.amount')} value={loan.amount} min={10000} max={2000000} step={5000} onChange={(v) => setLoan({ ...loan, amount: v })} />
          <SimField label={t('loan.rate')} value={loan.rate} min={0} max={15} step={0.1} suffix="%" onChange={(v) => setLoan({ ...loan, rate: v })} />
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <SimField label={t('loan.duration')} value={loan.years} min={1} max={35} step={1} suffix={` ${t('loan.years')}`} onChange={(v) => setLoan({ ...loan, years: v })} />
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label">{t('loan.monthly')}</div>
            <div className="st-value" style={{ fontSize: 15 }}>
              <AnimatedNumber value={calc.monthly} format={(n) => formatMoney(n, cur)} />
            </div>
          </div>
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label">{t('loan.total')}</div>
            <div className="st-value" style={{ fontSize: 15 }}>
              <AnimatedNumber value={calc.total} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
          <div className="stat-box" style={{ padding: 10 }}>
            <div className="st-label">{t('loan.interest')}</div>
            <div className="st-value" style={{ fontSize: 15, color: 'var(--danger)' }}>
              <AnimatedNumber value={calc.interest} format={(n) => formatMoney(n, cur, { compact: true })} />
            </div>
          </div>
        </div>

        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calc.yearly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 9.5, fill: palette.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: palette.axis }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => formatMoney(v, cur, { compact: true })} />
              <Bar dataKey={t('loan.principal')} stackId="a" fill={palette.accent} animationDuration={1000} />
              <Bar dataKey={t('loan.interestPart')} stackId="a" fill={palette.soft} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

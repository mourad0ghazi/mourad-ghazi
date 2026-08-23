// ─────────────────────────────────────────────────────────────
// LifeOS – Panneaux des 12 fonctionnalités (v2.5 : 100 % gratuit)
// Chaque icône de la section "Fonctionnalités" ouvre un panneau
// réellement fonctionnel : IA avancée, rapports, sync bancaire,
// cloud, famille, intégrations, PWA, templates, alertes, API,
// thèmes personnalisés, support.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Copy,
  Download,
  FileText,
  KeyRound,
  Landmark,
  LayoutTemplate,
  Loader2,
  Mail,
  MessageCircle,
  Palette,
  Play,
  Send,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useFeatureStore, type FeatureId } from '../../store/featureStore';
import { useUIStore } from '../../store';
import { Modal, ProgressBar } from '../ui';
import { calculateCompoundInterest } from '../../utils/calculations';
import {
  downloadBlob,
  exportEventsIcs,
  exportExcel,
  exportNotesMarkdown,
  exportTasksCsv,
} from '../../utils/exports';
import {
  addDays,
  downloadCSV,
  formatMoney,
  monthKey,
  todayISO,
} from '../../utils/helpers';
import { CHART_COLORS } from '../../data/modules';

/* ═══════════════════════════ 1. IA AVANCÉE ═══════════════════════════ */

function AIAdvancedPanel() {
  const { t, state } = useApp();
  const cur = state.settings.currency;

  // Séries réelles (6 derniers mois avec transactions)
  const series = useMemo(() => {
    const allMonths = [...new Set(state.transactions.map((x) => monthKey(x.date)))].sort();
    const last = allMonths.slice(-6);
    const months = last.map((key) => {
      const [y, m] = key.split('-').map(Number);
      return {
        key,
        label: new Date(y, m - 1, 1).toLocaleDateString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
      };
    });
    return months.map((m) => {
      const txs = state.transactions.filter((x) => monthKey(x.date) === m.key);
      return {
        label: m.label,
        [t('fin.revenue')]: txs.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0),
        [t('fin.expenses')]: txs.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
      };
    });
  }, [state.transactions, state.settings.lang, t]);

  // Moyennes des 3 derniers mois → prévisions 3 mois
  const forecast = useMemo(() => {
    const last3 = series.slice(-3);
    if (last3.length === 0) return [];
    const avgInc = last3.reduce((s, m) => s + (m[t('fin.revenue')] as number), 0) / last3.length;
    const avgExp = last3.reduce((s, m) => s + (m[t('fin.expenses')] as number), 0) / last3.length;
    const base = new Date();
    return [1, 2, 3].map((i) => {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      return {
        label: `${d.toLocaleDateString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })} +${i}`,
        [t('fin.revenue')]: Math.round(avgInc),
        [t('fin.expenses')]: Math.round(avgExp),
        projected: true,
      };
    });
  }, [series, t, state.settings.lang]);

  const chartData = useMemo(() => {
    const forecastRev = forecast.map((f) => ({ label: f.label, [t('fin.revenue')]: f[t('fin.revenue')], [t('fin.expenses')]: f[t('fin.expenses')] }));
    return [...series, ...forecastRev];
  }, [series, forecast, t]);

  // Analyse de portefeuille
  const portfolio = useMemo(() => {
    const invs = state.investments;
    const total = invs.reduce((s, x) => s + x.amount, 0);
    if (total <= 0) return null;
    const byType = new Map<string, number>();
    invs.forEach((x) => byType.set(t(x.type === 'stock' ? 'inv.stock' : x.type === 'crypto' ? 'inv.crypto' : x.type === 'realestate' ? 'inv.realestate' : 'inv.cash'), (byType.get(t(x.type === 'stock' ? 'inv.stock' : x.type === 'crypto' ? 'inv.crypto' : x.type === 'realestate' ? 'inv.realestate' : 'inv.cash')) ?? 0) + x.amount));
    const weights = [...byType.values()].map((v) => v / total);
    const concentration = weights.reduce((s, w) => s + w * w, 0);
    const diversification = Math.round((1 - concentration) * 100);
    const best = [...invs].sort((a, b) => b.changePct - a.changePct)[0];
    const worst = [...invs].sort((a, b) => a.changePct - b.changePct)[0];
    const advice: string[] = [];
    const cashPct = ((invs.find((x) => x.type === 'cash')?.amount ?? 0) / total) * 100;
    const cryptoPct = ((invs.filter((x) => x.type === 'crypto').reduce((s, x) => s + x.amount, 0)) / total) * 100;
    const immoPct = ((invs.filter((x) => x.type === 'realestate').reduce((s, x) => s + x.amount, 0)) / total) * 100;
    if (cashPct > 60) advice.push(fr ? `💰 ${Math.round(cashPct)} % en liquidités : une partie pourrait être investie.` : `💰 ${Math.round(cashPct)}% in cash: part of it could be invested.`);
    if (cryptoPct > 30) advice.push(fr ? `⚠️ ${Math.round(cryptoPct)} % en crypto : exposition élevée, pensez à diversifier.` : `⚠️ ${Math.round(cryptoPct)}% in crypto: high exposure, consider diversifying.`);
    if (immoPct > 60) advice.push(fr ? `🏠 ${Math.round(immoPct)} % en immobilier : portefeuille peu liquide.` : `🏠 ${Math.round(immoPct)}% in real estate: low liquidity.`);
    if (advice.length === 0) advice.push(fr ? '✅ Portefeuille bien réparti. Continuez à investir régulièrement.' : '✅ Well-balanced portfolio. Keep investing regularly.');
    return { total, diversification, best, worst, advice };
  }, [state.investments, t]);

  const fr = state.settings.lang === 'fr';

  // Projection d'épargne 12 mois
  const netAvg = useMemo(() => {
    const last3 = series.slice(-3);
    if (last3.length === 0) return 0;
    return last3.reduce((s, m) => s + ((m[t('fin.revenue')] as number) - (m[t('fin.expenses')] as number)), 0) / last3.length;
  }, [series, t]);
  const projection12 = useMemo(
    () => calculateCompoundInterest({ initial: state.savingsGoals.reduce((s, g) => s + g.saved, 0), monthly: Math.max(0, netAvg), annualRatePct: 6, years: 12 }).slice(0, 12),
    [state.savingsGoals, netAvg],
  );

  return (
    <div className="feat-panel">
      <h4 className="feat-h4">{t('ai.forecast')}</h4>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatMoney(v, cur, { compact: true })} />
            <Line type="monotone" dataKey={t('fin.revenue')} stroke="var(--success)" strokeWidth={2} dot={false} animationDuration={1000} />
            <Line type="monotone" dataKey={t('fin.expenses')} stroke="var(--danger)" strokeWidth={2} dot={false} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        {t('ai.avgInc')} : <strong style={{ color: 'var(--success)' }}>{formatMoney(Math.round(netAvg + (series[series.length - 1]?.[t('fin.expenses')] as number ?? 0)), cur, { compact: true })}</strong> · {t('ai.avgExp')} : <strong style={{ color: 'var(--danger)' }}>{formatMoney(Math.round(series[series.length - 1]?.[t('fin.expenses')] as number ?? 0), cur, { compact: true })}</strong>
      </div>

      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('ai.portfolio')}</h4>
      {portfolio ? (
        <>
          <div className="stat-grid">
            <div className="stat-box" style={{ padding: 10 }}>
              <div className="st-label">{t('ai.diversification')}</div>
              <div className="st-value" style={{ fontSize: 15 }}>{portfolio.diversification}/100</div>
              <ProgressBar value={portfolio.diversification} color={portfolio.diversification > 60 ? 'success' : 'warning'} height={6} />
            </div>
            <div className="stat-box" style={{ padding: 10 }}>
              <div className="st-label">{t('ai.best')}</div>
              <div className="st-value" style={{ fontSize: 13 }}>{portfolio.best.name}</div>
              <div className="st-sub" style={{ color: 'var(--success)' }}>+{portfolio.best.changePct}%</div>
            </div>
            <div className="stat-box" style={{ padding: 10 }}>
              <div className="st-label">{t('ai.worst')}</div>
              <div className="st-value" style={{ fontSize: 13 }}>{portfolio.worst.name}</div>
              <div className="st-sub" style={{ color: 'var(--danger)' }}>{portfolio.worst.changePct}%</div>
            </div>
          </div>
          <div className="feat-advice">
            <Bot size={14} style={{ flex: 'none', color: 'var(--accent)' }} />
            <div>
              <strong>{t('ai.advice')}</strong>
              {portfolio.advice.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>• {a}</div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="feat-note">{t('ai.noData')}</p>
      )}

      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('ai.savingProj')}</h4>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projection12.map((p) => ({ year: `${p.year}`, value: p.value }))} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gAi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatMoney(v, cur, { compact: true })} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#gAi)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="feat-note">
        {fr ? `Si vous continuez à épargner ${formatMoney(Math.max(0, Math.round(netAvg)), cur)}/mois à 6 %/an, votre épargne atteindra environ ` : `If you keep saving ${formatMoney(Math.max(0, Math.round(netAvg)), cur)}/month at 6%/yr, your savings will reach about `}
        <strong>{formatMoney(projection12[projection12.length - 1]?.value ?? 0, cur, { compact: true })}</strong>
        {fr ? ' dans 12 mois.' : ' in 12 months.'}
      </p>
    </div>
  );
}

/* ═══════════════════════════ 2. RAPPORTS ═══════════════════════════ */

function ReportsPanel() {
  const { t, state, showToast } = useApp();
  const { reports, markReport } = useFeatureStore();
  const [scope, setScope] = useState<'month' | '3' | 'all'>('month');
  const cur = state.settings.currency;

  const scopeTx = useMemo(() => {
    const thisMonth = monthKey(todayISO());
    if (scope === 'month') return state.transactions.filter((x) => monthKey(x.date) === thisMonth);
    if (scope === '3') {
      const d = new Date();
      d.setMonth(d.getMonth() - 2);
      const min = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return state.transactions.filter((x) => monthKey(x.date) >= min);
    }
    return state.transactions;
  }, [state.transactions, scope]);

  const generatePdf = () => {
    const rev = scopeTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const exp = scopeTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
    const rows = scopeTx
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 60)
      .map((x) => `<tr><td>${x.date}</td><td>${x.label}</td><td>${x.category}</td><td>${x.type === 'income' ? '+' : '-'}${formatMoney(x.amount, cur)}</td></tr>`)
      .join('');
    const html = `<!doctype html><html lang="${state.settings.lang}"><head><meta charset="utf-8"><title>LifeOS – Rapport</title>
<style>
body{font-family:Inter,system-ui,sans-serif;color:#212529;max-width:800px;margin:24px auto;padding:0 16px}
h1{font-size:22px;border-bottom:2px solid #212529;padding-bottom:8px}
h2{font-size:15px;margin-top:22px;color:#495057}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
th{background:#f1f3f5;text-align:left;padding:6px 8px}
td{padding:5px 8px;border-bottom:1px solid #e9ecef}
.stats{display:flex;gap:12px}.stat{flex:1;border:1px solid #e9ecef;border-radius:10px;padding:10px}
.stat b{display:block;font-size:16px}.stat span{font-size:11px;color:#6c757d}
.note{color:#6c757d;font-size:11px;margin-top:20px}
</style></head><body>
<h1>📊 LifeOS – ${state.settings.lang === 'fr' ? 'Rapport financier' : 'Financial report'} (${new Date().toLocaleDateString()})</h1>
<div class="stats">
<div class="stat"><b style="color:#28a745">${formatMoney(rev, cur)}</b><span>${t('fin.revenue')}</span></div>
<div class="stat"><b style="color:#dc3545">${formatMoney(exp, cur)}</b><span>${t('fin.expenses')}</span></div>
<div class="stat"><b>${formatMoney(rev - exp, cur)}</b><span>${t('fin.balance')}</span></div>
</div>
<h2>${t('budget.title')}</h2>
<table><tr><th>${t('tx.category')}</th><th>${t('budget.planned')}</th><th>${t('budget.spent')}</th></tr>
${state.budget.map((c) => {
  const spent = state.transactions.filter((x) => x.type === 'expense' && x.category === c.name && scopeTx.includes(x)).reduce((s, x) => s + x.amount, 0);
  return `<tr><td>${c.name}</td><td>${formatMoney(c.planned, cur)}</td><td>${formatMoney(spent, cur)}</td></tr>`;
}).join('')}</table>
<h2>${t('tx.title')}</h2>
<table><tr><th>${t('tx.date')}</th><th>${t('tx.label')}</th><th>${t('tx.category')}</th><th>${t('tx.amount')}</th></tr>${rows}</table>
<h2>${t('goals.title')}</h2>
<ul>${state.goals.map((g) => `<li>${g.title} — ${g.progress}%</li>`).join('')}</ul>
<p class="note">${t('rep.generatedBy')}</p>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      window.setTimeout(() => {
        try {
          w.print();
        } catch {
          /* impression bloquée */
        }
      }, 400);
      showToast(t('rep.opened'), 'success');
    } else {
      downloadBlob(`lifeos-rapport-${todayISO()}.html`, html, 'text/html');
      showToast(t('toast.exported'), 'success');
    }
    markReport('pdf');
  };

  const generateExcel = () => {
    const rows = scopeTx.map((x) => ({
      Date: x.date,
      Libellé: x.label,
      Catégorie: x.category,
      Type: x.type === 'income' ? 'Revenu' : 'Dépense',
      Montant: x.amount,
      Devise: cur,
    }));
    exportExcel(rows, `lifeos-rapport-${todayISO()}.xls`);
    markReport('excel');
    showToast(t('toast.exported'), 'success');
  };

  const generateCsv = () => {
    downloadCSV(
      `lifeos-rapport-${todayISO()}.csv`,
      scopeTx.map((x) => ({ date: x.date, label: x.label, category: x.category, type: x.type, amount: x.amount, currency: cur })),
    );
    showToast(t('toast.exported'), 'success');
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US') : t('feat.never');

  return (
    <div className="feat-panel">
      <div className="field" style={{ marginBottom: 12 }}>
        <label>{t('rep.scope')}</label>
        <div className="seg-group" style={{ alignSelf: 'flex-start' }}>
          {(['month', '3', 'all'] as const).map((s) => (
            <button key={s} className={`seg-btn ${scope === s ? 'active' : ''}`} onClick={() => setScope(s)}>
              {s === 'month' ? t('rep.scopeMonth') : s === '3' ? t('rep.scope3') : t('rep.scopeAll')}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={generatePdf}>
          <FileText size={14} /> {t('rep.pdf')}
        </button>
        <button className="btn" onClick={generateExcel}>
          <Download size={14} /> {t('rep.excel')}
        </button>
        <button className="btn" onClick={generateCsv}>
          <Download size={14} /> {t('rep.csv')}
        </button>
      </div>
      <div className="feat-status">
        <span>{t('rep.lastPdf')} : <strong>{fmtDate(reports.lastPdf)}</strong></span>
        <span>{t('rep.lastExcel')} : <strong>{fmtDate(reports.lastExcel)}</strong></span>
      </div>
      <p className="feat-note">{t('rep.contents')}</p>
    </div>
  );
}

/* ═══════════════════════════ 3. SYNC BANCAIRE ═══════════════════════════ */

const BANKS = [
  { id: 'attijari', name: 'Attijariwafa Bank', color: '#343a40' },
  { id: 'bp', name: 'Banque Populaire', color: '#495057' },
  { id: 'cih', name: 'CIH Bank', color: '#6c757d' },
  { id: 'sg', name: 'Société Générale', color: '#5b7388' },
  { id: 'bmce', name: 'BMCE Bank of Africa', color: '#5f7d6a' },
];

function BankSyncPanel() {
  const { t, state, addTx, showToast } = useApp();
  const { bankName, bankConnectedAt, connectBank, disconnectBank } = useFeatureStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [form, setForm] = useState({ login: '', password: '' });

  const importTransactions = (count: number) => {
    const base = todayISO();
    const samples = [
      { label: t('bank.txSalary'), category: 'Revenus', amount: 12500, type: 'income' as const },
      { label: t('bank.txRent'), category: 'Logement', amount: 3500, type: 'expense' as const },
      { label: t('bank.txSupermarket'), category: 'Alimentation', amount: 620, type: 'expense' as const },
      { label: t('bank.txInternet'), category: 'Factures', amount: 299, type: 'expense' as const },
      { label: t('bank.txTransfer'), category: 'Épargne', amount: 1500, type: 'expense' as const },
      { label: t('bank.txFreelance'), category: 'Revenus', amount: 2400, type: 'income' as const },
      { label: t('bank.txCoffee'), category: 'Loisirs', amount: 45, type: 'expense' as const },
      { label: t('bank.txFuel'), category: 'Transport', amount: 350, type: 'expense' as const },
    ];
    // Évite de ré-importer les mêmes libellés le même jour
    const existing = new Set(state.transactions.filter((x) => x.date === base).map((x) => x.label));
    const fresh = samples.filter((s) => !existing.has(s.label)).slice(0, count);
    fresh.forEach((s, i) => addTx({ ...s, date: addDays(base, -i) }));
    showToast(`${fresh.length} ${t('bank.imported')}`, 'success');
  };

  const doConnect = () => {
    if (!selected) return;
    setConnecting(true);
    window.setTimeout(() => {
      connectBank(BANKS.find((b) => b.id === selected)?.name ?? selected);
      setConnecting(false);
      setSelected(null);
      importTransactions(6);
    }, 1600);
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US') : '';

  return (
    <div className="feat-panel">
      {bankName ? (
        <>
          <div className="feat-status success">
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
            <span>
              {t('bank.connectedTo')} <strong>{bankName}</strong>
              {bankConnectedAt && <small style={{ display: 'block', color: 'var(--text-muted)' }}>{fmtDate(bankConnectedAt)}</small>}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn primary" onClick={() => importTransactions(4)}>
              <Landmark size={14} /> {t('bank.import')}
            </button>
            <button className="btn danger" onClick={() => { disconnectBank(); showToast(t('bank.disconnected'), 'info'); }}>
              {t('bank.disconnect')}
            </button>
          </div>
          <p className="feat-note" style={{ marginTop: 12 }}>{t('bank.readonly')}</p>
        </>
      ) : (
        <>
          <p className="feat-note">{t('bank.choose')}</p>
          <div className="bank-grid">
            {BANKS.map((b) => (
              <button key={b.id} className={`bank-card ${selected === b.id ? 'active' : ''}`} onClick={() => setSelected(b.id)}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: b.color, display: 'inline-block' }} />
                <span>{b.name}</span>
              </button>
            ))}
          </div>
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <div className="field">
                <label>{t('bank.login')}</label>
                <input className="input" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} autoFocus />
              </div>
              <div className="field">
                <label>{t('bank.pw')}</label>
                <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn primary" onClick={doConnect} disabled={connecting}>
                {connecting ? <Loader2 size={14} className="spin" /> : <Landmark size={14} />}
                {connecting ? t('bank.connecting') : t('bank.confirm')}
              </button>
              <p className="feat-note">{t('bank.readonly')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════ 4. CLOUD SYNC ═══════════════════════════ */

function CloudPanel() {
  const { t, state, showToast, importAll } = useApp();
  const { autoBackup, setAutoBackup, lastCloudSync, setLastCloudSync } = useFeatureStore();
  const fileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sauvegarde automatique quotidienne
    if (autoBackup && lastCloudSync) {
      const last = new Date(lastCloudSync).getTime();
      if (Date.now() - last > 24 * 3600 * 1000) syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBackup]);

  const syncNow = () => {
    try {
      localStorage.setItem('lifeos:cloud-backup', JSON.stringify({ state, at: new Date().toISOString() }));
      setLastCloudSync(new Date().toISOString());
      showToast(t('cloud.synced'), 'success');
    } catch {
      showToast('Erreur', 'error');
    }
  };

  const downloadBackup = () => {
    import('../../utils/helpers').then(({ downloadJSON }) => downloadJSON(`lifeos-cloud-${todayISO()}.json`, state));
  };

  const restoreFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const payload = data.state ?? data;
        if (payload && typeof payload === 'object') {
          importAll(payload);
          showToast(t('set.restoreDone'), 'success');
        }
      } catch {
        showToast('JSON invalide', 'error');
      }
    };
    reader.readAsText(file);
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(state.settings.lang === 'fr' ? 'fr-FR' : 'en-US') : t('feat.never');

  return (
    <div className="feat-panel">
      <div className="feat-status">
        <Cloud size={16} style={{ color: 'var(--accent)' }} />
        <span>
          {t('cloud.last')} : <strong>{fmtDate(lastCloudSync)}</strong>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="btn primary" onClick={syncNow}>
          <Cloud size={14} /> {t('cloud.syncNow')}
        </button>
        <button className="btn" onClick={downloadBackup}>
          <Download size={14} /> {t('cloud.download')}
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          <Play size={14} /> {t('cloud.restore')}
        </button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && restoreFile(e.target.files[0])} />
      </div>
      <div className="feat-row" style={{ marginTop: 14 }}>
        <span>
          <strong>{t('cloud.auto')}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{t('cloud.autoDesc')}</small>
        </span>
        <button className={`switch ${autoBackup ? 'on' : ''}`} onClick={() => setAutoBackup(!autoBackup)} role="switch" aria-checked={autoBackup} />
      </div>
      <p className="feat-note" style={{ marginTop: 10 }}>{t('cloud.multi')}</p>
    </div>
  );
}

/* ═══════════════════════════ 5. FAMILLE ═══════════════════════════ */

function FamilyPanel() {
  const { t, state, addBudgetCat, showToast } = useApp();
  const { family, addFamilyMember, removeFamilyMember } = useFeatureStore();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const add = () => {
    const b = Number(budget);
    if (!name.trim() || !b || b <= 0) return;
    addFamilyMember(name.trim(), b);
    // Crée aussi une catégorie de budget dédiée
    if (!state.budget.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      addBudgetCat({ name: name.trim(), planned: b, color: CHART_COLORS[(state.budget.length + family.length) % CHART_COLORS.length] });
    }
    setName('');
    setBudget('');
    showToast(t('fam.added'), 'success');
  };

  const total = family.reduce((s, m) => s + m.budget, 0);

  return (
    <div className="feat-panel">
      <p className="feat-note">{t('fam.hint')}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 2, minWidth: 140 }} placeholder={t('fam.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" style={{ flex: 1, minWidth: 110 }} type="number" min={0} placeholder={`${t('fam.budget')} (${state.settings.currency})`} value={budget} onChange={(e) => setBudget(e.target.value)} />
        <button className="btn primary" onClick={add}>
          <UserPlus size={14} /> {t('fam.add')}
        </button>
      </div>
      <div className="stat-grid" style={{ marginTop: 14 }}>
        <div className="stat-box" style={{ padding: 10 }}>
          <div className="st-label"><Users size={11} /> {t('fam.members')}</div>
          <div className="st-value" style={{ fontSize: 15 }}>{family.length}</div>
        </div>
        <div className="stat-box" style={{ padding: 10 }}>
          <div className="st-label">{t('fam.total')}</div>
          <div className="st-value" style={{ fontSize: 15 }}>{formatMoney(total, state.settings.currency, { compact: true })}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {family.length === 0 && <p className="feat-note">{t('fam.empty')}</p>}
        {family.map((m) => (
          <div key={m.id} className="feat-row">
            <span className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{m.name.slice(0, 2).toUpperCase()}</span>
            <strong style={{ flex: 1 }}>{m.name}</strong>
            <span className="badge neutral">{formatMoney(m.budget, state.settings.currency, { compact: true })}/mois</span>
            <button className="icon-btn" style={{ width: 24, height: 24, opacity: 0.4 }} onClick={() => removeFamilyMember(m.id)} aria-label={t('fam.remove')}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 6. INTÉGRATIONS ═══════════════════════ */

function IntegrationsPanel() {
  const { t, state, showToast } = useApp();
  const { integrations, toggleIntegration } = useFeatureStore();
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggle = (key: string) => {
    const on = !integrations[key];
    if (on) {
      setConnecting(key);
      window.setTimeout(() => {
        toggleIntegration(key, true);
        setConnecting(null);
        showToast(`${t(INT_NAMES[key])} : ${t('int.connected')} ✓`, 'success');
      }, 900);
    } else {
      toggleIntegration(key, false);
      showToast(`${t(INT_NAMES[key])} : ${t('int.disconnected')}`, 'info');
    }
  };

  const rows: { key: string; icon: LucideIcon; exportIt: () => void; exportLabel: string }[] = [
    {
      key: 'google',
      icon: CalendarDays,
      exportLabel: t('int.exportIcs'),
      exportIt: () => {
        exportEventsIcs(state.events, 'lifeos-google-calendar.ics');
        showToast(t('int.exported'), 'success');
      },
    },
    {
      key: 'outlook',
      icon: CalendarDays,
      exportLabel: t('int.exportIcs'),
      exportIt: () => {
        exportEventsIcs(state.events, 'lifeos-outlook.ics');
        showToast(t('int.exported'), 'success');
      },
    },
    {
      key: 'notion',
      icon: FileText,
      exportLabel: t('int.exportMd'),
      exportIt: () => {
        exportNotesMarkdown(state.notes, 'lifeos-notion.md');
        showToast(t('int.exported'), 'success');
      },
    },
    {
      key: 'trello',
      icon: LayoutTemplate,
      exportLabel: t('int.exportCsv'),
      exportIt: () => {
        exportTasksCsv(state.tasks, 'lifeos-trello.csv');
        showToast(t('int.exported'), 'success');
      },
    },
  ];

  return (
    <div className="feat-panel">
      {rows.map((r) => {
        const Icon = r.icon;
        const on = Boolean(integrations[r.key]);
        return (
          <div key={r.key} className="feat-row">
            <span className="pi-icon"><Icon size={15} /></span>
            <span style={{ flex: 1 }}>
              <strong>{t(INT_NAMES[r.key])}</strong>
              <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                {connecting === r.key ? t('int.connecting') : on ? t('int.connected') : t('int.disconnected')}
              </small>
            </span>
            {on && (
              <button className="btn sm" onClick={r.exportIt}>
                <Download size={12} /> {r.exportLabel}
              </button>
            )}
            <button className={`btn sm ${on ? '' : 'primary'}`} onClick={() => toggle(r.key)} disabled={connecting === r.key}>
              {connecting === r.key ? <Loader2 size={12} className="spin" /> : on ? t('int.disconnect') : t('int.connect')}
            </button>
          </div>
        );
      })}
      <p className="feat-note" style={{ marginTop: 12 }}>{t('int.hint')}</p>
    </div>
  );
}

const INT_NAMES: Record<string, string> = {
  google: 'int.google',
  outlook: 'int.outlook',
  notion: 'int.notion',
  trello: 'int.trello',
};

/* ═══════════════════════════ 7. PWA HORS-LIGNE ═══════════════════════════ */

const deferredPromptRef: { current: Event | null } = { current: null };
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptRef.current = e;
  });
}

function PWAPanel() {
  const { t } = useApp();
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    const handler = () => setInstalled(true);
    window.addEventListener('appinstalled', handler);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
      window.removeEventListener('appinstalled', handler);
    };
  }, []);

  const install = async () => {
    const prompt = deferredPromptRef.current as (Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }) | null;
    if (prompt?.prompt) {
      await prompt.prompt();
      deferredPromptRef.current = null;
    } else {
      alert(t('pwa.howtoDesc'));
    }
  };

  return (
    <div className="feat-panel">
      <div className="feat-status">
        <Smartphone size={16} style={{ color: 'var(--accent)' }} />
        <span>
          <strong>{t('pwa.title')}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>
            {online ? t('pwa.online') : t('pwa.offline')} · {t('pwa.cache')}
          </small>
        </span>
      </div>
      <button className="btn primary" style={{ marginTop: 12 }} onClick={install} disabled={installed}>
        <Smartphone size={14} /> {installed ? t('pwa.installed') : t('pwa.install')}
      </button>
      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('pwa.howto')}</h4>
      <p className="feat-note">{t('pwa.howtoDesc')}</p>
      <h4 className="feat-h4" style={{ marginTop: 12 }}>{t('pwa.offline')}</h4>
      <p className="feat-note">{t('pwa.cache')}</p>
    </div>
  );
}

/* ═══════════════════════════ 8. TEMPLATES ═══════════════════════════ */

interface BudgetTemplate { name: string; desc: string; cats: { name: string; planned: number }[] }
interface HabitTemplate { name: string; habits: { name: string; icon: string; color: string }[] }
interface GoalTemplate { name: string; goal: { title: string; specific: string; measurable: string; deadline: string; category: string } }

function TemplatesPanel() {
  const { t, state, addBudgetCat, deleteBudgetCat, addHabit, addGoal, showToast } = useApp();
  const cur = state.settings.currency;

  const budgetTemplates: BudgetTemplate[] = [
    {
      name: t('tpl.b.student'),
      desc: t('tpl.b.studentDesc'),
      cats: [
        { name: 'Logement', planned: 2000 },
        { name: 'Alimentation', planned: 1000 },
        { name: 'Transports', planned: 300 },
        { name: 'Études', planned: 400 },
        { name: 'Loisirs', planned: 300 },
      ],
    },
    {
      name: t('tpl.b.family'),
      desc: t('tpl.b.familyDesc'),
      cats: [
        { name: 'Logement', planned: 4000 },
        { name: 'Alimentation', planned: 2500 },
        { name: 'École & enfants', planned: 1200 },
        { name: 'Santé', planned: 500 },
        { name: 'Loisirs', planned: 800 },
        { name: 'Épargne', planned: 1500 },
      ],
    },
    {
      name: t('tpl.b.freelance'),
      desc: t('tpl.b.freelanceDesc'),
      cats: [
        { name: 'Équipement', planned: 800 },
        { name: 'Formation', planned: 500 },
        { name: 'Impôts & taxes', planned: 1500 },
        { name: 'Marketing', planned: 400 },
        { name: 'Épargne', planned: 2000 },
      ],
    },
    {
      name: t('tpl.b.minimal'),
      desc: t('tpl.b.minimalDesc'),
      cats: [
        { name: 'Essentiel', planned: 3500 },
        { name: 'Épargne', planned: 2000 },
        { name: 'Plaisir', planned: 500 },
      ],
    },
  ];

  const habitTemplates: HabitTemplate[] = [
    {
      name: t('tpl.h.morning'),
      habits: [
        { name: t('tpl.h.morning1'), icon: 'activity', color: '#6c757d' },
        { name: t('tpl.h.morning2'), icon: 'brain', color: '#5f7d6a' },
        { name: t('tpl.h.morning3'), icon: 'book', color: '#5b7388' },
      ],
    },
    {
      name: t('tpl.h.health'),
      habits: [
        { name: t('tpl.h.health1'), icon: 'activity', color: '#5f7d6a' },
        { name: t('tpl.h.health2'), icon: 'droplets', color: '#6c757d' },
        { name: t('tpl.h.health3'), icon: 'moon', color: '#495057' },
      ],
    },
  ];

  const goalTemplates: GoalTemplate[] = [
    {
      name: t('tpl.g.savings'),
      goal: {
        title: t('tpl.g.savings1'),
        specific: t('tpl.g.savings2'),
        measurable: '100 000 ' + cur,
        deadline: addDays(todayISO(), 730),
        category: 'Finance',
      },
    },
    {
      name: t('tpl.g.fitness'),
      goal: {
        title: t('tpl.g.fitness1'),
        specific: t('tpl.g.fitness2'),
        measurable: '3x/semaine',
        deadline: addDays(todayISO(), 180),
        category: 'Santé',
      },
    },
  ];

  const applyBudget = (tpl: BudgetTemplate) => {
    if (!window.confirm(t('tpl.replace'))) return;
    state.budget.forEach((c) => deleteBudgetCat(c.id));
    tpl.cats.forEach((c) => addBudgetCat({ name: c.name, planned: c.planned, color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)] }));
    showToast(t('tpl.applied'), 'success');
  };

  const applyHabits = (tpl: HabitTemplate) => {
    const existing = new Set(state.habits.map((h) => h.name));
    let added = 0;
    tpl.habits.forEach((h) => {
      if (!existing.has(h.name)) {
        addHabit(h);
        added++;
      }
    });
    showToast(`${added} ${t('tpl.added')}`, 'success');
  };

  const applyGoal = (tpl: GoalTemplate) => {
    addGoal({ ...tpl.goal, progress: 0 });
    showToast(t('tpl.applied'), 'success');
  };

  return (
    <div className="feat-panel">
      <h4 className="feat-h4">{t('tpl.budgets')}</h4>
      <div className="tpl-grid">
        {budgetTemplates.map((tpl) => (
          <div key={tpl.name} className="tpl-card">
            <strong>{tpl.name}</strong>
            <small>{tpl.desc}</small>
            <span className="badge neutral">{tpl.cats.length} {t('budget.title').toLowerCase()}</span>
            <button className="btn sm primary" onClick={() => applyBudget(tpl)}>{t('tpl.apply')}</button>
          </div>
        ))}
      </div>
      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('tpl.habits')}</h4>
      <div className="tpl-grid">
        {habitTemplates.map((tpl) => (
          <div key={tpl.name} className="tpl-card">
            <strong>{tpl.name}</strong>
            <small>{tpl.habits.map((h) => h.name).join(' · ')}</small>
            <button className="btn sm primary" onClick={() => applyHabits(tpl)}>{t('tpl.apply')}</button>
          </div>
        ))}
      </div>
      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('tpl.goals')}</h4>
      <div className="tpl-grid">
        {goalTemplates.map((tpl) => (
          <div key={tpl.name} className="tpl-card">
            <strong>{tpl.name}</strong>
            <small>{tpl.goal.measurable}</small>
            <button className="btn sm primary" onClick={() => applyGoal(tpl)}>{t('tpl.apply')}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 9. ALERTES SMS / EMAIL ═══════════════════════ */

function AlertsPanel() {
  const { t, state, showToast } = useApp();
  const { alertEmail, setAlertEmail, desktopAlerts, setDesktopAlerts, smsAlerts, setSmsAlerts } = useFeatureStore();
  const [permission, setPermission] = useState<string>(() => {
    try {
      return 'Notification' in window ? Notification.permission : 'unsupported';
    } catch {
      return 'unsupported';
    }
  });

  const enableDesktop = (on: boolean) => {
    if (on && permission === 'default') {
      Notification.requestPermission().then((p) => {
        setPermission(p);
        if (p === 'granted') {
          setDesktopAlerts(true);
          showToast(t('al.permissionGranted'), 'success');
        } else {
          showToast(t('al.permissionDenied'), 'warning');
        }
      });
    } else {
      setDesktopAlerts(on);
    }
  };

  const testAlert = () => {
    if (permission === 'granted') {
      try {
        new Notification('LifeOS', { body: t('al.testSent') });
      } catch {
        /* non supporté */
      }
    }
    showToast(t('al.testSent'), 'success');
  };

  return (
    <div className="feat-panel">
      <div className="field" style={{ marginBottom: 12 }}>
        <label>{t('al.email')}</label>
        <input className="input" type="email" placeholder="vous@exemple.com" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} />
        <small style={{ color: 'var(--text-muted)' }}>{t('al.emailDesc')}</small>
      </div>
      <div className="feat-row">
        <span>
          <strong>{t('al.desktop')}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{t('al.desktopDesc')}</small>
        </span>
        <button className={`switch ${desktopAlerts ? 'on' : ''}`} onClick={() => enableDesktop(!desktopAlerts)} role="switch" aria-checked={desktopAlerts} />
      </div>
      <div className="feat-row">
        <span>
          <strong>{t('al.sms')}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{t('al.smsDesc')}</small>
        </span>
        <button className={`switch ${smsAlerts ? 'on' : ''}`} onClick={() => setSmsAlerts(!smsAlerts)} role="switch" aria-checked={smsAlerts} />
      </div>
      <button className="btn primary" style={{ marginTop: 12 }} onClick={testAlert}>
        <Bell size={14} /> {t('al.test')}
      </button>
      <p className="feat-note" style={{ marginTop: 10 }}>{t('al.budgetAuto')}</p>
    </div>
  );
}

/* ═══════════════════════════ 10. API OUVERTE ═══════════════════════════ */

function ApiPanel() {
  const { t, state, showToast } = useApp();
  const { apiKey, generateApiKey } = useFeatureStore();
  const [endpoint, setEndpoint] = useState('summary');
  const [copied, setCopied] = useState(false);

  const endpoints: { id: string; label: string; data: unknown }[] = [
    {
      id: 'summary',
      label: 'GET /api/summary',
      data: {
        profile: { name: state.profile.name },
        currency: state.settings.currency,
        transactions: state.transactions.length,
        balance: state.transactions.reduce((s, x) => s + (x.type === 'income' ? x.amount : -x.amount), 0),
        tasksOpen: state.tasks.filter((x) => !x.done).length,
        goals: state.goals.length,
        savings: state.savingsGoals.reduce((s, g) => s + g.saved, 0),
      },
    },
    { id: 'transactions', label: 'GET /api/transactions', data: state.transactions.slice(0, 20) },
    { id: 'budget', label: 'GET /api/budget', data: state.budget },
    { id: 'tasks', label: 'GET /api/tasks', data: state.tasks },
    { id: 'profile', label: 'GET /api/profile', data: state.profile },
  ];

  const copy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      showToast(t('api.copied'), 'success');
    } catch {
      /* clipboard indisponible */
    }
  };

  const current = endpoints.find((e) => e.id === endpoint) ?? endpoints[0];
  const json = JSON.stringify(current.data, null, 2);

  return (
    <div className="feat-panel">
      <div className="feat-row">
        <span>
          <strong>{t('api.key')}</strong>
          <small className="code-key" style={{ display: 'block', marginTop: 2 }}>{apiKey ?? '—'}</small>
        </span>
        <button className="btn sm primary" onClick={() => generateApiKey()}>
          <KeyRound size={12} /> {apiKey ? t('api.regenerate') : t('api.generate')}
        </button>
        {apiKey && (
          <button className="btn sm" onClick={() => copy(apiKey)}>
            <Copy size={12} /> {copied ? '✓' : t('api.copy')}
          </button>
        )}
      </div>
      <h4 className="feat-h4" style={{ marginTop: 14 }}>{t('api.docs')}</h4>
      <div className="code-block" style={{ fontSize: 11.5 }}>
        {endpoints.map((e) => (
          <div key={e.id}>{e.label}</div>
        ))}
      </div>
      <h4 className="feat-h4" style={{ marginTop: 14 }}>{t('api.console')}</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="select" style={{ flex: 1, minWidth: 180 }} value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
          {endpoints.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
        <button className="btn sm" onClick={() => copy(json)}>
          <Copy size={12} /> {t('api.copy')}
        </button>
      </div>
      <pre className="code-block" style={{ maxHeight: 220, overflow: 'auto', marginTop: 10 }}>{json}</pre>
      <p className="feat-note">{t('api.local')}</p>
    </div>
  );
}

/* ═══════════════════════════ 11. THÈMES PERSONNALISÉS ═══════════════════════════ */

function CustomThemesPanel() {
  const { t, state, updateSettings, showToast } = useApp();
  const { customThemes, addCustomTheme, deleteCustomTheme } = useFeatureStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6c757d');

  const save = () => {
    if (!name.trim()) return;
    addCustomTheme(name.trim(), color);
    setName('');
    showToast(t('th.saved'), 'success');
  };

  return (
    <div className="feat-panel">
      <div className="feat-row">
        <span>
          <strong>{t('th.current')}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>
            {customThemes.find((x) => x.id === state.settings.accent)?.name ?? state.settings.accent}
          </small>
        </span>
        <span className="swatch" style={{ background: 'var(--accent)', border: '2px solid var(--text)' }} />
      </div>
      <h4 className="feat-h4" style={{ marginTop: 14 }}>{t('th.new')}</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 2, minWidth: 140 }} placeholder={t('th.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label={t('th.color')} />
        <button className="btn primary" onClick={save}>
          <Palette size={14} /> {t('th.save')}
        </button>
      </div>
      <h4 className="feat-h4" style={{ marginTop: 14 }}>{t('th.my')}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {customThemes.length === 0 && <p className="feat-note">{t('th.empty')}</p>}
        {customThemes.map((theme) => (
          <div key={theme.id} className="feat-row">
            <span className="swatch" style={{ background: theme.color, border: state.settings.accent === theme.id ? '2px solid var(--text)' : '2px solid transparent' }} />
            <strong style={{ flex: 1 }}>{theme.name}</strong>
            <button
              className={`btn sm ${state.settings.accent === theme.id ? '' : 'primary'}`}
              onClick={() => {
                updateSettings({ accent: theme.id });
                showToast(`${theme.name} ${t('th.applied')}`, 'success');
              }}
            >
              {state.settings.accent === theme.id ? '✓' : t('th.apply')}
            </button>
            <button className="icon-btn" style={{ width: 24, height: 24, opacity: 0.4 }} onClick={() => deleteCustomTheme(theme.id)} aria-label={t('th.delete')}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 12. SUPPORT ═══════════════════════════ */

function SupportPanel() {
  const { t, showToast } = useApp();
  const { tickets, addTicket, removeTicket } = useFeatureStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const send = () => {
    if (!subject.trim() || !message.trim()) return;
    addTicket(subject.trim(), message.trim());
    setSubject('');
    setMessage('');
    showToast(t('sup.sent'), 'success');
  };

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('lifeos:chat-toggle'));
    useUIStore.getState().setView('dashboard');
  };

  return (
    <div className="feat-panel">
      <button className="btn primary" style={{ width: '100%' }} onClick={openChat}>
        <MessageCircle size={14} /> {t('sup.chat')}
      </button>
      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('sup.form')}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="input" placeholder={t('sup.subject')} value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="textarea" rows={4} placeholder={t('sup.message')} value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="btn primary" onClick={send} disabled={!subject.trim() || !message.trim()}>
          <Send size={14} /> {t('sup.send')}
        </button>
      </div>
      <h4 className="feat-h4" style={{ marginTop: 16 }}>{t('sup.list')}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tickets.length === 0 && <p className="feat-note">{t('sup.empty')}</p>}
        {tickets.map((tk) => (
          <div key={tk.id} className="note-card" style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 12.5 }}>{tk.subject}</strong>
              <button className="icon-btn" style={{ width: 20, height: 20, opacity: 0.35 }} onClick={() => removeTicket(tk.id)} aria-label={t('act.delete')}>
                <Trash2 size={11} />
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-soft)', marginTop: 3 }}>{tk.message}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              {new Date(tk.date).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ REGISTRE + MODALE ═══════════════════════════ */

export const FEATURE_REGISTRY: { id: FeatureId; icon: LucideIcon; key: string; descKey: string; Panel: React.ComponentType }[] = [
  { id: 'ai', icon: Bot, key: 'prem.f1', descKey: 'prem.f1d', Panel: AIAdvancedPanel },
  { id: 'reports', icon: FileText, key: 'prem.f2', descKey: 'prem.f2d', Panel: ReportsPanel },
  { id: 'bank', icon: Landmark, key: 'prem.f3', descKey: 'prem.f3d', Panel: BankSyncPanel },
  { id: 'cloud', icon: Cloud, key: 'prem.f4', descKey: 'prem.f4d', Panel: CloudPanel },
  { id: 'family', icon: Users, key: 'prem.f5', descKey: 'prem.f5d', Panel: FamilyPanel },
  { id: 'integrations', icon: Wifi, key: 'prem.f6', descKey: 'prem.f6d', Panel: IntegrationsPanel },
  { id: 'pwa', icon: Smartphone, key: 'prem.f7', descKey: 'prem.f7d', Panel: PWAPanel },
  { id: 'templates', icon: LayoutTemplate, key: 'prem.f8', descKey: 'prem.f8d', Panel: TemplatesPanel },
  { id: 'alerts', icon: Bell, key: 'prem.f9', descKey: 'prem.f9d', Panel: AlertsPanel },
  { id: 'api', icon: KeyRound, key: 'prem.f10', descKey: 'prem.f10d', Panel: ApiPanel },
  { id: 'themes', icon: Palette, key: 'prem.f11', descKey: 'prem.f11d', Panel: CustomThemesPanel },
  { id: 'support', icon: Mail, key: 'prem.f12', descKey: 'prem.f12d', Panel: SupportPanel },
];

/** Modale globale d'une fonctionnalité — montée au niveau de l'app */
export function FeatureModal() {
  const { t } = useApp();
  const featureOpen = useUIStore((s) => s.featureOpen);
  const setFeatureOpen = useUIStore((s) => s.setFeatureOpen);

  const feature = FEATURE_REGISTRY.find((f) => f.id === featureOpen);
  if (!feature) return null;
  const Panel = feature.Panel;

  return (
    <Modal
      open
      onClose={() => setFeatureOpen(null)}
      size="lg"
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <feature.icon size={18} style={{ color: 'var(--accent)' }} />
          {t(feature.key)}
          <span className="badge success" style={{ fontSize: 9 }}>✓ {t('prem.freeBadge')}</span>
        </span>
      }
    >
      <Panel />
    </Modal>
  );
}

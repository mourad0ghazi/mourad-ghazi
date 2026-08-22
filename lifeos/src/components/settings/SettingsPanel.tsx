// ─────────────────────────────────────────────────────────────
// LifeOS – Paramètres (v2)
// SettingsContent : contenu réutilisable (page ou modale)
// SettingsPanel : version modale
// ─────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import {
  Bell,
  Crown,
  Database,
  Download,
  Globe,
  ImagePlus,
  Keyboard,
  LayoutGrid,
  Lock,
  Palette,
  RotateCcw,
  Shield,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Toggle, rippleHandler } from '../ui';
import { ACCENTS, CURRENCIES, TIMEZONES } from '../../utils/helpers';
import { STORAGE_KEYS } from '../../utils/constants';
import { isValidEmail, isValidPin } from '../../utils/validators';
import type { CoachFreq, Density, HourFormat, ThemeMode } from '../../types';

type Tab = 'profile' | 'appearance' | 'region' | 'dashboard' | 'notifications' | 'data' | 'security' | 'shortcuts' | 'premium';

const TABS: { id: Tab; icon: typeof User; key: string }[] = [
  { id: 'profile', icon: User, key: 'set.profile' },
  { id: 'appearance', icon: Palette, key: 'set.appearance' },
  { id: 'region', icon: Globe, key: 'set.region' },
  { id: 'dashboard', icon: LayoutGrid, key: 'set.dashboard' },
  { id: 'notifications', icon: Bell, key: 'set.notifications' },
  { id: 'data', icon: Database, key: 'set.data' },
  { id: 'security', icon: Shield, key: 'set.security' },
  { id: 'shortcuts', icon: Keyboard, key: 'set.shortcuts' },
  { id: 'premium', icon: Crown, key: 'set.premium' },
];

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function SettingsContent({ initialTab = 'profile' }: { initialTab?: Tab }) {
  const { t, state, updateSettings, updateProfile, resetLayout, toggleWidget, isHidden, showToast, exportAll, importAll, resetAll, openPremium } = useApp();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [pinDraft, setPinDraft] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastBackup);
    } catch {
      return null;
    }
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const s = state.settings;

  const lastBackupLabel = lastBackupAt
    ? new Date(lastBackupAt).toLocaleString(s.lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : t('set.backupNever');

  // ── Sauvegarde manuelle (instantané complet dans localStorage) ──
  const backupNow = () => {
    try {
      const snapshot = {
        state,
        at: new Date().toISOString(),
        version: '2.1',
      };
      localStorage.setItem(STORAGE_KEYS.manualBackup, JSON.stringify(snapshot));
      localStorage.setItem(STORAGE_KEYS.lastBackup, snapshot.at);
      setLastBackupAt(snapshot.at);
      showToast(t('set.backupDone'), 'success');
    } catch {
      showToast('Erreur de sauvegarde', 'error');
    }
  };

  const restoreBackup = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.manualBackup);
      if (!raw) {
        showToast(t('set.restoreNone'), 'warning');
        return;
      }
      const snapshot = JSON.parse(raw);
      if (snapshot?.state && typeof snapshot.state === 'object') {
        importAll(snapshot.state);
        showToast(t('set.restoreDone'), 'success');
      }
    } catch {
      showToast(t('set.restoreNone'), 'warning');
    }
  };

  const uploadAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: String(reader.result) });
      showToast(t('toast.saved'), 'success');
    };
    reader.readAsDataURL(file);
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data && typeof data === 'object') importAll(data);
        else showToast('JSON invalide', 'error');
      } catch {
        showToast('JSON invalide', 'error');
      }
    };
    reader.readAsText(file);
  };

  const SHORTCUTS: { keys: string; label: string }[] = [
    { keys: 'Ctrl + K', label: t('set.kSearchCtrl') },
    { keys: 'Ctrl + T', label: t('set.kTaskCtrl') },
    { keys: 'Ctrl + N', label: t('set.kNoteCtrl') },
    { keys: 'Ctrl + M', label: t('set.kTxCtrl') },
    { keys: 'Ctrl + /', label: t('set.kChatCtrl') },
    { keys: 'Ctrl + Shift + L', label: t('set.kThemeCtrl') },
    { keys: 'Ctrl + ,', label: t('set.kSettingsCtrl') },
    { keys: 'Ctrl + ?', label: t('set.kHelpCtrl') },
    { keys: 'P', label: t('set.kPomoPlain') },
    { keys: 'L', label: t('set.kLock') },
  ];

  const anim = (key: keyof typeof s.animations) => (
    <div className="settings-row" style={{ padding: '8px 0' }}>
      <span className="sr-label">{t(key === 'page' ? 'set.animPage' : key === 'cards' ? 'set.animCards' : key === 'counters' ? 'set.animCounters' : key === 'smoke' ? 'set.animSmoke' : 'set.animParallax')}</span>
      <Toggle on={s.animations[key]} onChange={(v) => updateSettings({ animations: { ...s.animations, [key]: v } })} />
    </div>
  );

  return (
    <div>
      <div className="settings-tabs">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          return (
            <button key={tb.id} className={`settings-tab ${tab === tb.id ? 'active' : ''}`} onClick={(e) => { rippleHandler(e); setTab(tb.id); }}>
              <Icon size={14} />
              {t(tb.key)}
            </button>
          );
        })}
      </div>

      {/* ── PROFIL ── */}
      {tab === 'profile' && (
        <div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <span className="avatar lg">
              {state.profile.avatar ? <img src={state.profile.avatar} alt="" /> : state.profile.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={13} /> {t('set.upload')}
              </button>
              {state.profile.avatar && (
                <button className="btn sm danger" onClick={() => updateProfile({ avatar: null })}>
                  <Trash2 size={13} /> {t('set.removePhoto')}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field">
              <label>{t('set.name')}</label>
              <input className="input" value={state.profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('set.email')}</label>
              <input
                className="input"
                type="email"
                value={state.profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
                style={{ borderColor: state.profile.email && !isValidEmail(state.profile.email) ? 'var(--danger)' : undefined }}
              />
              {state.profile.email && !isValidEmail(state.profile.email) && (
                <span style={{ fontSize: 11, color: 'var(--danger)' }}>✗ Email invalide</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('set.phone')}</label>
                <input className="input" type="tel" value={state.profile.phone ?? ''} onChange={(e) => updateProfile({ phone: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('set.birthday')}</label>
                <input className="input" type="date" value={state.profile.birthday ?? ''} onChange={(e) => updateProfile({ birthday: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>{t('set.bio')}</label>
              <textarea className="textarea" rows={3} value={state.profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* ── APPARENCE ── */}
      {tab === 'appearance' && (
        <div>
          <div className="settings-row">
            <span className="sr-label">{t('set.theme')}</span>
            <div className="seg-group">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((m) => (
                <button key={m} className={`seg-btn ${s.theme === m ? 'active' : ''}`} onClick={() => updateSettings({ theme: m })}>
                  {t(`set.theme${m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Auto'}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.accent')}</span>
            <div className="swatch-row">
              {Object.entries(ACCENTS).map(([key, acc]) => (
                <button key={key} className={`swatch ${s.accent === key ? 'active' : ''}`} style={{ background: acc.color }} title={acc.name} onClick={() => updateSettings({ accent: key })} aria-label={acc.name} />
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.density')}</span>
            <div className="seg-group">
              {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
                <button key={d} className={`seg-btn ${s.density === d ? 'active' : ''}`} onClick={() => updateSettings({ density: d })}>
                  {t(`set.d${d === 'compact' ? 'Compact' : d === 'comfortable' ? 'Comfortable' : 'Spacious'}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.cardBorders')}</span>
              <div className="sr-desc">{t('set.cardBordersDesc')}</div>
            </span>
            <Toggle on={s.cardBorders} onChange={(v) => updateSettings({ cardBorders: v })} />
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.cardShadows')}</span>
              <div className="sr-desc">{t('set.cardShadowsDesc')}</div>
            </span>
            <Toggle on={s.cardShadows} onChange={(v) => updateSettings({ cardShadows: v })} />
          </div>
          <div style={{ margin: '12px 0 4px' }}>
            <span className="sr-label">{t('set.animations')}</span>
          </div>
          {anim('page')}
          {anim('cards')}
          {anim('counters')}
          {anim('smoke')}
          {anim('parallax')}
        </div>
      )}

      {/* ── LANGUE & RÉGION ── */}
      {tab === 'region' && (
        <div>
          <div className="settings-row">
            <span className="sr-label">{t('set.lang')}</span>
            <div className="seg-group">
              <button className={`seg-btn ${s.lang === 'fr' ? 'active' : ''}`} onClick={() => updateSettings({ lang: 'fr' })}>🇫🇷 Français</button>
              <button className={`seg-btn ${s.lang === 'en' ? 'active' : ''}`} onClick={() => updateSettings({ lang: 'en' })}>🇬🇧 English</button>
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.currency')}</span>
            <select className="select" style={{ width: 140 }} value={s.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.dateFormat')}</span>
            <div className="seg-group">
              <button className={`seg-btn ${s.dateFormat === 'ddmmyyyy' ? 'active' : ''}`} onClick={() => updateSettings({ dateFormat: 'ddmmyyyy' })}>JJ/MM/AAAA</button>
              <button className={`seg-btn ${s.dateFormat === 'mmddyyyy' ? 'active' : ''}`} onClick={() => updateSettings({ dateFormat: 'mmddyyyy' })}>MM/JJ/AAAA</button>
              <button className={`seg-btn ${s.dateFormat === 'yyyymmdd' ? 'active' : ''}`} onClick={() => updateSettings({ dateFormat: 'yyyymmdd' })}>AAAA-MM-JJ</button>
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.hourFormat')}</span>
            <div className="seg-group">
              {(['24', '12'] as HourFormat[]).map((h) => (
                <button key={h} className={`seg-btn ${s.hourFormat === h ? 'active' : ''}`} onClick={() => updateSettings({ hourFormat: h })}>
                  {h === '24' ? '14:30' : '2:30 PM'}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.decimalSep')}</span>
            <div className="seg-group">
              <button className={`seg-btn ${s.decimalSep === ',' ? 'active' : ''}`} onClick={() => updateSettings({ decimalSep: ',' })}>1 234,56</button>
              <button className={`seg-btn ${s.decimalSep === '.' ? 'active' : ''}`} onClick={() => updateSettings({ decimalSep: '.' })}>1,234.56</button>
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.firstDay')}</span>
            <div className="seg-group">
              <button className={`seg-btn ${s.firstDayOfWeek === 'monday' ? 'active' : ''}`} onClick={() => updateSettings({ firstDayOfWeek: 'monday' })}>{t('cal.mon')}</button>
              <button className={`seg-btn ${s.firstDayOfWeek === 'sunday' ? 'active' : ''}`} onClick={() => updateSettings({ firstDayOfWeek: 'sunday' })}>{t('cal.sun')}</button>
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.timezone')}</span>
            <select className="select" style={{ width: 220 }} value={s.timezone} onChange={(e) => updateSettings({ timezone: e.target.value })}>
              {TIMEZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('budget.threshold')}</span>
              <div className="sr-desc">{t('budget.warningAt')} {s.budgetWarningThreshold}%</div>
            </span>
            <input
              type="range"
              min={50}
              max={100}
              value={s.budgetWarningThreshold}
              style={{ width: 160 }}
              onChange={(e) => updateSettings({ budgetWarningThreshold: Number(e.target.value) })}
              aria-label={t('budget.threshold')}
            />
          </div>
          <div className="sr-label" style={{ margin: '10px 0' }}>{t('set.visibility')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 260, overflowY: 'auto' }}>
            {[
              ['clock', 'mod.clock'],
              ['weather', 'mod.weather'],
              ['calendar', 'mod.calendar'],
              ['tasks', 'mod.tasks'],
              ['notes', 'mod.notes'],
              ['habits', 'mod.habits'],
              ['journal', 'mod.journal'],
              ['goals', 'mod.goals'],
              ['pomodoro', 'mod.pomodoro'],
              ['finance', 'mod.finance'],
              ['budget', 'mod.budget'],
              ['savings', 'mod.savings'],
              ['investments', 'mod.investments'],
              ['loan', 'mod.loan'],
              ['premium', 'mod.premium'],
            ].map(([id, key]) => (
              <div key={id} className="settings-row" style={{ padding: '8px 0' }}>
                <span className="sr-label">{t(key)}</span>
                <Toggle on={!isHidden(id as never)} onChange={() => toggleWidget(id as never)} />
              </div>
            ))}
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.resetLayout')}</span>
              <div className="sr-desc">{t('nav.resetLayout')}</div>
            </span>
            <button className="btn" onClick={() => resetLayout()}>
              <RotateCcw size={14} /> {t('act.reset')}
            </button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.notifToggle')}</span>
            </span>
            <Toggle on={s.notifications} onChange={(v) => updateSettings({ notifications: v })} />
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.budgetAlerts')}</span>
              <div className="sr-desc">{t('set.budgetAlerts')}</div>
            </span>
            <Toggle on={s.budgetAlerts} onChange={(v) => updateSettings({ budgetAlerts: v })} />
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.coachMode')}</span>
              <div className="sr-desc">{t('set.coachMode')}</div>
            </span>
            <Toggle on={s.coachMode} onChange={(v) => updateSettings({ coachMode: v })} />
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.coachFreq')}</span>
            <div className="seg-group">
              {(['never', 'daily', 'weekly'] as CoachFreq[]).map((f) => (
                <button key={f} className={`seg-btn ${s.coachFreq === f ? 'active' : ''}`} onClick={() => updateSettings({ coachFreq: f })}>
                  {t(`set.coachFreq${f === 'never' ? 'Never' : f === 'daily' ? 'Daily' : 'Weekly'}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.coachTime')}</span>
            <input className="input" type="time" style={{ width: 130 }} value={s.coachTime} onChange={(e) => updateSettings({ coachTime: e.target.value })} />
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.weeklyDay')}</span>
            <select className="select" style={{ width: 160 }} value={s.weeklySummaryDay} onChange={(e) => updateSettings({ weeklySummaryDay: e.target.value })}>
              {WEEK_DAYS.map((d) => (
                <option key={d} value={d}>{t(`cal.${d.slice(0, 3)}`)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── DONNÉES ── */}
      {tab === 'data' && (
        <div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.backup')}</span>
              <div className="sr-desc">{t('set.backupDesc')}</div>
              <div className="sr-desc" style={{ marginTop: 4 }}>
                {t('set.lastBackup')} : <strong>{lastBackupLabel}</strong>
              </div>
            </span>
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={backupNow}>
                <Database size={14} /> {t('set.backupNow')}
              </button>
              <button className="btn" onClick={restoreBackup}>
                <Upload size={14} /> {t('set.backupRestore')}
              </button>
            </span>
          </div>
          <div className="settings-row">
            <span className="sr-label">{t('set.exportJson')}</span>
            <button className="btn" onClick={exportAll}>
              <Download size={14} /> {t('act.export')}
            </button>
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.exportCsv')}</span>
              <div className="sr-desc">{t('tx.export')}</div>
            </span>
            <button
              className="btn"
              onClick={() => {
                import('../../utils/helpers').then(({ downloadCSV }) => {
                  downloadCSV(
                    `lifeos-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
                    state.transactions.map((x) => ({ date: x.date, label: x.label, category: x.category, type: x.type, amount: x.amount, currency: s.currency })),
                  );
                  showToast(t('toast.exported'), 'success');
                });
              }}
            >
              <Download size={14} /> CSV
            </button>
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.importJson')}</span>
              <div className="sr-desc">JSON · {t('set.importJson')}</div>
            </span>
            <button className="btn" onClick={() => importRef.current?.click()}>
              <Upload size={14} /> {t('act.import')}
            </button>
            <input ref={importRef} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
          </div>
          <div className="settings-row" style={{ borderTop: '1px solid var(--border)', marginTop: 10 }}>
            <span>
              <span className="sr-label" style={{ color: 'var(--danger)' }}>{t('set.danger')}</span>
              <div className="sr-desc">{t('set.resetAll')}</div>
            </span>
            <button className="btn danger" onClick={() => { if (window.confirm(t('set.resetConfirm'))) resetAll(); }}>
              <RotateCcw size={14} /> {t('act.reset')}
            </button>
          </div>
        </div>
      )}

      {/* ── SÉCURITÉ ── */}
      {tab === 'security' && (
        <div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.lock')}</span>
              <div className="sr-desc">{t('set.pinInfo')}</div>
            </span>
            <Toggle on={s.lockEnabled} onChange={(v) => updateSettings({ lockEnabled: v })} />
          </div>
          {s.lockEnabled && (
            <div className="settings-row">
              <span>
                <span className="sr-label">{t('set.pin')}</span>
                <div className="sr-desc">🔒 {s.pin ? '••••' : '1234'}</div>
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  style={{ width: 90 }}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="0000"
                  value={pinDraft}
                  onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <button
                  className="btn primary sm"
                  disabled={!isValidPin(pinDraft)}
                  onClick={() => {
                    if (isValidPin(pinDraft)) {
                      updateSettings({ pin: pinDraft });
                      setPinDraft('');
                      showToast(t('toast.pinChanged'), 'success');
                    }
                  }}
                >
                  {s.pin ? t('set.changePin') : t('set.setPin')}
                </button>
              </span>
            </div>
          )}
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.hideAmounts')}</span>
              <div className="sr-desc">{t('set.hideAmountsDesc')}</div>
            </span>
            <Toggle on={s.hideAmounts} onChange={(v) => updateSettings({ hideAmounts: v })} />
          </div>
          <div className="settings-row">
            <span>
              <span className="sr-label">{t('set.journalProtected')}</span>
              <div className="sr-desc">🔒 {t('journal.protected')}</div>
            </span>
            <Toggle on={s.journalProtected} onChange={(v) => updateSettings({ journalProtected: v })} />
          </div>
          <div className="settings-row" style={{ borderTop: '1px solid var(--border)', marginTop: 10 }}>
            <span>
              <span className="sr-label">{t('set.logout')}</span>
              <div className="sr-desc">{t('set.logoutDesc')}</div>
            </span>
            <button
              className="btn danger"
              onClick={() => {
                if (window.confirm(t('set.logout') + ' ?')) {
                  try {
                    localStorage.removeItem('lifeos:last-backup');
                  } catch {
                    /* ignore */
                  }
                  window.location.reload();
                }
              }}
            >
              {t('set.logout')}
            </button>
          </div>
        </div>
      )}

      {/* ── RACCOURCIS ── */}
      {tab === 'shortcuts' && (
        <div>
          <div className="sr-label" style={{ marginBottom: 10 }}>{t('set.shortcutList')}</div>
          {SHORTCUTS.map((sc) => (
            <div key={sc.keys} className="settings-row" style={{ padding: '9px 0' }}>
              <span className="sr-label">{sc.label}</span>
              <kbd style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, background: 'var(--chip)', padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)' }}>
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      )}

      {/* ── PREMIUM ── */}
      {tab === 'premium' && (
        <div>
          <p style={{ color: 'var(--text-soft)', fontSize: 13.5, margin: '0 0 16px' }}>{t('prem.modalDesc')}</p>
          {[
            ['prem.f1', 'prem.f1d'],
            ['prem.f2', 'prem.f2d'],
            ['prem.f3', 'prem.f3d'],
            ['prem.f4', 'prem.f4d'],
            ['prem.f5', 'prem.f5d'],
            ['prem.f6', 'prem.f6d'],
            ['prem.f7', 'prem.f7d'],
            ['prem.f8', 'prem.f8d'],
            ['prem.f9', 'prem.f9d'],
            ['prem.f10', 'prem.f10d'],
            ['prem.f11', 'prem.f11d'],
            ['prem.f12', 'prem.f12d'],
          ].map(([k, d]) => (
            <div key={k} className="settings-row" style={{ padding: '9px 0' }}>
              <span>
                <span className="sr-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t(k)} <span className="premium-lock"><Crown size={12} /> {t('prem.badge')}</span>
                </span>
                <div className="sr-desc">{t(d)}</div>
              </span>
              <button className="btn sm" onClick={openPremium}>
                <Lock size={12} />
              </button>
            </div>
          ))}
          <button className="btn primary" style={{ marginTop: 14, width: '100%' }} onClick={openPremium}>
            <Crown size={14} /> {t('prem.cta')}
          </button>
        </div>
      )}
    </div>
  );
}

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useApp();
  return (
    <Modal open={open} onClose={onClose} title={t('set.title')} size="lg">
      <SettingsContent />
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// LifeOS – Modules "Vie personnelle" : Horloge, Météo,
// Calendrier interactif, Pomodoro
// ─────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  GripVertical,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sun,
  Thermometer,
  Trash2,
  Wind,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber, Modal, ProgressBar, WidgetHead, rippleHandler, useReveal } from '../ui';
import { addDays, formatClock, parseISODate, todayISO, toISODate, pad } from '../../utils/helpers';
import { EVENT_COLORS } from '../../data/modules';
import type { CalendarEvent, WidgetId } from '../../types';

/* ══════════════ HORLOGE ══════════════ */
export function ClockWidget({ id }: { id: WidgetId }) {
  const { t, state } = useApp();
  const [now, setNow] = useState(new Date());
  const tz = state.settings.timezone;
  const locale = state.settings.lang === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    const iv = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  // Numéro de semaine ISO
  const weekNumber = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }, [now]);

  let dateLabel = '';
  try {
    dateLabel = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
  } catch {
    dateLabel = now.toLocaleDateString(locale);
  }

  const progress = ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;

  return (
    <div className="widget-card">
      <WidgetHead icon={<ClockIcon />} title={t('mod.clock')} sub={t('clock.localTime')} />
      <div className="widget-body" style={{ alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div className="pomo-time" style={{ fontSize: 46, letterSpacing: '-0.02em' }}>
          {formatClock(now, tz, locale)}
        </div>
        <div style={{ color: 'var(--text-soft)', fontSize: 13, textAlign: 'center', textTransform: 'capitalize' }}>
          {dateLabel}
        </div>
        <div style={{ width: '100%', maxWidth: 240, marginTop: 10 }}>
          <ProgressBar value={progress} height={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: 'var(--text-muted)' }}>
            <span>00:00</span>
            <span>
              {t('clock.week')} {weekNumber}
            </span>
            <span>24:00</span>
          </div>
        </div>
        <div className="badge neutral" style={{ marginTop: 8 }}>
          {tz.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/* ══════════════ MÉTÉO (Open-Meteo, fallback démo) ══════════════ */
interface WeatherData {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  code: number;
  daily: { date: string; code: number; min: number; max: number }[];
  city: string;
}

function weatherCodeIcon(code: number, size = 22) {
  if (code === 0) return <Sun size={size} />;
  if (code <= 2) return <CloudSun size={size} />;
  if (code === 3) return <Cloud size={size} />;
  if (code <= 48) return <CloudFog size={size} />;
  if (code <= 57) return <Droplets size={size} />;
  if (code <= 67) return <CloudRain size={size} />;
  if (code <= 77) return <CloudSnow size={size} />;
  if (code <= 82) return <CloudRain size={size} />;
  if (code <= 86) return <CloudSnow size={size} />;
  return <CloudLightning size={size} />;
}

const CASABLANCA = { lat: 33.5731, lon: -7.5898, city: 'Casablanca' };

function useWeather(lang: 'fr' | 'en') {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async (lat: number, lon: number, city: string) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('weather api error');
        const j = await res.json();
        if (cancelled) return;
        const daily = j.daily.time.map((date: string, i: number) => ({
          date,
          code: j.daily.weather_code[i],
          min: j.daily.temperature_2m_min[i],
          max: j.daily.temperature_2m_max[i],
        }));
        setData({
          temp: j.current.temperature_2m,
          feels: j.current.apparent_temperature,
          humidity: j.current.relative_humidity_2m,
          wind: j.current.wind_speed_10m,
          code: j.current.weather_code,
          daily,
          city,
        });
      } catch {
        if (cancelled) return;
        // Fallback démo si l'API est inaccessible
        setData({
          temp: 24,
          feels: 25,
          humidity: 64,
          wind: 12,
          code: 2,
          daily: [0, 1, 2].map((i) => ({
            date: addDays(todayISO(), i + 1),
            code: i === 1 ? 3 : 2,
            min: 18 + i,
            max: 25 + i,
          })),
          city,
        });
        setError(true);
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, '📍'),
        () => fetchWeather(CASABLANCA.lat, CASABLANCA.lon, CASABLANCA.city),
        { timeout: 6000 },
      );
    } else {
      fetchWeather(CASABLANCA.lat, CASABLANCA.lon, CASABLANCA.city);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function WeatherWidget({ id }: { id: WidgetId }) {
  const { t, lang } = useApp();
  const { data, loading, error } = useWeather(lang);

  return (
    <div className="widget-card">
      <WidgetHead icon={<CloudSun size={17} />} title={t('mod.weather')} sub={data?.city ?? ''} />
      <div className="widget-body">
        {loading || !data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 44, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
            <div className="skeleton" style={{ height: 14, width: '55%' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: 'var(--accent)' }}>{weatherCodeIcon(data.code, 44)}</span>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  <AnimatedNumber value={data.temp} format={(n) => `${Math.round(n)}°C`} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('weather.feels')} {Math.round(data.feels)}°C
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 12, color: 'var(--text-soft)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Droplets size={13} /> {Math.round(data.humidity)}%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Wind size={13} /> {Math.round(data.wind)} km/h
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
              {data.daily.slice(0, 3).map((d) => (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '8px 4px',
                    background: 'var(--card)',
                  }}
                >
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {parseISODate(d.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' })}
                  </div>
                  <div style={{ color: 'var(--accent)', margin: '4px 0', display: 'grid', placeItems: 'center' }}>
                    {weatherCodeIcon(d.code, 17)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>
                    {Math.round(d.min)}° / {Math.round(d.max)}°
                  </div>
                </div>
              ))}
            </div>
            {error && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6 }}>{t('weather.error')}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════ CALENDRIER ══════════════ */
type CalView = 'month' | 'week' | 'day';

export function CalendarWidget({ id }: { id: WidgetId }) {
  const { t, state, addEvent, deleteEvent, lang } = useApp();
  const [view, setView] = useState<CalView>('month');
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayISO());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: todayISO(), time: '', note: '', color: EVENT_COLORS[0] });
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  const monthEvents = (iso: string) => state.events.filter((e) => e.date === iso).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));

  const days = useMemo(() => {
    if (view === 'month') {
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const start = new Date(first);
      start.setDate(1 - ((first.getDay() + 6) % 7)); // lundi
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    // semaine
    const today = parseISODate(selected);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [view, cursor, selected]);

  const move = (dir: number) => {
    if (view === 'month') setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    else if (view === 'week') setSelected(addDays(selected, dir * 7));
    else setSelected(addDays(selected, dir));
  };

  const goToday = () => {
    setCursor(new Date());
    setSelected(todayISO());
  };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    addEvent({ title: form.title.trim(), date: form.date, time: form.time || undefined, note: form.note || undefined, color: form.color });
    setForm({ title: '', date: todayISO(), time: '', note: '', color: EVENT_COLORS[0] });
    setModalOpen(false);
  };

  const dow = [t('cal.mon'), t('cal.tue'), t('cal.wed'), t('cal.thu'), t('cal.fri'), t('cal.sat'), t('cal.sun')];

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<CalendarDays size={17} />}
        title={t('mod.calendar')}
        sub={`${monthEvents(selected).length} ${t('cal.events')}`}
        actions={
          <>
            <div className="seg-group" style={{ marginRight: 2 }}>
              {(['month', 'week', 'day'] as CalView[]).map((v) => (
                <button key={v} className={`seg-btn ${view === v ? 'active' : ''}`} onClick={(e) => { rippleHandler(e); setView(v); }}>
                  {t(`cal.${v}`)}
                </button>
              ))}
            </div>
            <button className="icon-btn" onClick={(e) => { rippleHandler(e); setModalOpen(true); }} aria-label={t('cal.addEvent')}>
              <Plus size={16} />
            </button>
          </>
        }
      />
      <div className="widget-body">
        <div className="cal-header">
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={(e) => { rippleHandler(e); move(-1); }} aria-label="Précédent">
            <ChevronLeft size={15} />
          </button>
          <div className="cal-month-label">
            {view === 'month' && cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            {view === 'week' && (() => {
              const s = parseISODate(toISODate(days[0]));
              const e = parseISODate(toISODate(days[6]));
              const sameMonth = s.getMonth() === e.getMonth();
              return sameMonth
                ? s.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
                : `${s.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
            })()}
            {view === 'day' && parseISODate(selected).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={(e) => { rippleHandler(e); move(1); }} aria-label="Suivant">
            <ChevronRight size={15} />
          </button>
          <button className="btn sm ghost" onClick={(e) => { rippleHandler(e); goToday(); }}>{t('cal.today')}</button>
        </div>

        {view === 'month' && (
          <div className="cal-grid">
            {dow.map((d) => (
              <div key={d} className="cal-dow">{d}</div>
            ))}
            {days.map((d) => {
              const iso = toISODate(d);
              const isOther = d.getMonth() !== cursor.getMonth();
              const isToday = iso === todayISO();
              const isSel = iso === selected;
              const hasEvents = state.events.some((e) => e.date === iso);
              return (
                <div
                  key={iso}
                  className={`cal-cell ${isOther ? 'other' : ''} ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
                  onClick={() => setSelected(iso)}
                >
                  {d.getDate()}
                  {hasEvents && <span className="cal-dot" />}
                </div>
              );
            })}
          </div>
        )}

        {(view === 'week' || view === 'day') && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {days.map((d) => {
              const iso = toISODate(d);
              const isSel = iso === selected;
              const isToday = iso === todayISO();
              return (
                <button
                  key={iso}
                  className="cal-cell"
                  style={{ aspectRatio: 'auto', padding: '8px 4px', flex: 1, border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)' }}
                  onClick={() => setSelected(iso)}
                >
                  <span style={{ fontSize: 9.5, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)}
                  </span>
                  <strong style={{ fontSize: 13 }} className={isToday ? 'today-text' : ''}>{d.getDate()}</strong>
                  {state.events.some((e) => e.date === iso) && <span className="cal-dot" style={{ background: isSel ? '#fff' : 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        )}

        <div className="cal-events-list">
          {monthEvents(selected).length === 0 && <div className="empty-state" style={{ padding: 14 }}><CalendarDays size={20} /><span>{t('cal.noEvents')}</span></div>}
          {monthEvents(selected).map((e) => (
            <div key={e.id} className="cal-event" style={{ borderLeftColor: e.color }}>
              <span className="ce-time">{e.time ?? '·'}</span>
              <span style={{ fontWeight: 600 }}>{e.title}</span>
              {e.note && <span style={{ color: 'var(--text-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.note}</span>}
              <button className="icon-btn ce-del" style={{ width: 24, height: 24 }} onClick={() => deleteEvent(e.id)} aria-label={t('act.delete')}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('cal.addEvent')}
        footer={
          <>
            <button className="btn ghost" onClick={() => setModalOpen(false)}>{t('act.cancel')}</button>
            <button className="btn primary" onClick={saveEvent}>{t('act.save')}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>{t('cal.title')}</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('cal.date')}</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>{t('cal.time')}</label>
              <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>{t('cal.note')}</label>
            <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('cal.color')}</label>
            <div className="swatch-row">
              {EVENT_COLORS.map((c) => (
                <button key={c} className={`swatch ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════ POMODORO ══════════════ */
const POMO_MODES = [
  { key: 'focus', minutes: 25, labelKey: 'pomo.focus' },
  { key: 'short', minutes: 5, labelKey: 'pomo.short' },
  { key: 'long', minutes: 15, labelKey: 'pomo.long' },
] as const;

type PomoMode = (typeof POMO_MODES)[number]['key'];

export function PomodoroWidget({ id }: { id: WidgetId }) {
  const { t } = useApp();
  const [mode, setMode] = useState<PomoMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const beepRef = useRef<AudioContext | null>(null);

  const total = POMO_MODES.find((m) => m.key === mode)!.minutes * 60;

  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = beepRef.current ?? new Ctx();
      beepRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } catch {
      /* audio indisponible */
    }
  }, []);

  const switchMode = (m: PomoMode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(POMO_MODES.find((x) => x.key === m)!.minutes * 60);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          beep();
          if (mode === 'focus') setSessions((n) => n + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, mode, beep]);

  // Raccourci clavier global 'p'
  useEffect(() => {
    const handler = () => setRunning((r) => !r);
    window.addEventListener('lifeos:pomo-toggle', handler);
    return () => window.removeEventListener('lifeos:pomo-toggle', handler);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = total > 0 ? secondsLeft / total : 0;
  const R = 64;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="widget-card">
      <WidgetHead
        icon={<TimerIcon />}
        title={t('mod.pomodoro')}
        sub={t('pomo.tip')}
        actions={
          <button className="icon-btn" onClick={(e) => { rippleHandler(e); switchMode('focus'); setSecondsLeft(25 * 60); }} aria-label={t('pomo.reset')}>
            <RotateCcw size={15} />
          </button>
        }
      />
      <div className="widget-body" style={{ alignItems: 'center' }}>
        <div className="pomo-mode-tabs" style={{ width: '100%', maxWidth: 280 }}>
          {POMO_MODES.map((m) => (
            <button key={m.key} className={`pomo-tab ${mode === m.key ? 'active' : ''}`} onClick={() => switchMode(m.key)}>
              {t(m.labelKey)}
            </button>
          ))}
        </div>
        <div className="pomo-ring-wrap">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--chip)" strokeWidth="10" />
            <circle
              className="pomo-ring"
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
            />
          </svg>
          <div className="pomo-time">
            {pad(mins)}:{pad(secs)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${running ? '' : 'primary'}`} onClick={(e) => { rippleHandler(e); setRunning(!running); }}>
            {running ? <Pause size={15} /> : <Play size={15} />}
            {running ? t('pomo.pause') : secondsLeft === total ? t('pomo.start') : t('pomo.resume')}
          </button>
          <button className="btn" onClick={(e) => { rippleHandler(e); setRunning(false); setSecondsLeft(total); }}>
            <RotateCcw size={14} /> {t('pomo.reset')}
          </button>
        </div>
        <div className="badge accent" style={{ marginTop: 12 }}>
          <Bell size={11} /> {sessions} {t('pomo.sessions')}
        </div>
      </div>
    </div>
  );
}

function TimerIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V9" />
      <path d="M9 2h6" />
      <path d="M12 5V2" />
    </svg>
  );
}

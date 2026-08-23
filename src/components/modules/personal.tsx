import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Cloud, CloudRain, CloudSun, Droplets, Pencil, Pause, Play, Plus, RotateCcw, SkipForward, Sun, TimerReset, Trash2, Wind } from 'lucide-react'
import { Button, IconButton, Widget } from '../ui'
import { usePersonalStore, useSettingsStore, useUIStore } from '../../store'
import { useDateFormatter, useTimeFormatter } from '../../utils/formatting'

function AnalogClock({ date }: { date: Date }) {
  const seconds = date.getSeconds() * 6
  const minutes = date.getMinutes() * 6 + seconds / 60
  const hours = (date.getHours() % 12) * 30 + minutes / 12
  return <svg className="analog-clock" viewBox="0 0 100 100" aria-label="Horloge analogique">
    <circle cx="50" cy="50" r="47" className="clock-face" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1="50" y1="7" x2="50" y2="12" transform={`rotate(${i * 30} 50 50)`} className="clock-tick" />)}
    <line x1="50" y1="50" x2="50" y2="28" transform={`rotate(${hours} 50 50)`} className="clock-hour" />
    <line x1="50" y1="50" x2="50" y2="19" transform={`rotate(${minutes} 50 50)`} className="clock-minute" />
    <line x1="50" y1="55" x2="50" y2="16" transform={`rotate(${seconds} 50 50)`} className="clock-second" />
    <circle cx="50" cy="50" r="3" className="clock-center" />
  </svg>
}

export function ClockModule() {
  const [now, setNow] = useState(new Date())
  const [mode, setMode] = useState<'digital' | 'analog'>('digital')
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const timezone = useSettingsStore((s) => s.timezone)
  const language = useSettingsStore((s) => s.language)
  const date = useDateFormatter()
  useEffect(() => { const interval = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(interval) }, [])
  const time = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: timeFormat === '12h', timeZone: timezone }).format(now)
  return <Widget id="clock" title="Maintenant" icon={<TimerReset size={18} />}>
    <div className="segmented compact"><button className={mode === 'digital' ? 'active' : ''} onClick={() => setMode('digital')}>Digital</button><button className={mode === 'analog' ? 'active' : ''} onClick={() => setMode('analog')}>Analogique</button></div>
    {mode === 'digital' ? <div className="clock-digital"><strong>{time}</strong><span>{date(now, { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone })}</span><small>{timezone.replace('_', ' ')}</small></div> : <div className="clock-analog-wrap"><AnalogClock date={now} /><span>{time}</span></div>}
  </Widget>
}

type WeatherData = { temperature: number; apparent: number; humidity: number; wind: number; code: number; forecast: { day: string; max: number; min: number; code: number }[] }
const cities: Record<string, { lat: number; lon: number }> = { Casablanca: { lat: 33.57, lon: -7.59 }, Paris: { lat: 48.85, lon: 2.35 }, Londres: { lat: 51.51, lon: -0.13 }, Dubai: { lat: 25.2, lon: 55.27 }, Tokyo: { lat: 35.68, lon: 139.69 } }
const fallbackWeather: WeatherData = { temperature: 24, apparent: 25, humidity: 68, wind: 14, code: 1, forecast: [{ day: 'Lun', max: 25, min: 19, code: 1 }, { day: 'Mar', max: 24, min: 18, code: 2 }, { day: 'Mer', max: 23, min: 18, code: 61 }] }
function WeatherGlyph({ code, size = 30 }: { code: number; size?: number }) { if (code === 0) return <Sun size={size} />; if (code >= 51) return <CloudRain size={size} />; if (code <= 2) return <CloudSun size={size} />; return <Cloud size={size} /> }

export function WeatherModule() {
  const [city, setCity] = useState('Casablanca')
  const [weather, setWeather] = useState<WeatherData>(fallbackWeather)
  const [loading, setLoading] = useState(false)
  const date = useDateFormatter()
  useEffect(() => {
    const controller = new AbortController(); const pos = cities[city]; setLoading(true)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`, { signal: controller.signal })
      .then((r) => r.json()).then((data) => setWeather({ temperature: Math.round(data.current.temperature_2m), apparent: Math.round(data.current.apparent_temperature), humidity: data.current.relative_humidity_2m, wind: Math.round(data.current.wind_speed_10m), code: data.current.weather_code, forecast: data.daily.time.slice(1, 4).map((day: string, i: number) => ({ day: date(new Date(day + 'T12:00:00'), { weekday: 'short' }), max: Math.round(data.daily.temperature_2m_max[i + 1]), min: Math.round(data.daily.temperature_2m_min[i + 1]), code: data.daily.weather_code[i + 1] })) }))
      .catch(() => undefined).finally(() => setLoading(false))
    return () => controller.abort()
  }, [city, date])
  return <Widget id="weather" title="Météo" icon={<CloudSun size={18} />} action={<select className="tiny-select" value={city} onChange={(e) => setCity(e.target.value)}>{Object.keys(cities).map((value) => <option key={value}>{value}</option>)}</select>}>
    <div className={`weather-main ${loading ? 'loading-soft' : ''}`}><div className="weather-glyph"><WeatherGlyph code={weather.code} size={42} /></div><div><strong>{weather.temperature}°</strong><span>Ressenti {weather.apparent}°</span></div></div>
    <div className="weather-meta"><span><Droplets size={14} />{weather.humidity}%</span><span><Wind size={14} />{weather.wind} km/h</span></div>
    <div className="weather-forecast">{weather.forecast.map((day) => <div key={day.day}><small>{day.day}</small><WeatherGlyph code={day.code} size={17} /><b>{day.max}°</b><span>{day.min}°</span></div>)}</div>
  </Widget>
}

const phases = { focus: { label: 'Focus', seconds: 25 * 60 }, short: { label: 'Pause', seconds: 5 * 60 }, long: { label: 'Longue', seconds: 15 * 60 } }
type Phase = keyof typeof phases
export function PomodoroModule() {
  const [phase, setPhase] = useState<Phase>('focus')
  const [left, setLeft] = useState(phases.focus.seconds)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(2)
  const audio = useRef<AudioContext | null>(null)
  const switchPhase = (next: Phase) => { setPhase(next); setLeft(phases[next].seconds); setRunning(false) }
  const beep = () => { try { audio.current = audio.current ?? new AudioContext(); const oscillator = audio.current.createOscillator(); const gain = audio.current.createGain(); oscillator.connect(gain); gain.connect(audio.current.destination); oscillator.frequency.value = 660; gain.gain.value = .08; oscillator.start(); oscillator.stop(audio.current.currentTime + .25) } catch { /* no audio permission */ } }
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setLeft((value) => { if (value <= 1) { clearInterval(timer); setRunning(false); beep(); if (phase === 'focus') setSessions((n) => n + 1); return 0 } return value - 1 }), 1000); return () => clearInterval(timer) }, [running, phase])
  const total = phases[phase].seconds; const progress = 1 - left / total; const circumference = 2 * Math.PI * 54
  return <Widget id="pomodoro" title="Pomodoro" icon={<TimerReset size={18} />}>
    <div className="pomo-tabs">{(Object.keys(phases) as Phase[]).map((key) => <button key={key} className={phase === key ? 'active' : ''} onClick={() => switchPhase(key)}>{phases[key].label}</button>)}</div>
    <div className="pomo-ring"><svg viewBox="0 0 124 124"><circle cx="62" cy="62" r="54" className="ring-bg" /><circle cx="62" cy="62" r="54" className="ring-progress" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }} /></svg><div><strong>{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</strong><span>{sessions} sessions aujourd’hui</span></div></div>
    <div className="pomo-controls"><IconButton label="Réinitialiser" onClick={() => { setLeft(total); setRunning(false) }}><RotateCcw size={17} /></IconButton><button className="pomo-play" onClick={() => setRunning(!running)} aria-label={running ? 'Pause' : 'Démarrer'}>{running ? <Pause /> : <Play fill="currentColor" />}</button><IconButton label="Phase suivante" onClick={() => switchPhase(phase === 'focus' ? 'short' : 'focus')}><SkipForward size={18} /></IconButton></div>
  </Widget>
}

export function CalendarModule() {
  const formatAgendaDate = useDateFormatter(), formatEventTime = useTimeFormatter()
  const [month, setMonth] = useState(new Date()), [view, setView] = useState<'month'|'week'|'day'>('month')
  const events = usePersonalStore((s) => s.events), removeEvent=usePersonalStore((s)=>s.removeEvent), updateEvent=usePersonalStore((s)=>s.updateEvent)
  const setModal = useUIStore((s) => s.setModal)
  const year = month.getFullYear(), index = month.getMonth(), first = new Date(year, index, 1), offset = (first.getDay() + 6) % 7, days = new Date(year, index + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, i) => i - offset + 1), today = new Date(), keyFor = (day: number) => `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const todayKey=today.toISOString().slice(0,10), weekStart=new Date(today);weekStart.setDate(today.getDate()-((today.getDay()+6)%7));
  const week=Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return d})
  const edit=(id:string,current:string)=>{const title=prompt('Modifier le titre de l’événement',current)?.trim();if(title)updateEvent(id,{title})}
  const EventList=({dates}:{dates:string[]})=><div className={`calendar-agenda ${view}`}>{dates.map(date=>{const dayEvents=events.filter(e=>e.date===date);return <div key={date} className="agenda-day"><header><b>{formatAgendaDate(date,{weekday:'short',day:'numeric',month:view==='day'?'long':'short'})}</b><span>{dayEvents.length} événement{dayEvents.length!==1?'s':''}</span></header>{dayEvents.length?dayEvents.map(event=><div className="agenda-event" key={event.id} style={{borderLeftColor:event.color}}><button onClick={()=>edit(event.id,event.title)}><b>{event.title}</b><small>{formatEventTime(event.time)}</small></button><IconButton label="Modifier" onClick={()=>edit(event.id,event.title)}><Pencil size={12}/></IconButton><IconButton label="Supprimer" onClick={()=>removeEvent(event.id)}><Trash2 size={12}/></IconButton></div>):<small className="agenda-empty">Libre</small>}</div>})}</div>
  return <Widget id="calendar" title="Calendrier" icon={<CalendarDays size={18} />} action={<div className="header-actions"><IconButton label="Mois précédent" onClick={() => setMonth(new Date(year, index - 1, 1))}><ChevronLeft size={16} /></IconButton><IconButton label="Mois suivant" onClick={() => setMonth(new Date(year, index + 1, 1))}><ChevronRight size={16} /></IconButton><IconButton label="Ajouter un événement" onClick={() => setModal('event')}><Plus size={16} /></IconButton></div>}>
    <div className="calendar-title"><strong>{formatAgendaDate(month, { month: 'long', year: 'numeric' })}</strong><div className="mini-tabs">{(['month','week','day'] as const).map(mode=><button key={mode} className={view===mode?'active':''} onClick={()=>setView(mode)}>{mode==='month'?'Mois':mode==='week'?'Semaine':'Jour'}</button>)}</div><button onClick={() => setMonth(new Date())}>Aujourd’hui</button></div>
    {view==='month'&&<><div className="calendar-grid"><div className="weekdays">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}</div><div className="month-days">{cells.map((day, i) => { const current = day > 0 && day <= days; const dateKey = current ? keyFor(day) : ''; const dayEvents = events.filter((e) => e.date === dateKey); const isToday = current && day === today.getDate() && index === today.getMonth() && year === today.getFullYear(); return <button key={i} className={`${!current ? 'muted' : ''} ${isToday ? 'today' : ''}`} disabled={!current} title={dayEvents.map((e) => e.title).join(', ')}><span>{current ? day : ''}</span>{dayEvents.length > 0 && <i style={{ background: dayEvents[0].color }} />}</button> })}</div></div><div className="event-strip">{events.filter((e) => new Date(e.date + 'T12:00:00') >= new Date(new Date().toDateString())).slice(0, 2).map((event) => <div key={event.id}><i style={{ background: event.color }} /><button onClick={()=>edit(event.id,event.title)}><b>{event.title}</b><small>{formatAgendaDate(event.date, { weekday: 'short', day: 'numeric' })} · {formatEventTime(event.time)}</small></button><IconButton label="Supprimer" onClick={()=>removeEvent(event.id)}><Trash2 size={11}/></IconButton></div>)}</div></>}
    {view==='week'&&<EventList dates={week.map(d=>d.toISOString().slice(0,10))}/>} {view==='day'&&<EventList dates={[todayKey]}/>} 
  </Widget>
}

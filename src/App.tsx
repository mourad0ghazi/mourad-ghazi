import { useEffect, useState } from 'react'
import { CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Chatbot } from './components/assistant/Chatbot'
import { GlobalActions } from './components/layout/GlobalActions'
import { Header } from './components/layout/Header'
import { MobileNav } from './components/layout/MobileNav'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './components/pages/DashboardPage'
import { FinancePage } from './components/pages/FinancePage'
import { FinanceSettingsPage } from './components/pages/FinanceSettingsPage'
import { PersonalPage } from './components/pages/PersonalPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { ToolsPage } from './components/pages/ToolsPage'
import { useSettingsStore, useUIStore } from './store'
import type { View } from './types'
import { Button, Input } from './components/ui'

const pages:Record<View,React.ComponentType>={dashboard:DashboardPage,finances:FinancePage,'finance-settings':FinanceSettingsPage,personal:PersonalPage,tools:ToolsPage,settings:SettingsPage}
const valid:View[]=['dashboard','finances','finance-settings','personal','tools','settings']
export default function App(){
  const view=useUIStore(s=>s.view),toast=useUIStore(s=>s.toast),clearToast=useUIStore(s=>s.clearToast),settings=useSettingsStore(),Page=pages[view]
  useEffect(()=>{const apply=()=>{document.documentElement.lang=settings.language;const dark=settings.theme==='dark'||(settings.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.dataset.accent=settings.accent;document.documentElement.dataset.density=settings.density;document.documentElement.classList.toggle('reduce-motion',!settings.animations);document.documentElement.classList.toggle('hide-amounts',settings.hideAmounts);document.documentElement.classList.toggle('parallax-enabled',settings.parallax)};apply();const media=matchMedia('(prefers-color-scheme: dark)');media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply)},[settings.theme,settings.accent,settings.density,settings.animations,settings.hideAmounts,settings.parallax,settings.language])
  useEffect(()=>{const move=(e:PointerEvent)=>{if(!settings.parallax)return;document.documentElement.style.setProperty('--pointer-x',`${(e.clientX/innerWidth-.5)*16}px`);document.documentElement.style.setProperty('--pointer-y',`${(e.clientY/innerHeight-.5)*12}px`)};addEventListener('pointermove',move,{passive:true});return()=>removeEventListener('pointermove',move)},[settings.parallax])
  useEffect(()=>{const hash=()=>{const raw=location.hash.replace('#/','');const next=valid.includes(raw as View)?raw as View:'dashboard';if(next!==useUIStore.getState().view)useUIStore.setState({view:next})};addEventListener('hashchange',hash);return()=>removeEventListener('hashchange',hash)},[])
  return <div className="app-shell">{settings.smoke&&<div className="smoke-bg" aria-hidden="true"><i/><i/><i/></div>}<Sidebar/><div className="app-area"><Header/><main id="main-content"><AnimatePresence mode="wait"><motion.div key={view} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:settings.animations ? .18 : 0}}><Page/></motion.div></AnimatePresence></main></div><MobileNav/><Chatbot/><GlobalActions/><AnimatePresence>{toast&&<motion.button className="toast" initial={{opacity:0,y:20,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,x:20}} onClick={clearToast}><CheckCircle2 size={18}/>{toast}</motion.button>}</AnimatePresence><LockScreen/></div>
}
function LockScreen(){const locked=useUIStore(s=>s.locked),setLocked=useUIStore(s=>s.setLocked),pin=useSettingsStore(s=>s.pin),name=useSettingsStore(s=>s.profile.name),[value,setValue]=useState(''),[error,setError]=useState(false);if(!locked)return null;const unlock=()=>{if(value===pin){setLocked(false);setValue('');setError(false)}else{setError(true);setValue('')}};return <motion.div className="lock-screen" initial={{opacity:0}} animate={{opacity:1}}><div className="lock-card"><span className="lock-logo"><Sparkles/></span><span className="eyebrow">LIFEOS VERROUILLÉ</span><h1>Bonjour {name.split(' ')[0]}</h1><p>Saisissez votre PIN local pour reprendre.</p><LockKeyhole size={24}/><Input autoFocus className={error?'error':''} type="password" inputMode="numeric" maxLength={4} value={value} onChange={e=>{setValue(e.target.value);setError(false)}} onKeyDown={e=>e.key==='Enter'&&unlock()} placeholder="••••" aria-label="Code PIN"/>{error&&<small className="error-text">PIN incorrect. Réessayez.</small>}<Button onClick={unlock} disabled={value.length!==4}>Déverrouiller</Button><small>Vos données restent uniquement sur cet appareil.</small></div></motion.div>}

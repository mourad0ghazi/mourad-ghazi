import { useState } from 'react'
import { CalendarDays, CheckSquare2, FileBarChart, Flame, Heart, NotebookPen, Plus, Sparkles, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePersonalStore, useUIStore } from '../../store'
import { collectLifeOSReportSnapshot, downloadLifeOSReportPdf, generateLifeOSReport } from '../../utils/reports'
import { Button, Tabs } from '../ui'
import { CalendarModule } from '../modules/personal'
import { GoalsModule, HabitsModule, JournalModule, NotesModule, TasksModule } from '../modules/planner'

const tabs = [
  { id: 'calendar', label: 'Calendrier', icon: <CalendarDays size={15}/> }, { id: 'tasks', label: 'Tâches', icon: <CheckSquare2 size={15}/> },
  { id: 'notes', label: 'Notes', icon: <NotebookPen size={15}/> }, { id: 'habits', label: 'Habitudes', icon: <Flame size={15}/> },
  { id: 'journal', label: 'Journal', icon: <Sparkles size={15}/> }, { id: 'goals', label: 'Objectifs', icon: <Target size={15}/> },
]
export function PersonalPage() {
  const [tab, setTab] = useState(() => { const requested=sessionStorage.getItem('lifeos:personal-tab');sessionStorage.removeItem('lifeos:personal-tab');return tabs.some((item)=>item.id===requested)?requested!:'calendar' }), setModal = useUIStore((s) => s.setModal), showToast = useUIStore((s) => s.showToast)
  const tasks = usePersonalStore((s) => s.tasks), habits = usePersonalStore((s) => s.habits), events = usePersonalStore((s) => s.events)
  const today = new Date().toISOString().slice(0,10)
  const quickAction = () => { if (tab === 'tasks') setModal('task'); else if (tab === 'calendar') setModal('event'); else if (tab === 'notes') usePersonalStore.getState().addNote(); else if(tab==='habits'){const name=prompt('Nom de la nouvelle habitude')?.trim();if(name)usePersonalStore.getState().addHabit(name)}else if(tab==='goals'){const title=prompt('Quel est votre nouvel objectif ?')?.trim();if(title)usePersonalStore.getState().addGoal({title,category:'Personnel',progress:0,deadline:new Date(Date.now()+90*86400000).toISOString().slice(0,10),milestones:[]})}else if(tab==='journal')document.querySelector<HTMLTextAreaElement>('.journal-editor')?.focus() }
  const downloadReport = () => { const to=new Date().toISOString().slice(0,10), from=`${to.slice(0,4)}-01-01`;downloadLifeOSReportPdf(generateLifeOSReport(collectLifeOSReportSnapshot(),{scope:'personal',from,to,includeDetails:true}));showToast('Rapport personnel téléchargé') }
  return <motion.div className="page section-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="page-heading"><div><span className="eyebrow"><Heart size={14}/> VIE PERSONNELLE</span><h1>Chaque jour compte.</h1><p>Organisez le présent, cultivez vos habitudes et avancez vers ce qui vous ressemble.</p></div><div className="page-actions"><Button variant="secondary" onClick={downloadReport}><FileBarChart size={16}/>Rapport PDF</Button><Button onClick={quickAction}><Plus size={16}/>Ajouter</Button></div></div>
    <div className="summary-strip personal"><div><span>Tâches actives</span><strong>{tasks.filter((t)=>t.status!=='done').length}</strong><small>{tasks.filter((t)=>t.dueDate===today).length} prévues aujourd’hui</small></div><div><span>Habitudes aujourd’hui</span><strong>{habits.filter((h)=>h.done[today]).length}/{habits.length}</strong><small>Continuez votre série</small></div><div><span>Meilleure série</span><strong>{Math.max(0,...habits.map((h)=>h.streak))} jours</strong><small>Lecture quotidienne</small></div><div><span>Prochain événement</span><strong>{events.filter((e)=>e.date>=today)[0]?.time ?? '—'}</strong><small>{events.filter((e)=>e.date>=today)[0]?.title ?? 'Agenda libre'}</small></div></div>
    <Tabs tabs={tabs} value={tab} onChange={setTab}/>
    <div className="tab-content personal-content">
      {tab === 'calendar' && <CalendarModule/>}
      {tab === 'tasks' && <TasksModule extended/>}
      {tab === 'notes' && <NotesModule extended/>}
      {tab === 'habits' && <HabitsModule extended/>}
      {tab === 'journal' && <JournalModule extended/>}
      {tab === 'goals' && <GoalsModule extended/>}
    </div>
  </motion.div>
}

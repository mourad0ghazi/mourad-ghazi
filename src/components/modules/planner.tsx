import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, ChevronRight, Columns3, Download, Flame, ListChecks, NotebookPen, Plus, Sparkles, Target, Trash2 } from 'lucide-react'
import { Badge, Button, CheckButton, IconButton, Input, Progress, Widget } from '../ui'
import { usePersonalStore, useSettingsStore, useUIStore } from '../../store'
import { daysUntil, downloadFile } from '../../utils/helpers'
import { useDateFormatter } from '../../utils/formatting'

const priorityTone = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const
const priorityLabel = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' }
const nextStatus = { todo: 'doing', doing: 'done', done: 'todo' } as const

export function TasksModule({ extended = false }: { extended?: boolean }) {
  const tasks = usePersonalStore((s) => s.tasks), setTaskStatus = usePersonalStore((s) => s.setTaskStatus), removeTask = usePersonalStore((s) => s.removeTask), updateTask=usePersonalStore((s)=>s.updateTask), reorder=usePersonalStore(s=>s.reorderTasks)
  const setModal = useUIStore((s) => s.setModal), showToast=useUIStore(s=>s.showToast), date=useDateFormatter()
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active'), [mode,setMode]=useState<'list'|'board'>('list')
  const visible = tasks.filter((task) => filter === 'all' || (filter === 'active' ? task.status !== 'done' : task.status === 'done'))
  const edit=(id:string,current:string)=>{const title=prompt('Modifier la tâche',current)?.trim();if(title){updateTask(id,{title});showToast('Tâche mise à jour')}}
  const csv=()=>downloadFile('lifeos-taches.csv','\uFEFF'+[['Titre','Statut','Priorité','Échéance','Catégorie'],...tasks.map(t=>[t.title,t.status,t.priority,t.dueDate,t.category])].map(r=>r.map(c=>`"${c}"`).join(';')).join('\n'),'text/csv;charset=utf-8')
  const row=(task:typeof tasks[number])=><div className="task-row" key={task.id}><CheckButton checked={task.status === 'done'} label={`Changer le statut de ${task.title}`} onClick={() => setTaskStatus(task.id, nextStatus[task.status])} /><button className="task-main" onDoubleClick={() => edit(task.id,task.title)}><span className={task.status === 'done' ? 'done' : ''}>{task.title}</span><small>{date(task.dueDate, { day: 'numeric', month: 'short' })} · {task.category} {task.status === 'doing' && '· En cours'}</small></button><Badge tone={priorityTone[task.priority]}>{priorityLabel[task.priority]}</Badge>{extended&&<span className="reorder-actions"><IconButton label="Monter" onClick={()=>{const i=tasks.indexOf(task);if(i>0)reorder(i,i-1)}}><ArrowUp size={12}/></IconButton><IconButton label="Descendre" onClick={()=>{const i=tasks.indexOf(task);if(i<tasks.length-1)reorder(i,i+1)}}><ArrowDown size={12}/></IconButton></span>}<IconButton label="Supprimer" className="row-delete" onClick={() => removeTask(task.id)}><Trash2 size={14} /></IconButton></div>
  return <Widget id="tasks" title="Tâches" icon={<ListChecks size={18} />} action={<div className="header-actions">{extended&&<IconButton label="Exporter CSV" onClick={csv}><Download size={16}/></IconButton>}<IconButton label="Ajouter une tâche" onClick={() => setModal('task')}><Plus size={17} /></IconButton></div>}>
    <div className="module-toolbar"><div className="mini-tabs">{(['active', 'all', 'done'] as const).map((id) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{id === 'active' ? 'Actives' : id === 'all' ? 'Toutes' : 'Terminées'}</button>)}</div>{extended?<div className="mini-tabs"><button className={mode==='list'?'active':''} onClick={()=>setMode('list')}>Liste</button><button className={mode==='board'?'active':''} onClick={()=>setMode('board')}><Columns3 size={11}/> Kanban</button></div>:<span>{tasks.filter((t) => t.status !== 'done').length} à faire</span>}</div>
    {mode==='list'||!extended?<div className={`task-list ${extended ? 'extended' : ''}`}>{visible.slice(0, extended ? 50 : 5).map(row)}</div>:<div className="task-board">{(['todo','doing','done'] as const).map(status=><section key={status}><header><b>{status==='todo'?'À faire':status==='doing'?'En cours':'Terminé'}</b><Badge>{tasks.filter(t=>t.status===status).length}</Badge></header>{tasks.filter(t=>t.status===status).map(task=><article key={task.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',task.id)} onDoubleClick={()=>edit(task.id,task.title)}><b>{task.title}</b><small>{task.category} · {date(task.dueDate,{day:'numeric',month:'short'})}</small><div><Badge tone={priorityTone[task.priority]}>{priorityLabel[task.priority]}</Badge><button onClick={()=>setTaskStatus(task.id,nextStatus[task.status])}>Déplacer →</button></div></article>)}<div className="kanban-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>setTaskStatus(e.dataTransfer.getData('text/plain'),status)}>Déposer ici</div></section>)}</div>}
    {!extended && visible.length > 5 && <button className="see-all" onClick={() => { location.hash = '#/personal' }}>Voir les {visible.length} tâches <ChevronRight size={15} /></button>}
  </Widget>
}

export function NotesModule({ extended = false }: { extended?: boolean }) {
  const date = useDateFormatter()
  const notes = usePersonalStore((s) => s.notes)
  const addNote = usePersonalStore((s) => s.addNote)
  const updateNote = usePersonalStore((s) => s.updateNote)
  const removeNote = usePersonalStore((s) => s.removeNote)
  return <Widget id="notes" title="Notes rapides" icon={<NotebookPen size={18} />} action={<IconButton label="Ajouter une note" onClick={addNote}><Plus size={17} /></IconButton>}>
    <div className={`notes-list ${extended ? 'notes-grid' : ''}`}>{notes.slice(0, extended ? 20 : 3).map((note) => <article className="note-card" key={note.id}>
      <input value={note.title} aria-label="Titre de la note" onChange={(e) => updateNote(note.id, { title: e.target.value })} />
      <textarea value={note.content} aria-label="Contenu de la note" onChange={(e) => updateNote(note.id, { content: e.target.value })} rows={extended ? 5 : 2} />
      <footer><span>{note.pinned ? 'Épinglée · ' : ''}{date(note.updatedAt, { day: 'numeric', month: 'short' })}</span><IconButton label="Supprimer la note" onClick={() => removeNote(note.id)}><Trash2 size={13} /></IconButton></footer>
    </article>)}</div>
  </Widget>
}

const week = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - 6 + i); return date.toISOString().slice(0, 10) })
export function HabitsModule({ extended = false }: { extended?: boolean }) {
  const habits = usePersonalStore((s) => s.habits)
  const toggle = usePersonalStore((s) => s.toggleHabit), add=usePersonalStore(s=>s.addHabit), remove=usePersonalStore(s=>s.removeHabit), date=useDateFormatter()
  return <Widget id="habits" title="Habitudes" icon={<Flame size={18} />} action={extended?<IconButton label="Nouvelle habitude" onClick={()=>{const name=prompt('Nom de la nouvelle habitude')?.trim();if(name)add(name)}}><Plus size={16}/></IconButton>:undefined}>
    <div className="habit-days"><span /><span />{week.map((day) => <small key={day}>{date(new Date(day + 'T12:00:00'), { weekday: 'narrow' })}</small>)}</div>
    <div className={`habit-list ${extended ? 'extended' : ''}`}>{habits.map((habit) => <div className="habit-row" key={habit.id}><span className="habit-name"><i>{habit.icon}</i>{habit.name}</span><b><Flame size={13} />{habit.streak}</b>{week.map((date) => <button key={date} className={habit.done[date] ? 'done' : habit.missed[date] ? 'missed' : ''} onClick={() => toggle(habit.id, date)} aria-label={`${habit.name}, ${date}`}>{habit.done[date] ? '✓' : habit.missed[date] ? '×' : ''}</button>)}{extended&&<IconButton label="Supprimer l’habitude" onClick={()=>remove(habit.id)}><Trash2 size={12}/></IconButton>}</div>)}</div>
    <div className="habit-summary"><CheckCircle2 size={16} /><span><b>{Math.round(habits.reduce((sum, h) => sum + week.filter((d) => h.done[d]).length, 0) / (habits.length * 7) * 100)}%</b> de régularité cette semaine</span></div>
  </Widget>
}

const moods = ['😢', '😟', '😐', '😊', '😄']
export function JournalModule({ extended = false }: { extended?: boolean }) {
  const date = useDateFormatter()
  const entries = usePersonalStore((s) => s.journal)
  const add = usePersonalStore((s) => s.addJournal)
  const remove = usePersonalStore((s) => s.removeJournal)
  const [text, setText] = useState(entries.find((e) => e.date === new Date().toISOString().slice(0, 10))?.content ?? '')
  const [mood, setMood] = useState(4), [unlocked, setUnlocked] = useState(false), [pinValue, setPinValue] = useState('')
  const journalLocked=useSettingsStore((s)=>s.journalLocked), pin=useSettingsStore((s)=>s.pin), showToast=useUIStore((s)=>s.showToast)
  if(journalLocked&&!unlocked) return <Widget id="journal" title="Journal privé" icon={<Sparkles size={18} />}><form className="journal-lock" onSubmit={(e)=>{e.preventDefault();if(pinValue===pin)setUnlocked(true);else{showToast('PIN incorrect');setPinValue('')}}}><span>🔒</span><b>Votre journal est verrouillé</b><small>Saisissez votre PIN à 4 chiffres pour accéder aux entrées.</small><Input type="password" inputMode="numeric" maxLength={4} value={pinValue} onChange={(e)=>setPinValue(e.target.value)} placeholder="••••" aria-label="PIN du journal"/><Button type="submit" disabled={pinValue.length!==4}>Ouvrir le journal</Button></form></Widget>
  return <Widget id="journal" title="Journal" icon={<Sparkles size={18} />}>
    <div className="journal-date"><span>Aujourd’hui</span><div>{moods.map((item, index) => <button key={item} className={mood === index + 1 ? 'active' : ''} onClick={() => setMood(index + 1)}>{item}</button>)}</div></div>
    <textarea className="journal-editor" placeholder="Comment s’est passée votre journée ?" value={text} onChange={(e) => setText(e.target.value)} rows={extended ? 6 : 3} />
    <div className="journal-actions"><span>{text.trim().split(/\s+/).filter(Boolean).length} mots</span><Button size="sm" disabled={!text.trim()} onClick={() => add(text, mood)}>Enregistrer</Button></div>
    {extended && <div className="journal-history">{entries.map((entry) => <article key={entry.id}><span>{moods[entry.mood - 1]}</span><div><b>{date(entry.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b><p>{entry.content}</p></div><IconButton label="Supprimer" onClick={() => remove(entry.id)}><Trash2 size={14} /></IconButton></article>)}</div>}
  </Widget>
}

export function GoalsModule({ extended = false }: { extended?: boolean }) {
  const goals = usePersonalStore((s) => s.goals), update = usePersonalStore((s) => s.updateGoal), add=usePersonalStore(s=>s.addGoal), remove=usePersonalStore(s=>s.removeGoal)
  const [selected, setSelected] = useState(0), [creating,setCreating]=useState(false)
  const visible = extended ? goals : goals.length?[goals[selected % goals.length]]:[]
  const createGoal=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const d=new FormData(e.currentTarget);const title=String(d.get('title')).trim();if(!title)return;add({title,category:String(d.get('category')),progress:0,deadline:String(d.get('deadline')),milestones:[]});setCreating(false)}
  return <Widget id="goals" title="Objectifs SMART" icon={<Target size={18} />} action={extended?<IconButton label="Nouvel objectif" onClick={()=>setCreating(!creating)}><Plus size={16}/></IconButton>:goals.length?<div className="header-actions"><IconButton label="Objectif précédent" onClick={() => setSelected((v) => (v - 1 + goals.length) % goals.length)}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></IconButton><IconButton label="Objectif suivant" onClick={() => setSelected((v) => (v + 1) % goals.length)}><ChevronRight size={16} /></IconButton></div>:undefined}>
    {creating&&<form className="goal-create" onSubmit={createGoal}><Input name="title" autoFocus required placeholder="Objectif précis et mesurable"/><Input name="category" required placeholder="Catégorie"/><Input name="deadline" type="date" required defaultValue={new Date(Date.now()+90*86400000).toISOString().slice(0,10)}/><Button size="sm" type="submit">Créer</Button></form>}
    <div className={`goals-list ${extended ? 'extended' : ''}`}>{visible.map((goal) => <article className="goal-card" key={goal.id}><div className="goal-heading"><span><small>{goal.category}</small><strong contentEditable={extended} suppressContentEditableWarning onBlur={(e)=>update(goal.id,{title:e.currentTarget.textContent||goal.title})}>{goal.title}</strong></span><b>{goal.progress}%</b></div><Progress value={goal.progress} tone={goal.progress >= 70 ? 'success' : 'accent'} /><footer><span>{Math.max(0, daysUntil(goal.deadline))} jours restants</span>{extended && <input type="range" min="0" max="100" value={goal.progress} onChange={(e) => update(goal.id, { progress: Number(e.target.value) })} />}</footer>{extended && <><div className="milestones">{goal.milestones.map((milestone) => <button key={milestone.id} className={milestone.done ? 'done' : ''} onClick={()=>update(goal.id,{milestones:goal.milestones.map(m=>m.id===milestone.id?{...m,done:!m.done}:m)})}><CheckCircle2 size={14} />{milestone.title}</button>)}<button className="add-milestone" onClick={()=>{const title=prompt('Nom du jalon')?.trim();if(title)update(goal.id,{milestones:[...goal.milestones,{id:crypto.randomUUID(),title,done:false}]})}}><Plus size={13}/> Ajouter un jalon</button></div><IconButton className="goal-delete" label="Supprimer l’objectif" onClick={()=>confirm('Supprimer cet objectif ?')&&remove(goal.id)}><Trash2 size={14}/></IconButton></>}</article>)}</div>
    {!visible.length&&<div className="empty-goals"><Target/><b>Aucun objectif</b><Button size="sm" onClick={()=>setCreating(true)}>Créer le premier</Button></div>}
  </Widget>
}

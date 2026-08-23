import { useFinancePlanningStore, useFinanceStore, usePersonalStore, useSettingsStore } from '../store'
import type { Budget, CalendarEvent, Goal, Habit, Investment, JournalEntry, Note, SavingsGoal, Task, Transaction } from '../types'

export type ReportScope = 'complete' | 'financial' | 'personal' | 'planning'
export interface ReportOptions {
  scope: ReportScope
  from: string
  to: string
  includeDetails: boolean
}
export interface LifeOSReportSnapshot {
  generatedAt: string
  profile: { name: string; email: string; city: string }
  locale: { language: 'fr' | 'en'; currency: string }
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  tasks: Task[]
  notes: Note[]
  habits: Habit[]
  journal: JournalEntry[]
  goals: Goal[]
  events: CalendarEvent[]
  financePlanning: ReturnType<typeof useFinancePlanningStore.getState>['profile']
}
export interface GeneratedLifeOSReport {
  options: ReportOptions
  snapshot: LifeOSReportSnapshot
  title: string
  fileBase: string
  lines: string[]
  csv: string
  json: string
  metrics: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
    activeTasks: number
    completedTasks: number
    goalProgress: number
    noteCount: number
  }
}

const scopeLabels: Record<ReportScope, string> = {
  complete: 'Rapport complet LifeOS',
  financial: 'Rapport financier LifeOS',
  personal: 'Rapport personnel LifeOS',
  planning: 'Rapport de planification financière',
}
const inPeriod = (value: string, from: string, to: string) => (!from || value.slice(0, 10) >= from) && (!to || value.slice(0, 10) <= to)
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function collectLifeOSReportSnapshot(): LifeOSReportSnapshot {
  const settings = useSettingsStore.getState()
  const finance = useFinanceStore.getState()
  const personal = usePersonalStore.getState()
  return {
    generatedAt: new Date().toISOString(),
    profile: { name: settings.profile.name, email: settings.profile.email, city: settings.profile.city },
    locale: { language: settings.language, currency: settings.currency },
    transactions: finance.transactions,
    budgets: finance.budgets,
    savingsGoals: finance.savingsGoals,
    investments: finance.investments,
    tasks: personal.tasks,
    notes: personal.notes,
    habits: personal.habits,
    journal: personal.journal,
    goals: personal.goals,
    events: personal.events,
    financePlanning: useFinancePlanningStore.getState().profile,
  }
}

export function generateLifeOSReport(snapshot: LifeOSReportSnapshot, options: ReportOptions): GeneratedLifeOSReport {
  const transactions = snapshot.transactions.filter((item) => inPeriod(item.date, options.from, options.to))
  const tasks = snapshot.tasks.filter((item) => inPeriod(item.dueDate, options.from, options.to))
  const events = snapshot.events.filter((item) => inPeriod(item.date, options.from, options.to))
  const journal = snapshot.journal.filter((item) => inPeriod(item.date, options.from, options.to))
  const notes = snapshot.notes.filter((item) => inPeriod(item.updatedAt, options.from, options.to))
  const income = sum(transactions.filter((item) => item.type === 'income').map((item) => item.amount))
  const expenses = sum(transactions.filter((item) => item.type === 'expense').map((item) => item.amount))
  const completedTasks = tasks.filter((item) => item.status === 'done').length
  const activeTasks = tasks.length - completedTasks
  const goalProgress = snapshot.goals.length ? Math.round(sum(snapshot.goals.map((item) => item.progress)) / snapshot.goals.length) : 0
  const locale = snapshot.locale.language === 'en' ? 'en-GB' : 'fr-FR'
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: snapshot.locale.currency, maximumFractionDigits: 2 }).format(value)
  const date = (value: string | Date) => {
    if (!value) return 'Non renseignée'
    const parsed = typeof value === 'string' ? new Date(`${value.slice(0, 10)}T12:00:00`) : value
    return Number.isNaN(parsed.getTime()) ? 'Non renseignée' : new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed)
  }
  const hasFinance = options.scope === 'complete' || options.scope === 'financial'
  const hasPersonal = options.scope === 'complete' || options.scope === 'personal'
  const hasPlanning = options.scope === 'complete' || options.scope === 'planning'
  const lines: string[] = [scopeLabels[options.scope], `Généré le ${date(new Date())}`, `Titulaire : ${snapshot.profile.name} · ${snapshot.profile.email}`, `Période : ${options.from ? date(options.from) : 'début'} au ${options.to ? date(options.to) : 'aujourd’hui'}`, '']
  const rows: unknown[][] = [['Section', 'Date', 'Type', 'Titre', 'Catégorie / statut', 'Valeur', 'Détail']]

  if (hasFinance) {
    lines.push('SYNTHÈSE FINANCIÈRE', `Revenus : ${money(income)}`, `Dépenses : ${money(expenses)}`, `Solde net : ${money(income - expenses)}`, `Transactions : ${transactions.length}`, '')
    lines.push('BUDGETS', ...snapshot.budgets.map((item) => `${item.category} : ${money(item.planned)} planifiés`), '')
    lines.push('ÉPARGNE ET INVESTISSEMENTS', ...snapshot.savingsGoals.map((item) => `${item.name} : ${money(item.current)} / ${money(item.target)} · échéance ${date(item.deadline)}`), ...snapshot.investments.map((item) => `${item.name} (${item.symbol}) : ${money(item.value)} · variation ${item.change}%`), '')
    transactions.forEach((item) => rows.push(['Finance', item.date, item.type === 'income' ? 'Revenu' : 'Dépense', item.title, item.category, item.amount, item.note ?? '']))
    snapshot.budgets.forEach((item) => rows.push(['Budget', '', 'Budget', item.category, '', item.planned, 'Planifié']))
    snapshot.savingsGoals.forEach((item) => rows.push(['Épargne', item.deadline, 'Objectif', item.name, '', item.current, `Cible ${item.target}`]))
    snapshot.investments.forEach((item) => rows.push(['Investissement', '', item.type, item.name, item.symbol, item.value, `Investi ${item.invested}; variation ${item.change}%`]))
    if (options.includeDetails) lines.push('TRANSACTIONS', ...transactions.map((item) => `${item.date} · ${item.type === 'income' ? '+' : '-'}${money(item.amount)} · ${item.title} · ${item.category}`), '')
  }

  if (hasPersonal) {
    lines.push('VIE PERSONNELLE', `Tâches actives : ${activeTasks}`, `Tâches terminées : ${completedTasks}`, `Progression moyenne des objectifs : ${goalProgress}%`, `Notes : ${notes.length} · Habitudes : ${snapshot.habits.length} · Événements : ${events.length}`, '')
    lines.push('OBJECTIFS', ...snapshot.goals.map((item) => `${item.title} · ${item.progress}% · échéance ${date(item.deadline)}`), '')
    tasks.forEach((item) => rows.push(['Personnel', item.dueDate, 'Tâche', item.title, item.status, item.priority, item.category]))
    events.forEach((item) => rows.push(['Personnel', item.date, 'Événement', item.title, item.time, '', '']))
    snapshot.goals.forEach((item) => rows.push(['Personnel', item.deadline, 'Objectif', item.title, item.category, `${item.progress}%`, '']))
    notes.forEach((item) => rows.push(['Personnel', item.updatedAt.slice(0, 10), 'Note', item.title, item.pinned ? 'Épinglée' : '', item.content.length, item.content]))
    journal.forEach((item) => rows.push(['Personnel', item.date, 'Journal', `Humeur ${item.mood}/5`, '', '', item.content]))
    if (options.includeDetails) {
      lines.push('TÂCHES', ...tasks.map((item) => `${item.dueDate} · ${item.title} · ${item.status} · ${item.priority}`), '')
      lines.push('ÉVÉNEMENTS', ...events.map((item) => `${item.date} ${item.time} · ${item.title}`), '')
      lines.push('NOTES', ...notes.map((item) => `${item.title} · ${item.content.replace(/\s+/g, ' ').slice(0, 320)}${item.content.length > 320 ? '…' : ''}`), '')
    }
  }

  if (hasPlanning) {
    const planning = snapshot.financePlanning
    const monthlyIncome = planning.situation.netSalary + planning.situation.otherIncome + planning.situation.householdContribution
    const essential = sum(Object.values(planning.essentials))
    const lifestyle = sum(Object.values(planning.lifestyle).filter((value): value is number => typeof value === 'number'))
    lines.push('PLANIFICATION FINANCIÈRE', `Revenus mensuels déclarés : ${money(monthlyIncome)}`, `Dépenses essentielles : ${money(essential)}`, `Mode de vie : ${money(lifestyle)}`, `Capacité mensuelle estimée : ${money(monthlyIncome - essential - lifestyle)}`, `Projet : ${planning.goals.goalDetails || planning.goals.primaryGoal || 'Non renseigné'}`, `Objectif : ${money(planning.goals.targetAmount)} · épargne actuelle ${money(planning.goals.currentSavings)}`, '')
    rows.push(['Planification', '', 'Revenus', 'Revenus mensuels déclarés', '', monthlyIncome, ''])
    rows.push(['Planification', '', 'Dépenses', 'Dépenses essentielles', '', essential, ''])
    rows.push(['Planification', planning.goals.targetDate, 'Projet', planning.goals.goalDetails || planning.goals.primaryGoal, planning.goals.priority, planning.goals.targetAmount, planning.goals.notes])
  }

  lines.push('FIN DU RAPPORT', 'Rapport généré localement par LifeOS. Aucune donnée n’a été envoyée à un serveur.')
  const fileBase = `rapport-lifeos-${options.scope}-${new Date().toISOString().slice(0, 10)}`
  const exportSnapshot = {
    report: { title: scopeLabels[options.scope], generatedAt: snapshot.generatedAt, options },
    profile: snapshot.profile,
    metrics: { income, expenses, balance: income - expenses, transactionCount: transactions.length, activeTasks, completedTasks, goalProgress, noteCount: notes.length },
    data: {
      ...(hasFinance ? { transactions, budgets: snapshot.budgets, savingsGoals: snapshot.savingsGoals, investments: snapshot.investments } : {}),
      ...(hasPersonal ? { tasks, notes, habits: snapshot.habits, journal, goals: snapshot.goals, events } : {}),
      ...(hasPlanning ? { financePlanning: snapshot.financePlanning } : {}),
    },
  }
  return {
    options,
    snapshot,
    title: scopeLabels[options.scope],
    fileBase,
    lines,
    csv: '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\n'),
    json: JSON.stringify(exportSnapshot, null, 2),
    metrics: { income, expenses, balance: income - expenses, transactionCount: transactions.length, activeTasks, completedTasks, goalProgress, noteCount: notes.length },
  }
}

const ascii = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/€/g, 'EUR').replace(/[^\x20-\x7E]/g, '-')
const pdfEscape = (value: string) => ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
function wrapLine(value: string, width = 88) {
  const source = ascii(value).trimEnd()
  if (!source) return [' ']
  const result: string[] = []
  let current = ''
  source.split(/\s+/).forEach((word) => {
    if (word.length > width) {
      if (current) result.push(current)
      for (let index = 0; index < word.length; index += width) result.push(word.slice(index, index + width))
      current = ''
    } else if (`${current} ${word}`.trim().length > width) {
      result.push(current)
      current = word
    } else current = `${current} ${word}`.trim()
  })
  if (current) result.push(current)
  return result
}

export function createLifeOSReportPdf(report: GeneratedLifeOSReport) {
  const wrapped = report.lines.flatMap((line) => wrapLine(line))
  const perPage = 48
  const pages = Array.from({ length: Math.max(1, Math.ceil(wrapped.length / perPage)) }, (_, index) => wrapped.slice(index * perPage, (index + 1) * perPage))
  const objects: string[] = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  const pageRefs: string[] = []
  pages.forEach((lines, index) => {
    const pageObject = 4 + index * 2
    const contentObject = pageObject + 1
    pageRefs.push(`${pageObject} 0 R`)
    const contentLines = [`BT /F1 10 Tf 48 800 Td 14 TL`, ...lines.map((line) => `(${pdfEscape(line)}) Tj T*`), `T* (Page ${index + 1} / ${pages.length}) Tj`, 'ET']
    const stream = contentLines.join('\n')
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  })
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`
  let output = '%PDF-1.4\n'
  const offsets: number[] = [0]
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = output.length
    output += `${index} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xref = output.length
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let index = 1; index < objects.length; index += 1) output += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([output], { type: 'application/pdf' })
}

export function downloadReportBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadLifeOSReportPdf(report: GeneratedLifeOSReport) {
  downloadReportBlob(`${report.fileBase}.pdf`, createLifeOSReportPdf(report))
}

export function printLifeOSReport(report: GeneratedLifeOSReport) {
  const popup = window.open('', '_blank', 'width=980,height=760')
  if (!popup) return false
  popup.opener = null
  const content = report.lines.map((line) => line ? `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '<br/>').join('')
  popup.document.write(`<!doctype html><html lang="fr"><head><title>${report.title}</title><style>@page{size:A4;margin:18mm}body{font:12px/1.5 Arial,sans-serif;color:#182019;max-width:850px;margin:auto}h1{font-size:24px}p{margin:2px 0;white-space:pre-wrap}p:first-child{font-size:24px;font-weight:800;margin-bottom:14px}@media print{body{max-width:none}}</style></head><body>${content}<script>addEventListener('load',()=>setTimeout(()=>print(),150))<\/script></body></html>`)
  popup.document.close()
  return true
}

import { monthTransactions, useFinanceStore, usePersonalStore, useSettingsStore } from '../store'

export interface EmailNotificationMessage {
  recipient: string
  subject: string
  body: string
  alertCount: number
}
export interface EmailPreparationRecord {
  id: string
  preparedAt: string
  recipient: string
  subject: string
  alertCount: number
}

const historyKey = 'lifeos:email-notification-history'
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
const localDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))

export function buildEmailNotificationMessage(now = new Date()): EmailNotificationMessage {
  const settings = useSettingsStore.getState()
  const finance = useFinanceStore.getState()
  const personal = usePersonalStore.getState()
  const today = now.toISOString().slice(0, 10)
  const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10)
  const month = monthTransactions(finance.transactions, now)
  const expenses = month.filter((item) => item.type === 'expense')
  const income = month.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0)
  const spent = expenses.reduce((total, item) => total + item.amount, 0)
  const budgetAlerts = settings.emailBudgetAlerts ? finance.budgets.map((budget) => {
    const used = expenses.filter((item) => item.category === budget.category).reduce((total, item) => total + item.amount, 0)
    return { ...budget, used, percent: budget.planned ? Math.round(used / budget.planned * 100) : 0 }
  }).filter((item) => item.percent >= 80) : []
  const tasks = settings.emailTaskReminders ? personal.tasks.filter((item) => item.status !== 'done' && Boolean(item.dueDate) && item.dueDate <= today) : []
  const events = settings.emailWeeklyReport ? personal.events.filter((item) => item.date >= today && item.date <= weekEnd).sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`)) : []
  const money = (value: number) => new Intl.NumberFormat(settings.language === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: settings.currency, maximumFractionDigits: settings.amountDecimals }).format(value)
  const lines = [
    `Bonjour ${settings.profile.name.split(' ')[0]},`,
    '',
    `Voici votre récapitulatif LifeOS du ${localDate(today)}.`,
  ]
  if (settings.emailWeeklyReport) lines.push('', 'SYNTHÈSE FINANCIÈRE', `Revenus du mois : ${money(income)}`, `Dépenses du mois : ${money(spent)}`, `Solde net : ${money(income - spent)}`)
  if (budgetAlerts.length) lines.push('', 'ALERTES BUDGET', ...budgetAlerts.map((item) => `- ${item.category} : ${item.percent}% (${money(item.used)} / ${money(item.planned)})`))
  if (tasks.length) lines.push('', 'TÂCHES À TRAITER', ...tasks.map((item) => `- ${item.title} · échéance ${localDate(item.dueDate)} · ${item.priority}`))
  if (events.length) lines.push('', 'PROCHAINS ÉVÉNEMENTS', ...events.map((item) => `- ${localDate(item.date)} à ${item.time} · ${item.title}`))
  if (!budgetAlerts.length && !tasks.length) lines.push('', settings.emailWeeklyReport ? 'Aucune alerte urgente : tout est à jour.' : 'Aucune alerte active à inclure dans ce message.')
  lines.push('', 'Ce message a été préparé localement par LifeOS. Vos données ne sont envoyées qu’après votre validation dans votre application e-mail.')
  return {
    recipient: settings.emailAddress.trim() || settings.profile.email.trim(),
    subject: `LifeOS — ${budgetAlerts.length + tasks.length ? `${budgetAlerts.length + tasks.length} alerte(s)` : 'récapitulatif'} du ${today}`,
    body: lines.join('\n'),
    alertCount: budgetAlerts.length + tasks.length,
  }
}

export function emailComposerUrl(message: EmailNotificationMessage) {
  return `mailto:${encodeURIComponent(message.recipient)}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`
}

export function prepareEmailNotification(message = buildEmailNotificationMessage()) {
  if (!validEmail(message.recipient)) return { ok: false as const, reason: 'Adresse e-mail invalide' }
  const history = getEmailPreparationHistory()
  const record: EmailPreparationRecord = { id: globalThis.crypto?.randomUUID?.() ?? `email-${Date.now()}`, preparedAt: new Date().toISOString(), recipient: message.recipient, subject: message.subject, alertCount: message.alertCount }
  localStorage.setItem(historyKey, JSON.stringify([record, ...history].slice(0, 30)))
  const anchor = document.createElement('a')
  anchor.href = emailComposerUrl(message)
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  return { ok: true as const, record }
}

export function prepareReportEmail(reportTitle: string, summary: string) {
  const settings = useSettingsStore.getState()
  return prepareEmailNotification({
    recipient: settings.emailAddress.trim() || settings.profile.email.trim(),
    subject: `${reportTitle} — ${new Date().toISOString().slice(0, 10)}`,
    body: `Bonjour ${settings.profile.name.split(' ')[0]},\n\nVotre rapport LifeOS est prêt.\n\n${summary}\n\nTéléchargez le PDF depuis LifeOS puis joignez-le à ce message si nécessaire.\n\nCe message a été préparé localement et sera envoyé uniquement après votre validation.`,
    alertCount: 0,
  })
}

export function getEmailPreparationHistory(): EmailPreparationRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

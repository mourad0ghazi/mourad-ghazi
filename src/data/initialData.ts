import type { Budget, CalendarEvent, Goal, Habit, Investment, JournalEntry, Note, SavingsGoal, Settings, Task, Transaction } from '../types'

const d = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

const monthDate = (monthOffset: number, day = 5) => {
  const date = new Date()
  date.setMonth(date.getMonth() + monthOffset, day)
  return date.toISOString().slice(0, 10)
}

export const initialSettings: Settings = {
  profile: {
    name: 'Mourad Ghazi',
    email: 'mouradghazi002@gmail.com',
    bio: 'Développeur web passionné, concentré sur une vie intentionnelle et une croissance durable.',
    phone: '+212 6 81 01 02 81',
    birthDate: '1998-05-15',
    city: 'Casablanca',
  },
  theme: 'light', accent: 'smoke', density: 'comfortable', language: 'fr', currency: 'MAD',
  dateFormat: 'DD/MM/YYYY', timeFormat: '24h', amountDecimals: 0, currencyDisplay: 'symbol', timezone: 'Africa/Casablanca', notifications: true,
  budgetAlerts: true, emailNotifications: false, emailAddress: 'mouradghazi002@gmail.com', emailFrequency: 'daily', emailBudgetAlerts: true, emailTaskReminders: true, emailWeeklyReport: true,
  coachMode: true, coachFrequency: 'daily', animations: true, smoke: true,
  parallax: true, hideAmounts: false, pin: '2026', journalLocked: false,
}

export const initialTransactions: Transaction[] = [
  { id: 'tr-1', title: 'Salaire', amount: 14500, type: 'income', category: 'Salaire', date: monthDate(0, 1) },
  { id: 'tr-2', title: 'Mission freelance', amount: 3200, type: 'income', category: 'Freelance', date: monthDate(0, 12) },
  { id: 'tr-3', title: 'Loyer', amount: 4200, type: 'expense', category: 'Logement', date: monthDate(0, 2) },
  { id: 'tr-4', title: 'Courses Marjane', amount: 1240, type: 'expense', category: 'Alimentation', date: monthDate(0, 8) },
  { id: 'tr-5', title: 'Transport', amount: 580, type: 'expense', category: 'Transport', date: monthDate(0, 10) },
  { id: 'tr-6', title: 'Salle de sport', amount: 350, type: 'expense', category: 'Santé', date: monthDate(0, 6) },
  { id: 'tr-7', title: 'Restaurant', amount: 460, type: 'expense', category: 'Loisirs', date: monthDate(0, 15) },
  { id: 'tr-8', title: 'Internet & mobile', amount: 399, type: 'expense', category: 'Abonnements', date: monthDate(0, 4) },
  { id: 'tr-9', title: 'Salaire', amount: 14200, type: 'income', category: 'Salaire', date: monthDate(-1, 1) },
  { id: 'tr-10', title: 'Loyer', amount: 4200, type: 'expense', category: 'Logement', date: monthDate(-1, 2) },
  { id: 'tr-11', title: 'Courses', amount: 1570, type: 'expense', category: 'Alimentation', date: monthDate(-1, 9) },
  { id: 'tr-12', title: 'Salaire', amount: 14000, type: 'income', category: 'Salaire', date: monthDate(-2, 1) },
  { id: 'tr-13', title: 'Dépenses mensuelles', amount: 7100, type: 'expense', category: 'Autres', date: monthDate(-2, 18) },
  { id: 'tr-14', title: 'Salaire', amount: 13800, type: 'income', category: 'Salaire', date: monthDate(-3, 1) },
  { id: 'tr-15', title: 'Dépenses mensuelles', amount: 7450, type: 'expense', category: 'Autres', date: monthDate(-3, 18) },
  { id: 'tr-16', title: 'Salaire', amount: 13500, type: 'income', category: 'Salaire', date: monthDate(-4, 1) },
  { id: 'tr-17', title: 'Dépenses mensuelles', amount: 7800, type: 'expense', category: 'Autres', date: monthDate(-4, 18) },
  { id: 'tr-18', title: 'Salaire', amount: 13200, type: 'income', category: 'Salaire', date: monthDate(-5, 1) },
  { id: 'tr-19', title: 'Dépenses mensuelles', amount: 7200, type: 'expense', category: 'Autres', date: monthDate(-5, 18) },
]

export const initialBudgets: Budget[] = [
  { id: 'b1', category: 'Logement', planned: 4500, color: '#343a40' },
  { id: 'b2', category: 'Alimentation', planned: 2000, color: '#495057' },
  { id: 'b3', category: 'Transport', planned: 1000, color: '#6c757d' },
  { id: 'b4', category: 'Loisirs', planned: 900, color: '#868e96' },
  { id: 'b5', category: 'Santé', planned: 700, color: '#adb5bd' },
  { id: 'b6', category: 'Abonnements', planned: 600, color: '#ced4da' },
  { id: 'b7', category: 'Formation', planned: 1200, color: '#5f6b62' },
  { id: 'b8', category: 'Autres', planned: 800, color: '#9aa0a6' },
]

export const initialSavingsGoals: SavingsGoal[] = [
  { id: 's1', name: "Fonds d'urgence", current: 21500, target: 30000, deadline: d(150), icon: '🛡️' },
  { id: 's2', name: 'MacBook Pro', current: 9600, target: 18000, deadline: d(240), icon: '💻' },
  { id: 's3', name: 'Voyage au Japon', current: 7200, target: 25000, deadline: d(365), icon: '✈️' },
]

export const initialInvestments: Investment[] = [
  { id: 'i1', name: 'ETF Monde', symbol: 'MSCI', type: 'Actions', value: 28500, invested: 24000, change: 18.7 },
  { id: 'i2', name: 'Bitcoin', symbol: 'BTC', type: 'Crypto', value: 8200, invested: 9000, change: -8.9 },
  { id: 'i3', name: 'SCPI Atlas', symbol: 'IMMO', type: 'Immobilier', value: 15400, invested: 14000, change: 10 },
  { id: 'i4', name: 'Compte rémunéré', symbol: 'CASH', type: 'Épargne', value: 12000, invested: 12000, change: 2.4 },
]

export const initialTasks: Task[] = [
  { id: 't1', title: 'Finaliser le portfolio client', status: 'doing', priority: 'urgent', dueDate: d(1), category: 'Travail', tags: ['web', 'client'], subtasks: [{ id: 'st1', title: 'Responsive mobile', done: true }, { id: 'st2', title: 'Optimiser les images', done: false }] },
  { id: 't2', title: 'Planifier le budget de septembre', status: 'todo', priority: 'high', dueDate: d(3), category: 'Finance', tags: ['budget'], subtasks: [] },
  { id: 't3', title: 'Séance de sport — jambes', status: 'todo', priority: 'medium', dueDate: d(0), category: 'Santé', tags: ['sport'], subtasks: [] },
  { id: 't4', title: 'Lire 30 pages', status: 'done', priority: 'low', dueDate: d(0), category: 'Apprentissage', tags: ['lecture'], subtasks: [] },
  { id: 't5', title: 'Appeler la famille', status: 'todo', priority: 'medium', dueDate: d(2), category: 'Personnel', tags: ['famille'], subtasks: [] },
  { id: 't6', title: 'Réviser React avancé', status: 'doing', priority: 'high', dueDate: d(5), category: 'Apprentissage', tags: ['dev'], subtasks: [{ id: 'st6', title: 'Hooks personnalisés', done: true }] },
  { id: 't7', title: 'Préparer les repas de la semaine', status: 'todo', priority: 'low', dueDate: d(1), category: 'Maison', tags: ['routine'], subtasks: [] },
]

export const initialNotes: Note[] = [
  { id: 'n1', title: "Idées d'investissement", content: 'Étudier les ETF à faibles frais, renforcer progressivement et conserver un fonds de sécurité liquide.', updatedAt: new Date().toISOString(), pinned: true },
  { id: 'n2', title: 'Vision 2026', content: 'Construire des produits simples, utiles et durables. Protéger mon temps de concentration le matin.', updatedAt: new Date(Date.now() - 86400000).toISOString(), pinned: true },
  { id: 'n3', title: 'Recette tajine', content: 'Poulet, citron confit, olives, gingembre, curcuma. Cuisson douce pendant 50 minutes.', updatedAt: new Date(Date.now() - 172800000).toISOString(), pinned: false },
]

const weekKeys = Array.from({ length: 7 }, (_, i) => d(i - 6))
export const initialHabits: Habit[] = [
  { id: 'h1', name: 'Méditation', icon: '◌', done: Object.fromEntries(weekKeys.map((x, i) => [x, i !== 2])), missed: {}, streak: 4, bestStreak: 12 },
  { id: 'h2', name: 'Sport', icon: '↗', done: Object.fromEntries(weekKeys.map((x, i) => [x, i % 2 === 0])), missed: {}, streak: 2, bestStreak: 8 },
  { id: 'h3', name: 'Lecture', icon: '□', done: Object.fromEntries(weekKeys.map((x, i) => [x, i !== 4])), missed: {}, streak: 6, bestStreak: 21 },
  { id: 'h4', name: '2L d’eau', icon: '◇', done: Object.fromEntries(weekKeys.map((x) => [x, true])), missed: {}, streak: 9, bestStreak: 15 },
]

export const initialJournal: JournalEntry[] = [
  { id: 'j1', date: d(-1), content: "Journée productive. J'ai protégé ma matinée pour le travail profond et pris le temps de marcher en fin de journée.", mood: 4 },
  { id: 'j2', date: d(-3), content: 'Beaucoup de tâches, mais les priorités sont plus claires après la revue hebdomadaire.', mood: 3 },
]

export const initialGoals: Goal[] = [
  { id: 'g1', title: 'Lire 12 livres cette année', category: 'Apprentissage', progress: 67, deadline: d(130), milestones: [{ id: 'gm1', title: '8 livres terminés', done: true }, { id: 'gm2', title: 'Créer les notes de lecture', done: false }] },
  { id: 'g2', title: 'Courir 10 km sans pause', category: 'Santé', progress: 54, deadline: d(75), milestones: [{ id: 'gm3', title: 'Courir 5 km', done: true }, { id: 'gm4', title: 'Courir 8 km', done: false }] },
  { id: 'g3', title: 'Lancer mon micro-SaaS', category: 'Carrière', progress: 35, deadline: d(180), milestones: [{ id: 'gm5', title: 'Valider le problème', done: true }, { id: 'gm6', title: 'Publier le MVP', done: false }] },
]

export const initialEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Point client', date: d(1), time: '10:00', color: '#495057' },
  { id: 'e2', title: 'Sport', date: d(2), time: '18:30', color: '#5f6b62' },
  { id: 'e3', title: 'Revue budget', date: d(4), time: '19:00', color: '#8a7563' },
  { id: 'e4', title: 'Déjeuner famille', date: d(6), time: '13:00', color: '#64748b' },
  { id: 'e5', title: 'Deep work', date: d(8), time: '09:00', color: '#343a40' },
]

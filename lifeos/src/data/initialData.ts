// ─────────────────────────────────────────────────────────────
// LifeOS – Données initiales (mock réaliste)
// Aucun fichier Excel n'ayant été fourni, ces données servent de
// base de démonstration. Elles peuvent être remplacées à tout
// moment via Paramètres > Données > Importer (JSON/CSV).
// ─────────────────────────────────────────────────────────────

import type {
  AppState,
  BudgetCategory,
  CalendarEvent,
  Goal,
  Habit,
  Investment,
  JournalEntry,
  Note,
  SavingsGoal,
  Task,
  Transaction,
} from '../types';
import { addDays, firstOfMonth, todayISO, uid } from '../utils/helpers';

const today = todayISO();
const month = firstOfMonth(today); // YYYY-MM-01

// ── Helpers de génération ────────────────────────────────────
const dayIn = (offset: number) => addDays(today, offset);

function tx(id: string, offset: number, label: string, category: string, amount: number, type: 'income' | 'expense'): Transaction {
  return { id, date: addDays(today, offset), label, category, amount, type };
}

// ── Profil ───────────────────────────────────────────────────
const profile = {
  name: 'Mourad Ghazi',
  email: 'mouradghazi002@gmail.com',
  bio: 'Développeur web à Casablanca. Je construis ma vie un module à la fois.',
  avatar: null as string | null,
  phone: '+212 6 81 01 02 81',
  birthday: '1998-06-15',
};

// ── Transactions : ~6 mois d'historique réaliste ─────────────
const transactions: Transaction[] = [
  // Mois courant
  tx('t01', -1, 'Salaire mensuel', 'Revenus', 12500, 'income'),
  tx('t02', -2, 'Loyer appartement', 'Logement', 3500, 'expense'),
  tx('t03', -3, 'Courses Marjane', 'Alimentation', 620, 'expense'),
  tx('t04', -5, 'Freelance – site vitrine', 'Revenus', 2400, 'income'),
  tx('t05', -6, 'Électricité + eau', 'Factures', 410, 'expense'),
  tx('t06', -7, 'Internet + mobile', 'Factures', 299, 'expense'),
  tx('t07', -8, 'Restaurant avec amis', 'Loisirs', 180, 'expense'),
  tx('t08', -9, 'Carburant', 'Transport', 350, 'expense'),
  tx('t09', -10, 'Virement épargne', 'Épargne', 1500, 'expense'),
  tx('t10', -11, 'Abonnement salle de sport', 'Santé', 250, 'expense'),
  tx('t11', -13, 'Cinéma + sortie', 'Loisirs', 120, 'expense'),
  tx('t12', -15, 'Pharmacie', 'Santé', 95, 'expense'),
  tx('t13', -18, 'Formation en ligne (Udemy)', 'Formation', 320, 'expense'),
  tx('t14', -20, 'Cadeau anniversaire', 'Loisirs', 200, 'expense'),
  // Mois précédent
  tx('t15', -32, 'Salaire mensuel', 'Revenus', 12500, 'income'),
  tx('t16', -34, 'Loyer appartement', 'Logement', 3500, 'expense'),
  tx('t17', -36, 'Courses Marjane', 'Alimentation', 590, 'expense'),
  tx('t18', -38, 'Freelance – application mobile', 'Revenus', 3800, 'income'),
  tx('t19', -40, 'Électricité + eau', 'Factures', 430, 'expense'),
  tx('t20', -42, 'Internet + mobile', 'Factures', 299, 'expense'),
  tx('t21', -44, 'Virement épargne', 'Épargne', 1500, 'expense'),
  tx('t22', -46, 'Carburant', 'Transport', 340, 'expense'),
  tx('t23', -48, 'Week-end à Marrakech', 'Loisirs', 950, 'expense'),
  tx('t24', -50, 'Nouveau PC portable', 'Équipement', 8900, 'expense'),
  // Mois antérieurs
  tx('t25', -63, 'Salaire mensuel', 'Revenus', 12000, 'income'),
  tx('t26', -64, 'Loyer appartement', 'Logement', 3500, 'expense'),
  tx('t27', -66, 'Courses Marjane', 'Alimentation', 610, 'expense'),
  tx('t28', -68, 'Freelance – dashboard', 'Revenus', 3000, 'income'),
  tx('t29', -70, 'Électricité + eau', 'Factures', 395, 'expense'),
  tx('t30', -72, 'Virement épargne', 'Épargne', 1500, 'expense'),
  tx('t31', -75, 'Assurance auto', 'Transport', 1200, 'expense'),
  tx('t32', -93, 'Salaire mensuel', 'Revenus', 12000, 'income'),
  tx('t33', -95, 'Loyer appartement', 'Logement', 3400, 'expense'),
  tx('t34', -97, 'Courses Marjane', 'Alimentation', 580, 'expense'),
  tx('t35', -100, 'Virement épargne', 'Épargne', 1500, 'expense'),
  tx('t36', -104, 'Freelance – site e-commerce', 'Revenus', 5500, 'income'),
  tx('t37', -123, 'Salaire mensuel', 'Revenus', 12000, 'income'),
  tx('t38', -125, 'Loyer appartement', 'Logement', 3400, 'expense'),
  tx('t39', -128, 'Vacances été', 'Loisirs', 2800, 'expense'),
  tx('t40', -130, 'Virement épargne', 'Épargne', 1500, 'expense'),
  tx('t41', -153, 'Salaire mensuel', 'Revenus', 11500, 'income'),
  tx('t42', -155, 'Loyer appartement', 'Logement', 3400, 'expense'),
  tx('t43', -158, 'Réparation voiture', 'Transport', 750, 'expense'),
  tx('t44', -160, 'Virement épargne', 'Épargne', 1500, 'expense'),
];

// ── Budget mensuel par catégories ────────────────────────────
const budget: BudgetCategory[] = [
  { id: 'b1', name: 'Logement', planned: 3500, color: '#6c757d' },
  { id: 'b2', name: 'Alimentation', planned: 1500, color: '#adb5bd' },
  { id: 'b3', name: 'Transport', planned: 800, color: '#868e96' },
  { id: 'b4', name: 'Factures', planned: 900, color: '#495057' },
  { id: 'b5', name: 'Loisirs', planned: 1000, color: '#9aa5ad' },
  { id: 'b6', name: 'Santé', planned: 400, color: '#5b7388' },
  { id: 'b7', name: 'Formation', planned: 500, color: '#5f7d6a' },
  { id: 'b8', name: 'Épargne', planned: 1500, color: '#343a40' },
];

// ── Tâches ───────────────────────────────────────────────────
const tasks: Task[] = [
  {
    id: 'k1',
    title: 'Réviser le portfolio en ligne',
    done: false,
    status: 'todo',
    priority: 'high',
    due: dayIn(1),
    tags: ['freelance'],
    subtasks: [
      { id: 'k1s1', title: 'Refaire la page "Projets"', done: true },
      { id: 'k1s2', title: 'Mettre à jour le CV téléchargeable', done: false },
    ],
    createdAt: dayIn(-1),
  },
  {
    id: 'k2',
    title: 'Payer la facture Internet',
    done: false,
    status: 'todo',
    priority: 'medium',
    due: dayIn(3),
    tags: ['maison'],
    subtasks: [],
    createdAt: dayIn(-2),
  },
  {
    id: 'k3',
    title: 'Session de sport (1h)',
    done: false,
    status: 'doing',
    priority: 'medium',
    due: dayIn(0),
    tags: ['santé'],
    subtasks: [],
    createdAt: dayIn(-1),
  },
  {
    id: 'k4',
    title: 'Appeler le client Y pour le devis',
    done: false,
    status: 'todo',
    priority: 'urgent',
    due: dayIn(0),
    tags: ['freelance'],
    subtasks: [
      { id: 'k4s1', title: 'Relire le cahier des charges', done: true },
      { id: 'k4s2', title: 'Préparer 3 questions', done: false },
    ],
    createdAt: dayIn(-3),
  },
  {
    id: 'k5',
    title: 'Lire 20 pages de "Deep Work"',
    done: true,
    status: 'done',
    priority: 'low',
    due: dayIn(-1),
    tags: ['lecture'],
    subtasks: [],
    createdAt: dayIn(-2),
  },
  {
    id: 'k6',
    title: 'Préparer le budget du mois prochain',
    done: false,
    status: 'todo',
    priority: 'medium',
    due: dayIn(5),
    tags: ['finance'],
    subtasks: [],
    createdAt: dayIn(-1),
  },
  {
    id: 'k7',
    title: 'Réserver le vol pour les vacances',
    done: false,
    status: 'todo',
    priority: 'low',
    due: dayIn(9),
    tags: ['voyage'],
    subtasks: [],
    createdAt: dayIn(-4),
  },
];

// ── Notes rapides ────────────────────────────────────────────
const notes: Note[] = [
  {
    id: 'n1',
    title: 'Idées de projets freelance',
    content: '• Dashboard SaaS pour une agence immobilière\n• Site e-commerce avec paiement CMI\n• Application de suivi d\'habitudes (comme LifeOS !)',
    updatedAt: dayIn(-2),
  },
  {
    id: 'n2',
    title: 'Objectifs du trimestre',
    content: '1. Terminer 3 projets freelance\n2. Épargner 15 000 MAD\n3. Publier 4 articles de blog tech\n4. Courir 5 km sans pause',
    updatedAt: dayIn(-5),
  },
  {
    id: 'n3',
    title: 'Mots de passe (à ranger !)',
    content: 'Penser à utiliser un gestionnaire de mots de passe plutôt que cette note 😅',
    updatedAt: dayIn(-8),
  },
];

// ── Habitudes ────────────────────────────────────────────────
function habitDays(dates: string[]): Record<string, boolean> {
  const d: Record<string, boolean> = {};
  dates.forEach((dt) => (d[dt] = true));
  return d;
}

const habits: Habit[] = [
  {
    id: 'h1',
    name: 'Sport / Marche 30 min',
    icon: 'activity',
    color: '#6c757d',
    days: habitDays([dayIn(-1), dayIn(-2), dayIn(-3), dayIn(-5), dayIn(-6)]),
    missed: habitDays([dayIn(-4), dayIn(-7)]),
  },
  {
    id: 'h2',
    name: 'Lecture 20 pages',
    icon: 'book',
    color: '#5b7388',
    days: habitDays([dayIn(-1), dayIn(-2), dayIn(-3), dayIn(-4), dayIn(-5), dayIn(-6), dayIn(-7)]),
    missed: {},
  },
  {
    id: 'h3',
    name: 'Méditation 10 min',
    icon: 'brain',
    color: '#5f7d6a',
    days: habitDays([dayIn(-1), dayIn(-3), dayIn(-4), dayIn(-6)]),
    missed: habitDays([dayIn(-2), dayIn(-5)]),
  },
  {
    id: 'h4',
    name: 'Boire 2L d\'eau',
    icon: 'droplets',
    color: '#868e96',
    days: habitDays([dayIn(-1), dayIn(-2), dayIn(-4), dayIn(-5), dayIn(-6), dayIn(-7)]),
    missed: {},
  },
  {
    id: 'h5',
    name: 'Pas d\'écran après 23h',
    icon: 'moon',
    color: '#495057',
    days: habitDays([dayIn(-2), dayIn(-3), dayIn(-5)]),
    missed: habitDays([dayIn(-1), dayIn(-4), dayIn(-6), dayIn(-7)]),
  },
];

// ── Journal ──────────────────────────────────────────────────
const journal: JournalEntry[] = [
  {
    id: 'j1',
    date: dayIn(-1),
    content: 'Bonne journée de travail. J\'ai avancé sur le projet dashboard et j\'ai réussi à faire du sport le soir. Le rythme commence à bien s\'installer. À améliorer : dormir plus tôt.',
    mood: 4,
  },
  {
    id: 'j2',
    date: dayIn(-2),
    content: 'Réunion avec un client potentiel aujourd\'hui. Le projet est intéressant mais le budget est serré. Je dois mieux négocier mes tarifs la prochaine fois.',
    mood: 3,
  },
  {
    id: 'j3',
    date: dayIn(-4),
    content: 'Journée productive ! Codé un module de suivi budgétaire en une journée. La discipline paie. Objectif du mois : stabiliser 2h de deep work par jour.',
    mood: 5,
  },
];

// ── Objectifs SMART ──────────────────────────────────────────
const goals: Goal[] = [
  {
    id: 'g1',
    title: 'Épargner 50 000 MAD',
    specific: 'Alimenter un compte épargne dédié chaque mois',
    measurable: '50 000 MAD cumulés (1 500 MAD/mois minimum)',
    deadline: addDays(today, 240),
    progress: 62,
    category: 'Finance',
    milestones: [
      { id: 'g1m1', label: '10 000 MAD épargnés', done: true },
      { id: 'g1m2', label: '25 000 MAD épargnés', done: true },
      { id: 'g1m3', label: '40 000 MAD épargnés', done: false },
    ],
  },
  {
    id: 'g2',
    title: 'Lire 24 livres cette année',
    specific: 'Lecture quotidienne de 20 pages minimum',
    measurable: '2 livres par mois en moyenne',
    deadline: addDays(today, 160),
    progress: 46,
    category: 'Développement',
    milestones: [
      { id: 'g2m1', label: '6 livres lus', done: true },
      { id: 'g2m2', label: '12 livres lus', done: false },
      { id: 'g2m3', label: '18 livres lus', done: false },
    ],
  },
  {
    id: 'g3',
    title: 'Courir 5 km sans pause',
    specific: 'Programme progressif 3x/semaine',
    measurable: '5 km en moins de 30 minutes',
    deadline: addDays(today, 90),
    progress: 35,
    category: 'Santé',
    milestones: [
      { id: 'g3m1', label: 'Courir 2 km', done: true },
      { id: 'g3m2', label: 'Courir 3,5 km', done: false },
      { id: 'g3m3', label: 'Courir 5 km', done: false },
    ],
  },
  {
    id: 'g4',
    title: 'Lancer mon blog tech',
    specific: 'Publier un article de qualité toutes les 2 semaines',
    measurable: '12 articles publiés, 500 visiteurs/mois',
    deadline: addDays(today, 120),
    progress: 20,
    category: 'Carrière',
    milestones: [
      { id: 'g4m1', label: 'Nom de domaine + hébergement', done: true },
      { id: 'g4m2', label: '3 articles publiés', done: false },
      { id: 'g4m3', label: 'Newsletter à 100 abonnés', done: false },
    ],
  },
];

// ── Événements calendrier ────────────────────────────────────
const events: CalendarEvent[] = [
  { id: 'e1', date: dayIn(0), time: '10:00', title: 'Réunion client – démo projet', note: 'Préparer la maquette', color: '#495057' },
  { id: 'e2', date: dayIn(0), time: '19:00', title: 'Sport – séance course', color: '#5f7d6a' },
  { id: 'e3', date: dayIn(2), time: '09:30', title: 'Rendez-vous banque', note: 'Négocier les frais', color: '#5b7388' },
  { id: 'e4', date: dayIn(3), time: '18:00', title: 'Dîner avec la famille', color: '#868e96' },
  { id: 'e5', date: dayIn(5), title: 'Deadline devis client Y', color: '#6c757d' },
  { id: 'e6', date: dayIn(7), time: '08:00', title: 'Trail du dimanche', color: '#5f7d6a' },
  { id: 'e7', date: dayIn(10), time: '14:00', title: 'Dentiste', color: '#9aa5ad' },
  { id: 'e8', date: dayIn(-2), time: '11:00', title: 'Stand-up équipe', color: '#495057' },
];

// ── Objectifs d'épargne ──────────────────────────────────────
const savingsGoals: SavingsGoal[] = [
  { id: 's1', name: 'Fonds d\'urgence', target: 60000, saved: 42000, deadline: addDays(today, 365), color: '#495057' },
  { id: 's2', name: 'Nouvel ordinateur', target: 20000, saved: 8000, deadline: addDays(today, 180), color: '#6c757d' },
  { id: 's3', name: 'Voyage au Japon', target: 35000, saved: 12400, deadline: addDays(today, 300), color: '#5b7388' },
];

// ── Investissements (mock) ───────────────────────────────────
const investments: Investment[] = [
  { id: 'i1', name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', amount: 18500, changePct: 12.4 },
  { id: 'i2', name: 'TotalEnergies', symbol: 'TTE', type: 'stock', amount: 9600, changePct: 5.1 },
  { id: 'i3', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', amount: 12300, changePct: 28.6 },
  { id: 'i4', name: 'Ethereum', symbol: 'ETH', type: 'crypto', amount: 6800, changePct: -4.2 },
  { id: 'i5', name: 'Studio locatif', symbol: 'IMMO', type: 'realestate', amount: 250000, changePct: 3.8 },
  { id: 'i6', name: 'Livret A', symbol: 'CASH', type: 'cash', amount: 20000, changePct: 2.0 },
];

// ── Layout initial de la grille (12 colonnes) ────────────────
const layout = [
  { i: 'clock', x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 4 },
  { i: 'weather', x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 4 },
  { i: 'finance', x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 4 },
  { i: 'tasks', x: 0, y: 4, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'calendar', x: 4, y: 4, w: 4, h: 9, minW: 3, minH: 8 },
  { i: 'budget', x: 8, y: 4, w: 4, h: 9, minW: 3, minH: 8 },
  { i: 'pomodoro', x: 0, y: 12, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'habits', x: 4, y: 13, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'goals', x: 8, y: 13, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'notes', x: 0, y: 18, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'journal', x: 4, y: 19, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'savings', x: 8, y: 19, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'investments', x: 0, y: 26, w: 6, h: 7, minW: 4, minH: 6 },
  { i: 'loan', x: 6, y: 26, w: 6, h: 7, minW: 4, minH: 6 },
  { i: 'premium', x: 0, y: 33, w: 12, h: 5, minW: 4, minH: 5 },
];

export const initialState: AppState = {
  version: 1,
  settings: {
    lang: 'fr',
    currency: 'MAD',
    dateFormat: 'ddmmyyyy',
    timezone: 'Africa/Casablanca',
    theme: 'light',
    accent: 'smoke',
    density: 'comfortable',
    notifications: true,
    budgetAlerts: true,
    coachMode: true,
    lockEnabled: false,
    pin: null,
    hourFormat: '24',
    decimalSep: ',',
    hideAmounts: false,
    journalProtected: false,
    budgetWarningThreshold: 80,
    coachFreq: 'daily',
    coachTime: '09:00',
    weeklySummaryDay: 'sunday',
    animations: { page: true, cards: true, counters: true, smoke: true, parallax: true },
    firstDayOfWeek: 'monday',
  },
  profile,
  tasks,
  notes,
  habits,
  journal,
  goals,
  events,
  transactions,
  budget,
  savingsGoals,
  investments,
  chatHistory: [],
  layout,
  hidden: {},
};

// ═════════════════════════════════════════════════════════════
// Slices pour les stores Zustand (v2)
// ═════════════════════════════════════════════════════════════

export const initialSettingsSlice = {
  settings: { ...initialState.settings },
  profile: { ...initialState.profile },
};

export const initialDashboardSlice = {
  layout: initialState.layout.map((l) => ({ ...l })),
  hidden: {} as Record<string, boolean>,
};

export const initialFinanceSlice = {
  transactions: transactions.map((t) => ({ ...t })),
  budget: budget.map((b) => ({ ...b })),
  savingsGoals: savingsGoals.map((g) => ({ ...g })),
  investments: investments.map((i) => ({ ...i })),
};

export const initialPersonalSlice = {
  tasks: tasks.map((t) => ({ ...t, subtasks: t.subtasks.map((s) => ({ ...s })) })),
  notes: notes.map((n) => ({ ...n })),
  habits: habits.map((h) => ({ ...h, days: { ...h.days }, missed: { ...h.missed } })),
  journal: journal.map((j) => ({ ...j })),
  goals: goals.map((g) => ({ ...g, milestones: g.milestones.map((m) => ({ ...m })) })),
  events: events.map((e) => ({ ...e })),
};

export const initialChatSlice = {
  messages: initialState.chatHistory,
  unreadCount: 0,
  coachLastAt: null as string | null,
};

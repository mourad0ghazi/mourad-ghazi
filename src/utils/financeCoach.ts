import { useFinancePlanningStore } from '../store/financePlanningStore'
import { monthTransactions, useFinanceStore } from '../store/financeStore'
import { usePersonalStore } from '../store/personalStore'
import { useSettingsStore } from '../store/settingsStore'
import { currencyFormatOptions } from './formatting'
import { formatCurrency } from './helpers'

export type FinanceCoachTone = 'simple' | 'direct' | 'fun'

export interface FinanceCoachContext {
  firstName: string
  currency: string
  income: number
  expenses: number
  balance: number
  averageIncome: number
  averageExpenses: number
  referenceIncome: number
  essentials: number
  lifestyle: number
  availableCapacity: number
  savingsRate: number
  debtPayments: number
  debtRatio: number
  emergencySavings: number
  emergencyTarget: number
  emergencyMonths: number
  totalSavings: number
  savingsTarget: number
  investmentsValue: number
  investmentsGain: number
  householdSize: number
  dependents: number
  incomeStability: string
  riskTolerance: string
  financeTasks: string[]
  personalGoals: string[]
  topCategories: { name: string; amount: number }[]
  budgetRisks: { name: string; spent: number; planned: number; percent: number }[]
  project: {
    name: string
    cost: number
    downPayment: number
    gap: number
    months: number
    rate: number
    estimatedPayment: number
    comfortablePayment: number
  }
  dataSources: string[]
  healthScore: number
  money: (value: number) => string
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const monthKey = (value: string) => value.slice(0, 7)
const loanPayment = (principal: number, annualRate: number, months: number) => {
  if (principal <= 0) return 0
  const duration = Math.max(1, months)
  const rate = Math.max(0, annualRate) / 1200
  return rate === 0 ? principal / duration : principal * rate / (1 - Math.pow(1 + rate, -duration))
}

export function buildFinanceCoachContext(now = new Date()): FinanceCoachContext {
  const finance = useFinanceStore.getState()
  const planning = useFinancePlanningStore.getState().profile
  const personal = usePersonalStore.getState()
  const settings = useSettingsStore.getState()
  const monthly = monthTransactions(finance.transactions, now)
  const income = sum(monthly.filter((item) => item.type === 'income').map((item) => item.amount))
  const expenses = sum(monthly.filter((item) => item.type === 'expense').map((item) => item.amount))
  const recentKeys = Array.from({ length: 3 }, (_, index) => {
    const value = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`
  })
  const recent = recentKeys.map((key) => {
    const values = finance.transactions.filter((item) => monthKey(item.date) === key)
    return {
      income: sum(values.filter((item) => item.type === 'income').map((item) => item.amount)),
      expenses: sum(values.filter((item) => item.type === 'expense').map((item) => item.amount)),
    }
  }).filter((item) => item.income > 0 || item.expenses > 0)
  const averageIncome = recent.length ? sum(recent.map((item) => item.income)) / recent.length : income
  const averageExpenses = recent.length ? sum(recent.map((item) => item.expenses)) / recent.length : expenses
  const declaredIncome = planning.situation.netSalary + planning.situation.otherIncome + planning.situation.householdContribution
  const essentials = sum(Object.values(planning.essentials))
  const lifestyle = sum(Object.values(planning.lifestyle).filter((value): value is number => typeof value === 'number'))
  const referenceIncome = declaredIncome || averageIncome || income
  const declaredOutflow = essentials + lifestyle
  const referenceOutflow = declaredOutflow > 0 ? Math.max(declaredOutflow, averageExpenses) : averageExpenses
  const declaredCapacity = declaredIncome > 0 ? declaredIncome - referenceOutflow : averageIncome - averageExpenses
  const availableCapacity = Number.isFinite(declaredCapacity) ? declaredCapacity : income - expenses
  const savingsRate = referenceIncome > 0 ? availableCapacity / referenceIncome * 100 : 0
  const categories = new Map<string, number>()
  monthly.filter((item) => item.type === 'expense').forEach((item) => categories.set(item.category, (categories.get(item.category) ?? 0) + item.amount))
  const topCategories = [...categories].map(([name, amount]) => ({ name, amount })).sort((first, second) => second.amount - first.amount).slice(0, 5)
  const budgetRisks = finance.budgets.map((budget) => {
    const spent = categories.get(budget.category) ?? 0
    return { name: budget.category, spent, planned: budget.planned, percent: budget.planned > 0 ? Math.round(spent / budget.planned * 100) : 0 }
  }).filter((item) => item.percent >= 80).sort((first, second) => second.percent - first.percent)
  const emergencyGoal = finance.savingsGoals.find((goal) => /urgence|emergency|sécurité|securite/i.test(goal.name))
  const emergencySavings = emergencyGoal?.current ?? planning.goals.currentSavings
  const coreMonthlyExpenses = essentials > 0 ? Math.max(essentials, averageExpenses) : averageExpenses
  const emergencyTarget = emergencyGoal?.target ?? coreMonthlyExpenses * Math.max(1, planning.goals.emergencyMonths)
  const emergencyMonths = coreMonthlyExpenses > 0 ? emergencySavings / coreMonthlyExpenses : 0
  const totalSavings = sum(finance.savingsGoals.map((goal) => goal.current))
  const savingsTarget = sum(finance.savingsGoals.map((goal) => goal.target))
  const investmentsValue = sum(finance.investments.map((item) => item.value))
  const investmentsGain = investmentsValue - sum(finance.investments.map((item) => item.invested))
  const financeTasks = personal.tasks.filter((task) => task.status !== 'done' && /finance|budget|épargne|epargne|dette/i.test(`${task.category} ${task.title}`)).map((task) => task.title).slice(0, 3)
  const personalGoals = personal.goals.filter((goal) => goal.progress < 100).map((goal) => goal.title).slice(0, 3)
  const debtPayments = planning.essentials.debtPayments
  const gap = Math.max(0, planning.goals.projectBudget - planning.goals.downPayment)
  const estimatedPayment = loanPayment(gap, planning.goals.estimatedRate, planning.goals.financingMonths)
  const debtRatio = referenceIncome > 0 ? (debtPayments + estimatedPayment) / referenceIncome * 100 : 0
  const capacityBasedPayment = Math.max(0, availableCapacity * (planning.situation.incomeStability === 'variable' || planning.situation.incomeStability === 'seasonal' ? 0.45 : 0.65))
  const comfortablePayment = planning.goals.maxMonthlyPayment > 0 ? Math.min(planning.goals.maxMonthlyPayment, capacityBasedPayment) : capacityBasedPayment
  const dataSources = [
    finance.transactions.length ? `${finance.transactions.length} transactions` : '',
    finance.budgets.length ? `${finance.budgets.length} budgets` : '',
    finance.savingsGoals.length ? `${finance.savingsGoals.length} objectifs d’épargne` : '',
    finance.investments.length ? `${finance.investments.length} placements` : '',
    declaredIncome > 0 || essentials > 0 ? 'questionnaire financier et foyer' : '',
    financeTasks.length || personalGoals.length ? 'tâches et objectifs personnels' : '',
  ].filter(Boolean)
  let healthScore = 50
  if (referenceIncome <= 0) healthScore = 25
  else {
    healthScore += savingsRate >= 20 ? 18 : savingsRate >= 10 ? 10 : savingsRate < 0 ? -25 : 0
    healthScore += emergencyMonths >= 3 ? 15 : emergencyMonths >= 1 ? 6 : -8
    healthScore += debtRatio <= 30 ? 8 : debtRatio > 50 ? -18 : debtRatio > 40 ? -10 : 0
    healthScore -= Math.min(20, budgetRisks.filter((item) => item.percent > 100).length * 6)
  }
  const money = (value: number) => formatCurrency(value, settings.currency, settings.hideAmounts, currencyFormatOptions(settings))
  return {
    firstName: settings.profile.name.split(' ')[0] || 'mon ami', currency: settings.currency,
    income, expenses, balance: income - expenses, averageIncome, averageExpenses, referenceIncome,
    essentials, lifestyle, availableCapacity, savingsRate, debtPayments, debtRatio,
    emergencySavings, emergencyTarget, emergencyMonths, totalSavings, savingsTarget,
    investmentsValue, investmentsGain,
    householdSize: planning.situation.householdSize,
    dependents: planning.situation.dependents,
    incomeStability: planning.situation.incomeStability,
    riskTolerance: planning.goals.riskTolerance,
    financeTasks, personalGoals, topCategories, budgetRisks,
    project: {
      name: planning.goals.goalDetails || planning.goals.primaryGoal || 'votre projet',
      cost: planning.goals.projectBudget,
      downPayment: planning.goals.downPayment,
      gap,
      months: planning.goals.financingMonths,
      rate: planning.goals.estimatedRate,
      estimatedPayment,
      comfortablePayment,
    },
    dataSources, healthScore: Math.max(0, Math.min(100, Math.round(healthScore))), money,
  }
}

const numberFromQuestion = (input: string) => {
  const match = input.match(/\d[\d\s.,]*/)
  if (!match) return 0
  let raw = match[0].replace(/\s/g, '')
  if (raw.includes('.') && raw.includes(',')) {
    raw = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) raw = raw.replace(/\./g, '')
  else raw = raw.replace(',', '.')
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

const introFor = (tone: FinanceCoachTone, seed: number) => {
  const values = tone === 'direct'
    ? ['Je vais droit au chiffre.', 'Réponse franche, sans détour.', 'On regarde les faits.']
    : tone === 'fun'
      ? ['On sort la calculatrice, pas le costume trois-pièces 😄', 'Assieds-toi, le café est virtuel mais les chiffres sont vrais ☕', 'Pas de panique : même les dirhams ont besoin d’un GPS 🧭']
      : ['On va faire très simple.', 'Prenons cela une étape à la fois.', 'Je te l’explique sans jargon.']
  return values[seed % values.length]
}

const simplePlan = (context: FinanceCoachContext) => {
  const safeAmount = Math.max(0, context.availableCapacity)
  const emergencyGap = Math.max(0, context.emergencyTarget - context.emergencySavings)
  const firstSaving = safeAmount > 0 ? Math.max(50, Math.round(safeAmount * 0.5 / 50) * 50) : 0
  const savingStep = firstSaving > 0
    ? `Mets ${context.money(firstSaving)} de côté juste après le prochain revenu${emergencyGap > 0 ? `, d’abord pour combler les ${context.money(emergencyGap)} manquants du coussin de sécurité` : ''}.`
    : 'Ne force pas l’épargne ce mois-ci : ramène d’abord les sorties sous les entrées, même de quelques dirhams.'
  const flexible = context.topCategories.find((item) => !/logement|santé|education|éducation|dette/i.test(item.name))
  return `1. Protège les dépenses obligatoires : environ ${context.money(context.essentials || context.averageExpenses)}.\n2. ${savingStep}\n3. ${flexible ? `Teste une baisse de 10 % sur « ${flexible.name} », soit environ ${context.money(flexible.amount * 0.1)} ce mois-ci.` : 'Note chaque dépense pendant 7 jours pour trouver une petite fuite sans te priver de tout.'}`
}

export function createFinanceCoachAnswer(input: string, tone: FinanceCoachTone = 'simple', now = new Date()) {
  const context = buildFinanceCoachContext(now)
  const q = input.toLocaleLowerCase('fr-FR')
  const intro = introFor(tone, input.length + now.getDate())
  const top = context.topCategories[0]
  const amount = numberFromQuestion(q)
  const project = context.project
  const householdNote = context.householdSize > 1 ? ` pour ton foyer de ${context.householdSize} personnes${context.dependents ? `, dont ${context.dependents} à charge` : ''}` : ''
  const riskLabel = ({ cautious: 'prudent', balanced: 'équilibré', dynamic: 'dynamique' } as Record<string, string>)[context.riskTolerance]

  if (/bonjour|bonsoir|salut|salam|hello|ça va|ca va/.test(q)) {
    return `${intro}\n\nSalut ${context.firstName}. Je connais déjà tes transactions, budgets, objectifs d’épargne, placements et les réponses de tes Paramètres de finance. Je ne te jugerai jamais sur ton revenu. Mon travail : rendre l’argent compréhensible et te donner une prochaine action réaliste.\n\nCe mois-ci : ${context.money(context.income)} reçus, ${context.money(context.expenses)} dépensés, donc ${context.money(context.balance)} de différence. Qu’est-ce qui te préoccupe le plus ?`
  }

  if (/taquine|roast|moque|rire|amus|blague/.test(q)) {
    if (!top) return `${intro}\n\nTes dépenses jouent à cache-cache… et pour une fois elles gagnent, car je n’ai pas encore assez de transactions 😄 Ajoute quelques dépenses et reviens me demander de les taquiner.`
    const second = context.topCategories[1]
    return `${intro}\n\nTon argent semble avoir pris un abonnement VIP chez « ${top.name} » : ${context.money(top.amount)} ce mois-ci. ${second ? `« ${second.name} » essaie de monter sur le podium avec ${context.money(second.amount)}.` : ''}\n\nLa blague s’arrête là, la honte aussi. Action adulte : choisis seulement UNE dépense flexible et baisse-la de 10 %. Pas besoin de vivre de pain sec pour reprendre le contrôle.`
  }

  if (amount > 0 && /acheter|achat|payer|offrir|permettre|peux.*prendre|dépenser|depenser/.test(q) && !/dette|crédit|credit|prêt|pret|rembours/.test(q)) {
    const afterPurchase = context.balance - amount
    const safe = context.availableCapacity > 0 && amount <= context.availableCapacity * 0.5 && afterPurchase >= 0
    return `${intro}\n\nTu parles d’un achat de ${context.money(amount)}. Ta marge calculée est d’environ ${context.money(context.availableCapacity)} par mois et ton solde du mois après cet achat serait ${context.money(afterPurchase)}.\n\n${safe ? 'Feu orange-vert : le montant semble absorbable, à condition de ne pas toucher au coussin d’urgence.' : 'Feu orange-rouge : cet achat mangerait trop de marge maintenant. Je le découperais en objectif d’épargne plutôt qu’en dette.'}\n\nTest des 3 questions : est-ce nécessaire ? peux-tu le payer sans crédit ? restera-t-il de quoi couvrir les obligations et un imprévu ? Si une réponse est non, attends 48 heures.`
  }

  if (/crédit|credit|prêt|pret|financ|mensual|projet|voiture|maison|immobilier/.test(q) && !/dette|endett|rembours|à découvert|decouvert/.test(q)) {
    if (project.cost <= 0) return `${intro}\n\nPour calculer un financement sérieux, il me manque le coût du projet, l’apport, la durée et le taux. Remplis-les dans « Paramètres de finance ». Ensuite je comparerai la mensualité à ta vraie marge, pas à ce qu’une publicité promet.`
    const verdict = project.gap === 0 ? 'Tu peux théoriquement autofinancer le projet.' : project.estimatedPayment <= project.comfortablePayment && context.debtRatio <= 40 ? 'Le financement paraît respirable avec les informations actuelles.' : project.estimatedPayment <= Math.max(0, context.availableCapacity) ? 'C’est possible, mais la marge serait serrée.' : 'La mensualité est trop lourde pour ta marge actuelle.'
    const adjustment = Math.max(0, project.estimatedPayment - project.comfortablePayment)
    return `${intro}\n\nProjet : ${project.name}. Coût ${context.money(project.cost)}, apport ${context.money(project.downPayment)}, besoin à financer ${context.money(project.gap)}. À ${project.rate}% sur ${project.months} mois, la mensualité estimée est ${context.money(project.estimatedPayment)}. Ta zone confortable est proche de ${context.money(project.comfortablePayment)}.\n\nVerdict : ${verdict}${adjustment > 0 ? ` Il faut réduire la mensualité d’environ ${context.money(adjustment)} : plus d’apport, projet moins cher ou durée revue.` : ''}\n\nRègle de vieux routier : une banque vérifie si tu peux payer. Moi, je vérifie si tu peux encore dormir après avoir payé.`
  }

  if (/dette|endett|rembours|à découvert|decouvert/.test(q)) {
    const ratio = Math.round(context.referenceIncome > 0 ? context.debtPayments / context.referenceIncome * 100 : 0)
    return `${intro}\n\nTes remboursements déclarés sont ${context.money(context.debtPayments)} par mois, soit environ ${ratio}% du revenu de référence.\n\nPlan sans magie : paie tous les minimums, garde un petit coussin d’urgence, puis attaque UNE dette à la fois. Pour économiser le plus, commence par le taux le plus élevé. Pour garder la motivation, commence par le plus petit solde. Les deux méthodes sont dignes : choisis celle que tu tiendras vraiment.`
  }

  if (/épargne|epargne|urgence|économ|econom|mettre.*côté|mettre.*cote/.test(q)) {
    const progress = context.savingsTarget > 0 ? Math.round(context.totalSavings / context.savingsTarget * 100) : 0
    const savingAdvice = context.availableCapacity > 0
      ? `Ta marge estimée est ${context.money(context.availableCapacity)} : commence par en automatiser environ la moitié.`
      : `Ta marge estimée est ${context.money(context.availableCapacity)} : ne te culpabilise pas de ne pas épargner tout de suite, cherche d’abord un petit équilibre positif.`
    return `${intro}\n\nTu as ${context.money(context.totalSavings)} répartis dans tes objectifs, soit ${progress}% des cibles enregistrées. Ton coussin d’urgence représente ${context.emergencyMonths.toFixed(1)} mois de dépenses essentielles${householdNote}${context.emergencyTarget > 0 ? `, avec une cible de ${context.money(context.emergencyTarget)}` : ''}.\n\nOrdre simple : 1 mois de sécurité d’abord, puis 3 mois, ensuite les projets et l’investissement. ${savingAdvice} Petit et régulier bat grand et occasionnel.`
  }

  if (/invest|placement|action|crypto|bitcoin|bourse|etf|rendement/.test(q)) {
    return `${intro}\n\nTes placements valent environ ${context.money(context.investmentsValue)}, avec une différence globale de ${context.money(context.investmentsGain)} par rapport aux montants investis.${riskLabel ? ` Ton profil déclaré est « ${riskLabel} » : le niveau de risque doit rester cohérent avec lui.` : ''}\n\nVersion simple : n’investis pas l’argent du loyer, des dettes proches ou du fonds d’urgence. Diversifie, garde des frais bas et pense en années. Une hausse passée n’est pas une promesse. Je peux t’aider à mesurer la place de chaque catégorie, mais pas te promettre quel actif va gagner.`
  }

  if (/budget|dépense|depense|argent.*part|où.*argent|ou.*argent|solde|revenu|analyse/.test(q) && !/plan|priorité|priorite|commenc|que faire|petit revenu|fin de mois/.test(q)) {
    const risks = context.budgetRisks.slice(0, 2).map((item) => `${item.name} à ${item.percent}%`).join(', ')
    return `${intro}\n\nLe calcul de base : revenus ${context.money(context.income)} − dépenses ${context.money(context.expenses)} = ${context.money(context.balance)} ce mois-ci. ${top ? `La plus grosse catégorie est « ${top.name} » avec ${context.money(top.amount)}.` : 'Il manque des dépenses catégorisées pour voir où part l’argent.'}${risks ? ` À surveiller : ${risks}.` : ''}\n\nImagine trois enveloppes : « obligatoire », « sécurité », « plaisir ». Tu remplis dans cet ordre. Le plaisir reste autorisé — sinon le budget devient une punition et ne dure pas.\n\nAction cette semaine : ${simplePlan(context).split('\n')[2]}`
  }

  if (/plan|priorité|priorite|commenc|que faire|conseil|aide|pauvre|petit revenu|fin de mois/.test(q)) {
    return `${intro}\n\nVoici ton plan de terrain, pas un discours de conférence :\n${simplePlan(context)}${context.financeTasks[0] ? `\n\nLifeOS contient déjà une action liée : « ${context.financeTasks[0]} ». Utilise-la comme rendez-vous concret avec ton budget.` : ''}\n\nTon score de respiration financière est ${context.healthScore}/100. Ce n’est pas une note sur ta valeur humaine : c’est juste un thermomètre pour choisir la prochaine action.`
  }

  return `${intro}\n\nJe peux répondre avec les chiffres déjà présents dans LifeOS. Essaie par exemple : « Où part mon argent ? », « Puis-je acheter 3 000 ? », « Analyse mon financement », « Fais-moi un plan simple » ou même « Taquine mes dépenses ».\n\nPour l’instant, je vois ${context.dataSources.join(', ') || 'très peu de données financières'}. Plus tu complètes tes transactions et Paramètres de finance, plus mon conseil devient précis.`
}

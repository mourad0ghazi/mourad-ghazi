import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  Gauge,
  Home,
  Info,
  Landmark,
  PiggyBank,
  Printer,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  UserRound,
  WalletCards,
} from 'lucide-react'
import {
  monthTransactions,
  useFinancePlanningStore,
  useFinanceStore,
  useSettingsStore,
  useUIStore,
} from '../../store'
import type { FinancePlanningProfile } from '../../store/financePlanningStore'
import type { Transaction } from '../../types'
import { currencyFormatOptions } from '../../utils/formatting'
import { downloadFile, formatCurrency } from '../../utils/helpers'
import { collectLifeOSReportSnapshot, generateLifeOSReport, printLifeOSReport } from '../../utils/reports'
import { Badge, Button, Input, Progress, Select } from '../ui'

const steps = [
  { label: 'Situation', short: 'Profil', icon: UserRound },
  { label: 'Charges essentielles', short: 'Essentiel', icon: Home },
  { label: 'Mode de vie', short: 'Quotidien', icon: ReceiptText },
  { label: 'Projets & financement', short: 'Projets', icon: Target },
  { label: 'Votre analyse', short: 'Analyse', icon: BarChart3 },
]

const essentialFields: { key: keyof FinancePlanningProfile['essentials']; label: string; hint: string }[] = [
  { key: 'housing', label: 'Logement', hint: 'Loyer ou mensualité de crédit immobilier' },
  { key: 'utilities', label: 'Eau, électricité et énergie', hint: 'Moyenne mensuelle des factures' },
  { key: 'groceries', label: 'Courses alimentaires', hint: 'Supermarché, marché et produits ménagers' },
  { key: 'transport', label: 'Transport', hint: 'Carburant, transports publics, entretien' },
  { key: 'communications', label: 'Téléphone et internet', hint: 'Forfaits du foyer' },
  { key: 'health', label: 'Santé', hint: 'Soins, médicaments et consultations' },
  { key: 'insurance', label: 'Assurances', hint: 'Auto, habitation, santé et autres' },
  { key: 'education', label: 'Éducation et formation', hint: 'École, cours et apprentissage' },
  { key: 'debtPayments', label: 'Crédits et dettes', hint: 'Total de vos mensualités actuelles' },
  { key: 'taxes', label: 'Impôts et frais obligatoires', hint: 'Montant mensualisé' },
  { key: 'familySupport', label: 'Soutien familial', hint: 'Aide régulière à vos proches' },
]

const lifestyleFields: { key: keyof Pick<FinancePlanningProfile['lifestyle'], 'restaurants' | 'shopping' | 'leisure' | 'subscriptions' | 'travel' | 'gifts' | 'personalCare' | 'cashWithdrawals' | 'other'>; label: string; hint: string }[] = [
  { key: 'restaurants', label: 'Restaurants et livraisons', hint: 'Repas, cafés et commandes' },
  { key: 'shopping', label: 'Shopping', hint: 'Vêtements, maison et achats plaisir' },
  { key: 'leisure', label: 'Loisirs et sorties', hint: 'Sport, culture et divertissement' },
  { key: 'subscriptions', label: 'Abonnements', hint: 'Streaming, applications et clubs' },
  { key: 'travel', label: 'Voyages et week-ends', hint: 'Budget annuel divisé par 12' },
  { key: 'gifts', label: 'Cadeaux et événements', hint: 'Anniversaires, fêtes et invitations' },
  { key: 'personalCare', label: 'Soins personnels', hint: 'Coiffure, beauté et bien-être' },
  { key: 'cashWithdrawals', label: 'Espèces non catégorisées', hint: 'Retraits dont l’usage est difficile à suivre' },
  { key: 'other', label: 'Autres dépenses variables', hint: 'Toute autre consommation mensuelle' },
]

export interface FinancePlanningAnalysis {
  monthlyIncome: number
  essentialTotal: number
  lifestyleTotal: number
  declaredConsumption: number
  annualConsumption: number
  availableCapacity: number
  savingsRate: number
  observedIncome: number
  observedExpense: number
  emergencyTarget: number
  emergencyCoverageMonths: number
  goalRemaining: number
  monthsToTarget: number
  requiredMonthlySaving: number
  projectCost: number
  financingGap: number
  estimatedPayment: number
  debtRatio: number
  comfortableLimit: number
  feasibility: 'incomplete' | 'self-funded' | 'favorable' | 'adjust' | 'fragile'
}

export function calculateFinancePlanning(profile: FinancePlanningProfile, transactions: Transaction[], now = new Date()): FinancePlanningAnalysis {
  const monthlyIncome = profile.situation.netSalary + profile.situation.otherIncome + profile.situation.householdContribution
  const essentialTotal = Object.values(profile.essentials).reduce((sum, value) => sum + value, 0)
  const lifestyleTotal = lifestyleFields.reduce((sum, field) => sum + profile.lifestyle[field.key], 0)
  const declaredConsumption = essentialTotal + lifestyleTotal
  const availableCapacity = monthlyIncome - declaredConsumption
  const currentTransactions = monthTransactions(transactions, now)
  const observedIncome = currentTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const observedExpense = currentTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const targetTime = profile.goals.targetDate ? new Date(`${profile.goals.targetDate}T12:00:00`).getTime() : 0
  const monthsToTarget = targetTime > now.getTime() ? Math.max(1, Math.ceil((targetTime - now.getTime()) / 2629800000)) : 0
  const goalRemaining = Math.max(0, profile.goals.targetAmount - profile.goals.currentSavings)
  const projectCost = profile.goals.projectBudget
  const financingGap = Math.max(0, projectCost - profile.goals.downPayment)
  const duration = Math.max(1, profile.goals.financingMonths)
  const monthlyRate = Math.max(0, profile.goals.estimatedRate) / 1200
  const estimatedPayment = financingGap === 0
    ? 0
    : monthlyRate === 0
      ? financingGap / duration
      : financingGap * monthlyRate / (1 - Math.pow(1 + monthlyRate, -duration))
  const debtRatio = monthlyIncome > 0 ? (profile.essentials.debtPayments + estimatedPayment) / monthlyIncome * 100 : 0
  const preferenceFactor = profile.goals.riskTolerance === 'cautious' ? 0.5 : profile.goals.riskTolerance === 'dynamic' ? 0.8 : profile.goals.riskTolerance === 'balanced' ? 0.7 : 0.65
  const planningFactor = profile.situation.incomeStability === 'variable' || profile.situation.incomeStability === 'seasonal' ? Math.min(0.5, preferenceFactor) : preferenceFactor
  const comfortableLimit = profile.goals.maxMonthlyPayment > 0
    ? Math.min(profile.goals.maxMonthlyPayment, Math.max(0, availableCapacity))
    : Math.max(0, availableCapacity * planningFactor)
  let feasibility: FinancePlanningAnalysis['feasibility'] = 'incomplete'
  if (monthlyIncome > 0 && projectCost > 0) {
    if (financingGap === 0) feasibility = 'self-funded'
    else if (estimatedPayment <= comfortableLimit && debtRatio <= 40) feasibility = 'favorable'
    else if (estimatedPayment <= Math.max(0, availableCapacity) && debtRatio <= 50) feasibility = 'adjust'
    else feasibility = 'fragile'
  }
  return {
    monthlyIncome,
    essentialTotal,
    lifestyleTotal,
    declaredConsumption,
    annualConsumption: declaredConsumption * 12,
    availableCapacity,
    savingsRate: monthlyIncome > 0 ? availableCapacity / monthlyIncome * 100 : 0,
    observedIncome,
    observedExpense,
    emergencyTarget: essentialTotal * profile.goals.emergencyMonths,
    emergencyCoverageMonths: essentialTotal > 0 ? profile.goals.currentSavings / essentialTotal : 0,
    goalRemaining,
    monthsToTarget,
    requiredMonthlySaving: monthsToTarget > 0 ? goalRemaining / monthsToTarget : 0,
    projectCost,
    financingGap,
    estimatedPayment,
    debtRatio,
    comfortableLimit,
    feasibility,
  }
}

export function FinanceSettingsPage() {
  const profile = useFinancePlanningStore((state) => state.profile)
  const currentStep = useFinancePlanningStore((state) => state.currentStep)
  const completedSteps = useFinancePlanningStore((state) => state.completedSteps)
  const updateSection = useFinancePlanningStore((state) => state.updateSection)
  const setCurrentStep = useFinancePlanningStore((state) => state.setCurrentStep)
  const completeStep = useFinancePlanningStore((state) => state.completeStep)
  const reset = useFinancePlanningStore((state) => state.reset)
  const transactions = useFinanceStore((state) => state.transactions)
  const settings = useSettingsStore()
  const showToast = useUIStore((state) => state.showToast)
  const analysis = useMemo(() => calculateFinancePlanning(profile, transactions), [profile, transactions])
  const money = (value: number) => formatCurrency(value, settings.currency, settings.hideAmounts, currencyFormatOptions(settings))
  const completion = profileCompletion(profile)

  const goNext = () => {
    completeStep(currentStep)
    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const exportProfile = () => {
    const data = { exportedAt: new Date().toISOString(), type: 'lifeos-finance-settings', version: 1, profile, analysis }
    downloadFile(`lifeos-parametres-finance-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json')
    showToast('Analyse financière exportée')
  }
  const printReport = () => {
    const to = new Date().toISOString().slice(0, 10)
    const report = generateLifeOSReport(collectLifeOSReportSnapshot(), { scope: 'planning', from: `${to.slice(0, 4)}-01-01`, to, includeDetails: true })
    if (!printLifeOSReport(report)) showToast('Fenêtre bloquée : autorisez les fenêtres contextuelles pour imprimer le rapport')
  }
  const resetProfile = () => {
    if (confirm('Effacer toutes les réponses de vos paramètres de finance ?')) {
      reset()
      showToast('Questionnaire réinitialisé')
    }
  }

  return <motion.div className="page finance-settings-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="page-heading finance-planning-heading">
      <div><span className="eyebrow"><Sparkles size={14}/> PLANIFICATION PERSONNELLE</span><h1>Paramètres de finance</h1><p>Décrivez votre réalité, mesurez ce que vous consommez et transformez vos projets en trajectoire concrète.</p></div>
      <div className="page-actions finance-planning-actions"><Badge tone="success"><ShieldCheck size={12}/> PRIVÉ & LOCAL</Badge><Button variant="secondary" onClick={exportProfile}><Download size={16}/>Exporter</Button><Button variant="ghost" onClick={printReport}><Printer size={16}/>Imprimer le rapport</Button></div>
    </div>

    <section className="finance-privacy-note"><ShieldCheck size={20}/><span><b>Vos réponses ne quittent pas cet appareil.</b><small>Enregistrement automatique dans votre navigateur. Aucun compte bancaire ni service payant n’est requis.</small></span><span className="autosave-status"><CheckCircle2 size={14}/>Enregistré</span></section>

    <nav className="finance-stepper" aria-label="Étapes du questionnaire">
      {steps.map((step, index) => <button key={step.label} className={`${currentStep === index ? 'active' : ''} ${completedSteps.includes(index) || currentStep > index ? 'done' : ''}`} onClick={() => setCurrentStep(index)} aria-current={currentStep === index ? 'step' : undefined}><span>{completedSteps.includes(index) || currentStep > index ? <Check size={16}/> : <step.icon size={17}/>}</span><b>{step.label}</b><small>{step.short}</small></button>)}
    </nav>

    <div className="finance-questionnaire-shell">
      <main className="finance-questionnaire-card">
        {currentStep === 0 && <SituationStep profile={profile} update={updateSection}/>}
        {currentStep === 1 && <EssentialsStep profile={profile} update={updateSection} currency={settings.currency}/>}
        {currentStep === 2 && <LifestyleStep profile={profile} update={updateSection} currency={settings.currency}/>}
        {currentStep === 3 && <GoalsStep profile={profile} update={updateSection} currency={settings.currency}/>}
        {currentStep === 4 && <AnalysisStep profile={profile} analysis={analysis} money={money}/>}
        <footer className="finance-step-actions">
          <Button variant="ghost" onClick={goBack} disabled={currentStep === 0}><ArrowLeft size={16}/>Précédent</Button>
          <span>Étape {currentStep + 1} sur {steps.length}</span>
          {currentStep < steps.length - 1
            ? <Button onClick={goNext}>{currentStep === 3 ? 'Voir mon analyse' : 'Continuer'}<ArrowRight size={16}/></Button>
            : <Button variant="secondary" onClick={exportProfile}><Download size={16}/>Conserver une copie</Button>}
        </footer>
      </main>

      <aside className="finance-live-summary">
        <header><span><Gauge size={18}/></span><div><b>Vue instantanée</b><small>Mise à jour avec vos réponses</small></div></header>
        <div className="finance-completion"><span><b>Profil essentiel</b><em>{completion}%</em></span><Progress value={completion} label="Progression du profil financier"/></div>
        <div className="live-money-row"><span>Revenus mensuels</span><strong>{money(analysis.monthlyIncome)}</strong></div>
        <div className="live-money-row"><span>Consommation déclarée</span><strong>{money(analysis.declaredConsumption)}</strong></div>
        <div className={`live-capacity ${analysis.availableCapacity < 0 ? 'negative' : ''}`}><small>Capacité restante estimée</small><strong>{money(analysis.availableCapacity)}</strong><span>{analysis.monthlyIncome > 0 ? `${Math.round(analysis.savingsRate)} % des revenus` : 'Ajoutez vos revenus'}</span></div>
        <div className="live-breakdown"><span><i style={{ width: `${share(analysis.essentialTotal, analysis.declaredConsumption)}%` }}/></span><div><small>Essentiel</small><b>{money(analysis.essentialTotal)}</b></div><div><small>Mode de vie</small><b>{money(analysis.lifestyleTotal)}</b></div></div>
        <p><Info size={14}/>Les calculs sont indicatifs et ne constituent pas une offre de crédit ni un conseil réglementé.</p>
        <Button variant="ghost" size="sm" onClick={resetProfile}><RotateCcw size={14}/>Recommencer</Button>
      </aside>
    </div>
  </motion.div>
}

function SituationStep({ profile, update }: StepProps) {
  const section = profile.situation
  return <StepSection icon={<UserRound/>} eyebrow="01 · VOTRE SITUATION" title="Commençons par l’argent disponible." description="Répondez selon un mois moyen, avec les montants réellement utilisables après impôts.">
    <QuestionGroup title="Vos revenus mensuels" icon={<Banknote/>} description="Additionnez uniquement les revenus dont vous pouvez effectivement disposer.">
      <div className="finance-fields-grid">
        <MoneyField label="Revenu net principal" hint="Salaire, pension ou revenu professionnel" value={section.netSalary} onChange={(netSalary) => update('situation', { netSalary })}/>
        <MoneyField label="Autres revenus personnels" hint="Freelance, location, primes mensualisées…" value={section.otherIncome} onChange={(otherIncome) => update('situation', { otherIncome })}/>
        <MoneyField label="Contribution des autres membres" hint="Part versée au budget commun du foyer" value={section.householdContribution} onChange={(householdContribution) => update('situation', { householdContribution })}/>
      </div>
    </QuestionGroup>
    <QuestionGroup title="Votre foyer et votre stabilité" icon={<Home/>} description="Ces réponses donnent du contexte à votre capacité financière.">
      <div className="finance-fields-grid">
        <SelectField label="Votre situation professionnelle" value={section.employmentStatus} onChange={(value) => update('situation', { employmentStatus: value as FinancePlanningProfile['situation']['employmentStatus'] })} options={[['', 'Choisir…'], ['employee', 'Salarié(e)'], ['self-employed', 'Indépendant(e) / entrepreneur'], ['student', 'Étudiant(e)'], ['retired', 'Retraité(e)'], ['unemployed', 'Sans emploi actuellement'], ['other', 'Autre']]}/>
        <SelectField label="La régularité de vos revenus" value={section.incomeStability} onChange={(value) => update('situation', { incomeStability: value as FinancePlanningProfile['situation']['incomeStability'] })} options={[['', 'Choisir…'], ['stable', 'Stable'], ['variable', 'Variable'], ['seasonal', 'Saisonnier / irrégulier']]}/>
        <SelectField label="Votre rythme de paiement" value={section.payFrequency} onChange={(value) => update('situation', { payFrequency: value as FinancePlanningProfile['situation']['payFrequency'] })} options={[['', 'Choisir…'], ['monthly', 'Mensuel'], ['weekly', 'Hebdomadaire'], ['irregular', 'Irrégulier']]}/>
        <SelectField label="Votre situation de logement" value={section.housingStatus} onChange={(value) => update('situation', { housingStatus: value as FinancePlanningProfile['situation']['housingStatus'] })} options={[['', 'Choisir…'], ['tenant', 'Locataire'], ['owner-loan', 'Propriétaire avec crédit'], ['owner', 'Propriétaire sans crédit'], ['family', 'Hébergé(e) / famille'], ['other', 'Autre']]}/>
        <NumberField label="Personnes dans le foyer" hint="Vous compris(e)" value={section.householdSize} min={1} onChange={(householdSize) => update('situation', { householdSize })}/>
        <NumberField label="Personnes financièrement à charge" hint="Enfants ou proches dépendants" value={section.dependents} onChange={(dependents) => update('situation', { dependents })}/>
      </div>
    </QuestionGroup>
  </StepSection>
}

function EssentialsStep({ profile, update, currency }: StepProps & { currency: string }) {
  return <StepSection icon={<Home/>} eyebrow="02 · CHARGES ESSENTIELLES" title="Combien coûte votre vie indispensable ?" description="Saisissez une moyenne mensuelle. Pour une dépense annuelle, divisez son montant par 12.">
    <QuestionGroup title="Nécessités et engagements" icon={<WalletCards/>} description={`Tous les montants sont mensuels et exprimés en ${currency}.`}>
      <div className="finance-fields-grid">{essentialFields.map((field) => <MoneyField key={field.key} label={field.label} hint={field.hint} value={profile.essentials[field.key]} onChange={(value) => update('essentials', { [field.key]: value })}/>)}</div>
    </QuestionGroup>
    <div className="finance-guidance"><Info size={17}/><span><b>Astuce de précision</b>Consultez trois mois de relevés et utilisez leur moyenne. Les mensualités de dette doivent être indiquées ici, tandis qu’un futur financement sera simulé à l’étape 4.</span></div>
  </StepSection>
}

function LifestyleStep({ profile, update, currency }: StepProps & { currency: string }) {
  const section = profile.lifestyle
  return <StepSection icon={<ReceiptText/>} eyebrow="03 · MODE DE VIE" title="Où part l’argent du quotidien ?" description="Il n’y a pas de bonne ou de mauvaise réponse : l’objectif est de rendre votre consommation visible.">
    <QuestionGroup title="Dépenses variables" icon={<ReceiptText/>} description={`Estimez vos habitudes sur un mois normal, en ${currency}.`}>
      <div className="finance-fields-grid">{lifestyleFields.map((field) => <MoneyField key={field.key} label={field.label} hint={field.hint} value={section[field.key]} onChange={(value) => update('lifestyle', { [field.key]: value })}/>)}</div>
    </QuestionGroup>
    <QuestionGroup title="Votre relation aux dépenses" icon={<ClipboardList/>} description="Ces habitudes nous permettent de rendre les pistes d’action plus pertinentes.">
      <div className="finance-fields-grid">
        <SelectField label="À quelle fréquence achetez-vous impulsivement ?" value={section.impulseFrequency} onChange={(value) => update('lifestyle', { impulseFrequency: value as FinancePlanningProfile['lifestyle']['impulseFrequency'] })} options={[['', 'Choisir…'], ['never', 'Jamais'], ['rarely', 'Rarement'], ['sometimes', 'Parfois'], ['often', 'Souvent']]}/>
        <SelectField label="Votre principal déclencheur d’achat" value={section.spendingTrigger} onChange={(value) => update('lifestyle', { spendingTrigger: value as FinancePlanningProfile['lifestyle']['spendingTrigger'] })} options={[['', 'Choisir…'], ['need', 'Un besoin précis'], ['comfort', 'Le confort / plaisir'], ['stress', 'Le stress ou l’émotion'], ['social', 'Les sorties / le groupe'], ['promotions', 'Les promotions'], ['mixed', 'Plusieurs raisons']]}/>
        <SelectField label="Comment gérez-vous votre budget ?" value={section.budgetMethod} onChange={(value) => update('lifestyle', { budgetMethod: value as FinancePlanningProfile['lifestyle']['budgetMethod'] })} options={[['', 'Choisir…'], ['none', 'Aucune méthode'], ['notes', 'Notes ou carnet'], ['spreadsheet', 'Tableur'], ['envelopes', 'Enveloppes / plafonds'], ['application', 'Application']]}/>
        <SelectField label="À quelle fréquence vérifiez-vous vos dépenses ?" value={section.reviewFrequency} onChange={(value) => update('lifestyle', { reviewFrequency: value as FinancePlanningProfile['lifestyle']['reviewFrequency'] })} options={[['', 'Choisir…'], ['never', 'Jamais'], ['daily', 'Chaque jour'], ['weekly', 'Chaque semaine'], ['monthly', 'Chaque mois']]}/>
      </div>
    </QuestionGroup>
  </StepSection>
}

function GoalsStep({ profile, update, currency }: StepProps & { currency: string }) {
  const section = profile.goals
  return <StepSection icon={<Target/>} eyebrow="04 · PROJETS & FINANCEMENT" title="Que voulez-vous rendre possible ?" description="Définissez votre priorité, votre horizon et le niveau d’effort qui reste confortable pour vous.">
    <QuestionGroup title="Votre objectif financier" icon={<Target/>} description="L’objectif peut être constitué sans crédit : réserve, épargne ou apport.">
      <div className="finance-fields-grid">
        <SelectField label="Votre objectif principal" value={section.primaryGoal} onChange={(value) => update('goals', { primaryGoal: value as FinancePlanningProfile['goals']['primaryGoal'] })} options={[['', 'Choisir…'], ['emergency', 'Créer une réserve d’urgence'], ['debt', 'Rembourser mes dettes'], ['home', 'Acheter un logement'], ['vehicle', 'Acheter un véhicule'], ['education', 'Financer une formation'], ['business', 'Lancer une activité'], ['travel', 'Voyager'], ['retirement', 'Préparer ma retraite'], ['other', 'Autre projet']]}/>
        <TextField label="Décrivez ce que vous voulez accomplir" value={section.goalDetails} placeholder="Ex. Constituer l’apport de mon premier logement" onChange={(goalDetails) => update('goals', { goalDetails })}/>
        <MoneyField label="Montant cible d’épargne" hint={`Montant total visé en ${currency}`} value={section.targetAmount} onChange={(targetAmount) => update('goals', { targetAmount })}/>
        <MoneyField label="Épargne déjà disponible" hint="Réserve mobilisable aujourd’hui" value={section.currentSavings} onChange={(currentSavings) => update('goals', { currentSavings })}/>
        <DateField label="Date cible" value={section.targetDate} onChange={(targetDate) => update('goals', { targetDate })}/>
        <NumberField label="Réserve d’urgence souhaitée" hint="En mois de charges essentielles" value={section.emergencyMonths} min={0} max={24} onChange={(emergencyMonths) => update('goals', { emergencyMonths })}/>
        <SelectField label="Votre priorité actuelle" value={section.priority} onChange={(value) => update('goals', { priority: value as FinancePlanningProfile['goals']['priority'] })} options={[['', 'Choisir…'], ['security', 'Sécuriser mon foyer'], ['reduce-spending', 'Réduire ma consommation'], ['save', 'Épargner régulièrement'], ['invest', 'Investir à long terme'], ['finance-project', 'Financer un projet']]}/>
        <TextField label="Quelle dépense aimeriez-vous réduire ?" value={section.reduceCategory} placeholder="Ex. Restaurants, abonnements…" onChange={(reduceCategory) => update('goals', { reduceCategory })}/>
      </div>
    </QuestionGroup>
    <QuestionGroup title="Projet nécessitant un financement" icon={<Landmark/>} description="Facultatif. Ces réponses produisent une estimation, jamais une offre de crédit.">
      <div className="finance-fields-grid">
        <MoneyField label="Coût total du projet" hint="Prix ou enveloppe globale" value={section.projectBudget} onChange={(projectBudget) => update('goals', { projectBudget })}/>
        <MoneyField label="Apport prévu" hint="Somme que vous engagez dans le projet" value={section.downPayment} onChange={(downPayment) => update('goals', { downPayment })}/>
        <NumberField label="Durée de financement" hint="Nombre de mois envisagé" value={section.financingMonths} min={1} max={480} onChange={(financingMonths) => update('goals', { financingMonths })}/>
        <NumberField label="Taux indicatif annuel" hint="En %, hors assurance et frais" value={section.estimatedRate} min={0} max={100} step={0.1} onChange={(estimatedRate) => update('goals', { estimatedRate })}/>
        <MoneyField label="Mensualité maximale confortable" hint="Votre propre limite, sans vous mettre sous pression" value={section.maxMonthlyPayment} onChange={(maxMonthlyPayment) => update('goals', { maxMonthlyPayment })}/>
        <SelectField label="Votre préférence face au risque" value={section.riskTolerance} onChange={(value) => update('goals', { riskTolerance: value as FinancePlanningProfile['goals']['riskTolerance'] })} options={[['', 'Choisir…'], ['cautious', 'Prudente — priorité à la sécurité'], ['balanced', 'Équilibrée — stabilité et progression'], ['dynamic', 'Dynamique — j’accepte plus de variation']]}/>
      </div>
      <label className="finance-notes"><span><b>Contexte ou contraintes à retenir</b><small>Revenus futurs, échéances, engagements familiaux, marge de sécurité…</small></span><textarea className="input" rows={4} value={section.notes} onChange={(event) => update('goals', { notes: event.target.value })} placeholder="Ajoutez ici ce qui est important pour votre décision."/></label>
    </QuestionGroup>
  </StepSection>
}

function AnalysisStep({ profile, analysis, money }: { profile: FinancePlanningProfile; analysis: FinancePlanningAnalysis; money: (value: number) => string }) {
  const categories = [
    { label: 'Logement', value: profile.essentials.housing },
    { label: 'Alimentation', value: profile.essentials.groceries },
    { label: 'Transport', value: profile.essentials.transport },
    { label: 'Dettes', value: profile.essentials.debtPayments },
    { label: 'Autres nécessités', value: analysis.essentialTotal - profile.essentials.housing - profile.essentials.groceries - profile.essentials.transport - profile.essentials.debtPayments },
    { label: 'Mode de vie', value: analysis.lifestyleTotal },
  ].filter((item) => item.value > 0).sort((a, b) => b.value - a.value)
  const recommendations = buildRecommendations(profile, analysis, money)
  const feasibility = feasibilityContent(analysis.feasibility)
  const observedDelta = analysis.observedExpense - analysis.declaredConsumption

  return <StepSection icon={<BarChart3/>} eyebrow="05 · SYNTHÈSE PERSONNALISÉE" title="Votre argent a maintenant une direction." description="Cette lecture relie vos réponses, les transactions du mois dans LifeOS et le projet que vous avez défini.">
    <div className="analysis-kpi-grid">
      <AnalysisKpi label="Consommation mensuelle" value={money(analysis.declaredConsumption)} hint={`${money(analysis.annualConsumption)} par an`} icon={<ReceiptText/>}/>
      <AnalysisKpi label="Capacité restante" value={money(analysis.availableCapacity)} hint={`${Math.round(analysis.savingsRate)} % des revenus`} icon={<PiggyBank/>} tone={analysis.availableCapacity < 0 ? 'danger' : 'success'}/>
      <AnalysisKpi label="Charges essentielles" value={money(analysis.essentialTotal)} hint={`${Math.round(share(analysis.essentialTotal, analysis.monthlyIncome))} % des revenus`} icon={<Home/>}/>
      <AnalysisKpi label="Dépenses de mode de vie" value={money(analysis.lifestyleTotal)} hint={`${Math.round(share(analysis.lifestyleTotal, analysis.monthlyIncome))} % des revenus`} icon={<WalletCards/>}/>
    </div>

    <div className="analysis-two-columns">
      <section className="analysis-panel"><header><span><BarChart3/></span><div><h3>Déclaré face au mois observé</h3><p>Comparaison avec les transactions actuellement enregistrées dans LifeOS.</p></div></header><ComparisonRow label="Revenus" declared={analysis.monthlyIncome} observed={analysis.observedIncome} money={money}/><ComparisonRow label="Dépenses" declared={analysis.declaredConsumption} observed={analysis.observedExpense} money={money}/>{analysis.observedExpense > 0 && <div className={`comparison-callout ${observedDelta > 0 ? 'warning' : 'success'}`}>{observedDelta > 0 ? <TriangleAlert/> : <CheckCircle2/>}<span><b>{observedDelta > 0 ? `${money(observedDelta)} de plus observés` : `${money(Math.abs(observedDelta))} de moins observés`}</b><small>Affinez vos réponses si cet écart ne correspond pas à un mois exceptionnel.</small></span></div>}</section>
      <section className="analysis-panel"><header><span><ReceiptText/></span><div><h3>Répartition de votre consommation</h3><p>Les postes qui structurent votre mois.</p></div></header><div className="category-breakdown">{categories.length ? categories.map((item) => <div key={item.label}><span><b>{item.label}</b><em>{money(item.value)}</em></span><div><i style={{ width: `${share(item.value, analysis.declaredConsumption)}%` }}/></div></div>) : <p className="analysis-empty">Ajoutez vos dépenses pour afficher la répartition.</p>}</div></section>
    </div>

    <div className="analysis-two-columns">
      <section className="analysis-panel goal-analysis"><header><span><Target/></span><div><h3>Trajectoire vers votre objectif</h3><p>{profile.goals.goalDetails || goalLabel(profile.goals.primaryGoal)}</p></div></header><div className="goal-analysis-grid"><div><small>Montant restant</small><b>{money(analysis.goalRemaining)}</b></div><div><small>Temps disponible</small><b>{analysis.monthsToTarget ? `${analysis.monthsToTarget} mois` : 'À définir'}</b></div><div><small>Effort mensuel requis</small><b>{analysis.monthsToTarget ? money(analysis.requiredMonthlySaving) : 'À définir'}</b></div><div><small>Réserve d’urgence cible</small><b>{money(analysis.emergencyTarget)}</b></div></div>{profile.goals.targetAmount > 0 && <div className="goal-progress"><span><b>Progression actuelle</b><em>{Math.round(Math.min(100, share(profile.goals.currentSavings, profile.goals.targetAmount)))} %</em></span><Progress value={share(profile.goals.currentSavings, profile.goals.targetAmount)} label="Progression vers l’objectif"/></div>}<p className="reserve-line"><ShieldCheck size={15}/>Votre épargne actuelle couvre environ <b>{analysis.emergencyCoverageMonths.toFixed(1)} mois</b> de charges essentielles.</p></section>
      <section className={`analysis-panel financing-analysis ${feasibility.tone}`}><header><span>{feasibility.icon}</span><div><h3>Faisabilité indicative du financement</h3><p>{feasibility.label}</p></div></header>{analysis.projectCost > 0 ? <><div className="financing-main"><small>Mensualité estimée</small><strong>{money(analysis.estimatedPayment)}</strong><span>pour {money(analysis.financingGap)} sur {profile.goals.financingMonths} mois à {profile.goals.estimatedRate.toLocaleString('fr-FR')} %</span></div><div className="financing-stats"><span><small>Limite confortable retenue</small><b>{money(analysis.comfortableLimit)}</b></span><span><small>Endettement indicatif après projet</small><b>{Math.round(analysis.debtRatio)} %</b></span></div><p>{feasibility.text}</p></> : <div className="analysis-empty"><Landmark size={25}/><b>Aucun projet financé renseigné</b><span>Indiquez un coût de projet et un apport à l’étape précédente pour obtenir une estimation.</span></div>}</section>
    </div>

    <section className="recommendations-panel"><header><span><Sparkles/></span><div><h3>Vos prochaines actions</h3><p>Des pistes calculées à partir de vos réponses.</p></div></header><ol>{recommendations.map((item, index) => <li key={item.title}><span>{index + 1}</span><div><b>{item.title}</b><p>{item.text}</p></div></li>)}</ol></section>
    <div className="analysis-disclaimer"><Info size={17}/><p><b>À lire avant toute décision.</b> Les projections ne prennent pas en compte tous les frais, assurances, règles d’éligibilité, variations de taux ou événements personnels. Vérifiez toute décision engageante avec un professionnel qualifié.</p></div>
  </StepSection>
}

type StepProps = {
  profile: FinancePlanningProfile
  update: <K extends keyof FinancePlanningProfile>(section: K, patch: Partial<FinancePlanningProfile[K]>) => void
}

function StepSection({ icon, eyebrow, title, description, children }: { icon: React.ReactNode; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <motion.div className="finance-step-content" key={eyebrow} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}><header className="finance-step-heading"><span>{icon}</span><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></header>{children}</motion.div>
}

function QuestionGroup({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="finance-question-group"><header><span>{icon}</span><div><h3>{title}</h3><p>{description}</p></div></header>{children}</section>
}

function MoneyField({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  return <label className="finance-question"><span><b>{label}</b><small>{hint}</small></span><div className="finance-number-input"><Input type="number" min="0" step="0.01" value={value || ''} placeholder="0" onChange={(event) => onChange(toPositiveNumber(event.target.value))}/><Banknote size={15}/></div></label>
}

function NumberField({ label, hint, value, onChange, min = 0, max, step = 1 }: { label: string; hint: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) {
  return <label className="finance-question"><span><b>{label}</b><small>{hint}</small></span><Input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}/></label>
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="finance-question"><span><b>{label}</b></span><Select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</Select></label>
}

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="finance-question"><span><b>{label}</b></span><Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}/></label>
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="finance-question"><span><b>{label}</b><small>Quand souhaitez-vous atteindre ce montant ?</small></span><div className="finance-number-input"><Input type="date" value={value} onChange={(event) => onChange(event.target.value)}/><CalendarClock size={15}/></div></label>
}

function AnalysisKpi({ label, value, hint, icon, tone = '' }: { label: string; value: string; hint: string; icon: React.ReactNode; tone?: string }) {
  return <div className={`analysis-kpi ${tone}`}><span>{icon}</span><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
}

function ComparisonRow({ label, declared, observed, money }: { label: string; declared: number; observed: number; money: (value: number) => string }) {
  const maximum = Math.max(declared, observed, 1)
  return <div className="comparison-row"><div><b>{label}</b><span><small>Déclaré</small><em>{money(declared)}</em></span><span><small>Observé</small><em>{money(observed)}</em></span></div><div className="comparison-bars"><i style={{ width: `${declared / maximum * 100}%` }}/><i style={{ width: `${observed / maximum * 100}%` }}/></div></div>
}

function profileCompletion(profile: FinancePlanningProfile) {
  const checks = [
    profile.situation.netSalary > 0 || profile.situation.otherIncome > 0,
    Boolean(profile.situation.employmentStatus),
    Boolean(profile.situation.incomeStability),
    Boolean(profile.situation.housingStatus),
    profile.situation.householdSize > 0,
    Object.values(profile.essentials).some((value) => value > 0),
    profile.essentials.housing > 0 || profile.situation.housingStatus === 'owner' || profile.situation.housingStatus === 'family',
    lifestyleFields.some((field) => profile.lifestyle[field.key] > 0),
    Boolean(profile.lifestyle.impulseFrequency),
    Boolean(profile.lifestyle.budgetMethod),
    Boolean(profile.lifestyle.reviewFrequency),
    Boolean(profile.goals.primaryGoal),
    profile.goals.targetAmount > 0,
    profile.goals.currentSavings >= 0 && Boolean(profile.goals.targetDate),
    Boolean(profile.goals.priority),
    Boolean(profile.goals.riskTolerance),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function buildRecommendations(profile: FinancePlanningProfile, analysis: FinancePlanningAnalysis, money: (value: number) => string) {
  const items: { title: string; text: string }[] = []
  if (analysis.availableCapacity < 0) items.push({ title: 'Rétablir une marge positive', text: `Votre consommation dépasse vos revenus d’environ ${money(Math.abs(analysis.availableCapacity))} par mois. Commencez par les postes variables les plus élevés avant de prendre un nouvel engagement.` })
  else if (analysis.monthlyIncome > 0) items.push({ title: 'Automatiser votre capacité disponible', text: `Programmez jusqu’à ${money(analysis.availableCapacity)} après réception des revenus, en gardant une marge pour les mois irréguliers.` })
  if (analysis.feasibility === 'fragile' || analysis.feasibility === 'adjust') items.push({ title: 'Réduire la pression du financement', text: 'Augmentez l’apport, réduisez le coût du projet ou comparez une durée différente sans dépasser votre mensualité confortable.' })
  if (analysis.emergencyCoverageMonths < profile.goals.emergencyMonths) items.push({ title: 'Renforcer votre coussin de sécurité', text: `Votre cible de ${profile.goals.emergencyMonths} mois représente ${money(analysis.emergencyTarget)}. Séparez cette réserve de l’apport destiné à un projet.` })
  if (analysis.monthsToTarget > 0 && analysis.requiredMonthlySaving > Math.max(0, analysis.availableCapacity)) items.push({ title: 'Recalibrer la date ou le montant cible', text: `L’effort requis de ${money(analysis.requiredMonthlySaving)} dépasse votre capacité actuelle. Allongez l’horizon, réduisez la cible ou libérez une dépense précise.` })
  if (profile.situation.incomeStability === 'variable' || profile.situation.incomeStability === 'seasonal') items.push({ title: 'Lisser vos revenus irréguliers', text: 'Calculez votre budget sur un revenu mensuel prudent et conservez les bons mois dans un compte tampon avant d’augmenter vos charges fixes.' })
  if (profile.lifestyle.impulseFrequency === 'often' || profile.lifestyle.impulseFrequency === 'sometimes') items.push({ title: 'Créer un délai avant les achats plaisir', text: `Appliquez une attente de 24 à 48 heures et un plafond mensuel${profile.goals.reduceCategory ? ` pour « ${profile.goals.reduceCategory} »` : ''}.` })
  if (profile.lifestyle.budgetMethod === 'none' || profile.lifestyle.reviewFrequency === 'never') items.push({ title: 'Installer un rendez-vous financier court', text: 'Réservez dix minutes chaque semaine pour catégoriser les dépenses, comparer le réel au budget et décider d’un seul ajustement.' })
  if (!items.length) items.push({ title: 'Compléter les montants structurants', text: 'Renseignez revenus, charges, objectif et date cible pour obtenir des actions chiffrées et une estimation de faisabilité.' })
  return items.slice(0, 4)
}

function feasibilityContent(status: FinancePlanningAnalysis['feasibility']) {
  if (status === 'self-funded') return { label: 'Projet couvert par votre apport', text: 'Votre apport déclaré couvre le coût indiqué. Préservez néanmoins une réserve d’urgence séparée.', tone: 'success', icon: <CheckCircle2/> }
  if (status === 'favorable') return { label: 'Compatible avec vos limites déclarées', text: 'La mensualité estimée reste sous votre limite confortable et le ratio indicatif reste modéré.', tone: 'success', icon: <CheckCircle2/> }
  if (status === 'adjust') return { label: 'Possible avec des ajustements', text: 'La marge est étroite. Un apport plus élevé, une enveloppe plus basse ou une durée adaptée peuvent améliorer l’équilibre.', tone: 'warning', icon: <Gauge/> }
  if (status === 'fragile') return { label: 'Pression financière élevée', text: 'La mensualité estimée dépasse votre marge ou porte les engagements à un niveau élevé. Évitez de vous engager sans révision.', tone: 'danger', icon: <TriangleAlert/> }
  return { label: 'Données à compléter', text: 'Renseignez votre projet pour obtenir une première lecture.', tone: 'neutral', icon: <BriefcaseBusiness/> }
}

function goalLabel(goal: FinancePlanningProfile['goals']['primaryGoal']) {
  const labels: Record<FinancePlanningProfile['goals']['primaryGoal'], string> = { '': 'Objectif à définir', emergency: 'Créer une réserve d’urgence', debt: 'Rembourser les dettes', home: 'Acheter un logement', vehicle: 'Acheter un véhicule', education: 'Financer une formation', business: 'Lancer une activité', travel: 'Préparer un voyage', retirement: 'Préparer la retraite', other: 'Autre projet' }
  return labels[goal]
}

function share(value: number, total: number) {
  return total > 0 ? Math.max(0, Math.min(100, value / total * 100)) : 0
}

function toPositiveNumber(value: string) {
  return Math.max(0, Number(value) || 0)
}

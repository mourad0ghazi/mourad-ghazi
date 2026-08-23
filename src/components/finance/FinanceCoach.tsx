import { AnimatePresence, motion } from 'framer-motion'
import { BrainCircuit, Calculator, CircleDollarSign, Database, Gauge, Landmark, PiggyBank, RotateCcw, Send, ShieldCheck, Sparkles, Trash2, UserRound, WalletCards } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFinanceCoachStore, useUIStore } from '../../store'
import type { ChatMessage } from '../../types'
import { buildFinanceCoachContext, createFinanceCoachAnswer, type FinanceCoachTone } from '../../utils/financeCoach'
import { Badge, Button, Progress } from '../ui'

const prompts = [
  { icon: WalletCards, title: 'Où part mon argent ?', text: 'Analyse mes dépenses et explique-moi simplement où part mon argent.' },
  { icon: PiggyBank, title: 'Plan petit revenu', text: 'Fais-moi un plan très simple pour mieux finir le mois avec mon revenu actuel.' },
  { icon: Landmark, title: 'Mes dettes', text: 'Aide-moi à faire un plan réaliste pour rembourser mes dettes.' },
  { icon: Calculator, title: 'Financement', text: 'Analyse mon projet de financement avec les données de LifeOS.' },
  { icon: CircleDollarSign, title: 'Puis-je acheter ?', text: 'Puis-je raisonnablement acheter quelque chose à 3 000 maintenant ?' },
  { icon: Sparkles, title: 'Taquine mes dépenses', text: 'Taquine mes dépenses sans me faire honte, puis donne-moi une action utile.' },
]

const toneOptions: { id: FinanceCoachTone; label: string }[] = [
  { id: 'simple', label: 'Simple' },
  { id: 'direct', label: 'Direct' },
  { id: 'fun', label: 'Complice' },
]

const createId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `coach-${Date.now()}-${Math.random().toString(16).slice(2)}`

export function FinanceCoach() {
  const messages = useFinanceCoachStore((state) => state.messages)
  const tone = useFinanceCoachStore((state) => state.tone)
  const addMessage = useFinanceCoachStore((state) => state.addMessage)
  const clearMessages = useFinanceCoachStore((state) => state.clearMessages)
  const setTone = useFinanceCoachStore((state) => state.setTone)
  const setView = useUIStore((state) => state.setView)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const context = useMemo(() => buildFinanceCoachContext(), [messages.length])
  const conversation = messages.length ? messages : [{
    id: 'finance-coach-welcome', role: 'assistant' as const,
    content: `Bonjour ${context.firstName}. Ici, pas de jugement et pas de mots compliqués. Je m’appuie sur tes vraies données LifeOS pour t’aider à prendre une prochaine décision réaliste.\n\nCe mois-ci, la différence entre tes entrées et tes sorties est ${context.money(context.balance)}. Choisis une question ci-dessous ou raconte-moi ce qui te préoccupe.`,
    timestamp: new Date().toISOString(),
  }]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [conversation.length, typing])

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
  }, [])

  const send = (text = input) => {
    const clean = text.trim()
    if (!clean || typing) return
    const userMessage: ChatMessage = { id: createId(), role: 'user', content: clean, timestamp: new Date().toISOString() }
    addMessage(userMessage)
    setInput('')
    setTyping(true)
    timeoutRef.current = window.setTimeout(() => {
      addMessage({ id: createId(), role: 'assistant', content: createFinanceCoachAnswer(clean, tone), timestamp: new Date().toISOString() })
      setTyping(false)
      timeoutRef.current = null
    }, 520)
  }

  const clear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      window.setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setTyping(false)
    clearMessages()
    setConfirmClear(false)
  }

  const scoreTone = context.healthScore >= 70 ? 'success' : context.healthScore >= 45 ? 'warning' : 'danger'

  return <div className="finance-coach-shell">
    <section className="finance-coach-main" aria-label="Conversation avec le Coach IA Finance">
      <header className="finance-coach-header">
        <span className="finance-coach-avatar"><BrainCircuit size={25} /><i /></span>
        <span>
          <span className="finance-coach-title"><h2>Coach IA Finance</h2><Badge tone="free">100 % gratuit</Badge></span>
          <small>Mentor local • vos données restent dans LifeOS</small>
        </span>
        <div className="finance-coach-tones" aria-label="Style des réponses">
          {toneOptions.map((option) => <button key={option.id} className={tone === option.id ? 'active' : ''} aria-pressed={tone === option.id} onClick={() => setTone(option.id)}>{option.label}</button>)}
        </div>
        <button className={`finance-coach-clear ${confirmClear ? 'confirm' : ''}`} onClick={clear} aria-label={confirmClear ? 'Confirmer la suppression de la conversation' : 'Effacer la conversation'} title={confirmClear ? 'Cliquez encore pour confirmer' : 'Nouvelle conversation'}>
          {confirmClear ? <><Trash2 size={14} /> Confirmer</> : <RotateCcw size={16} />}
        </button>
      </header>

      <div className="finance-coach-trust"><ShieldCheck size={15} /><span><b>Un coach, pas un vendeur.</b> Explications éducatives, sans produit à placer, sans honte et sans promesse magique.</span></div>

      <div className="finance-coach-messages" aria-live="polite">
        <AnimatePresence initial={false}>
          {conversation.map((message) => <motion.article key={message.id} className={`finance-coach-message ${message.role}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span>{message.role === 'assistant' ? <BrainCircuit size={16} /> : <UserRound size={16} />}</span>
            <div><p>{message.content}</p><time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time></div>
          </motion.article>)}
          {typing && <motion.article className="finance-coach-message assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span><BrainCircuit size={16} /></span><div className="finance-coach-thinking"><i /><i /><i /><em>Je relis vos chiffres…</em></div>
          </motion.article>}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="finance-coach-prompts" aria-label="Questions suggérées">
        {prompts.map(({ icon: Icon, title, text }) => <button key={title} onClick={() => send(text)} disabled={typing}><Icon size={14} /><span>{title}</span></button>)}
      </div>

      <form className="finance-coach-composer" onSubmit={(event) => { event.preventDefault(); send() }}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() }
        }} placeholder="Ex. : Est-ce raisonnable d’acheter un téléphone à 3 000 ?" rows={1} aria-label="Votre question financière" />
        <button type="submit" disabled={!input.trim() || typing} aria-label="Envoyer la question"><Send size={18} /></button>
      </form>
      <footer>Conseil éducatif basé sur vos informations LifeOS • Pour une décision juridique, fiscale ou d’investissement importante, vérifiez avec un professionnel qualifié.</footer>
    </section>

    <aside className="finance-coach-context" aria-label="Contexte financier utilisé par le coach">
      <div className="coach-context-heading">
        <span><Gauge size={19} /></span><div><b>Votre respiration financière</b><small>Thermomètre, jamais jugement</small></div><strong>{context.healthScore}<small>/100</small></strong>
      </div>
      <Progress value={context.healthScore} tone={scoreTone} label={`Score de respiration financière ${context.healthScore} sur 100`} />
      <div className="coach-context-grid">
        <div><span>Solde du mois</span><b className={context.balance >= 0 ? 'success' : 'danger'}>{context.money(context.balance)}</b></div>
        <div><span>Marge estimée</span><b>{context.money(context.availableCapacity)}</b></div>
        <div><span>Sécurité</span><b>{context.emergencyMonths.toFixed(1)} mois</b></div>
        <div><span>Dettes + projet</span><b>{Math.round(context.debtRatio)} %</b></div>
      </div>

      <div className="coach-context-section">
        <header><Database size={15} /><b>Ce que j’utilise vraiment</b></header>
        <div className="coach-data-sources">
          {context.dataSources.length ? context.dataSources.map((source) => <span key={source}><i />{source}</span>) : <p>Ajoutez des transactions ou complétez votre profil financier pour personnaliser les réponses.</p>}
        </div>
      </div>

      {context.topCategories.length > 0 && <div className="coach-context-section">
        <header><WalletCards size={15} /><b>Plus grosses sorties ce mois-ci</b></header>
        <ol>{context.topCategories.slice(0, 3).map((category) => <li key={category.name}><span>{category.name}</span><b>{context.money(category.amount)}</b></li>)}</ol>
      </div>}

      <div className="coach-context-section coach-next-action">
        <Sparkles size={18} /><div><b>Conseil plus précis ?</b><p>Les 47 réponses de « Paramètres de finance » aident le coach à comprendre vos charges, dettes et projets.</p></div>
        <Button size="sm" variant="secondary" onClick={() => setView('finance-settings')}>Compléter mes données</Button>
      </div>

      <p className="coach-local-note"><ShieldCheck size={13} /> Les réponses sont calculées localement. Aucun conseiller externe n’est connecté et aucune donnée n’est envoyée par ce coach.</p>
    </aside>
  </div>
}

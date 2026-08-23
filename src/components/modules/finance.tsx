import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Calculator, CircleDollarSign, Download, Landmark, PiggyBank, Plus, ReceiptText, Trash2, TrendingUp, WalletCards } from 'lucide-react'
import { AnimatedNumber, Badge, Button, IconButton, Input, Progress, Widget } from '../ui'
import { monthTransactions, useFinanceStore, useSettingsStore, useUIStore } from '../../store'
import { compoundProjection, loanCalculation } from '../../utils/calculations'
import { daysUntil, downloadFile, formatCurrency, transactionsToCSV } from '../../utils/helpers'
import { useDateFormatter } from '../../utils/formatting'

const chartColors = ['#343a40', '#596168', '#747c83', '#90969b', '#aab0b5', '#c3c8cc', '#737d74', '#988a7d']
const tooltipStyle = { background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-card)', fontSize: 12 }

function useMoney() {
  const currency = useSettingsStore((state) => state.currency)
  const hidden = useSettingsStore((state) => state.hideAmounts)
  const amountDecimals = useSettingsStore((state) => state.amountDecimals)
  const currencyDisplay = useSettingsStore((state) => state.currencyDisplay)
  const language = useSettingsStore((state) => state.language)
  return (value: number) => formatCurrency(value, currency, hidden, { fractionDigits: amountDecimals, currencyDisplay, language })
}

function monthlySeries(transactions: ReturnType<typeof useFinanceStore.getState>['transactions'], language: 'fr' | 'en') {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(); date.setMonth(date.getMonth() - (5 - index))
    const items = monthTransactions(transactions, date)
    const income = items.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = items.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { month: new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', { month: 'short' }).format(date).replace('.', ''), Revenus: income, Dépenses: expense, Épargne: income - expense }
  })
}

export function FinanceSummaryModule({ extended = false }: { extended?: boolean }) {
  const transactions = useFinanceStore((s) => s.transactions)
  const language = useSettingsStore((s) => s.language)
  const money = useMoney(); const current = monthTransactions(transactions)
  const income = current.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = current.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const series = useMemo(() => monthlySeries(transactions, language), [transactions, language])
  return <Widget id="finance" title="Vue financière" icon={<CircleDollarSign size={18} />}>
    <div className="finance-stats"><div><span>Revenus <ArrowUpRight size={14} /></span><strong className="success"><AnimatedNumber value={income} formatter={money} /></strong><small>+8,4% ce mois</small></div><div><span>Dépenses <ArrowDownRight size={14} /></span><strong className="danger"><AnimatedNumber value={expense} formatter={money} /></strong><small>-3,2% ce mois</small></div><div><span>Épargne nette</span><strong><AnimatedNumber value={income - expense} formatter={money} /></strong><small>{income ? Math.round((income - expense) / income * 100) : 0}% des revenus</small></div></div>
    <div className={`chart ${extended ? 'chart-large' : ''}`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{ top: 8, right: 5, bottom: 0, left: -22 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3d8b5c" stopOpacity=".26"/><stop offset="100%" stopColor="#3d8b5c" stopOpacity="0"/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b85c5c" stopOpacity=".2"/><stop offset="100%" stopColor="#b85c5c" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)}/><Area type="monotone" dataKey="Revenus" stroke="#3d8b5c" fill="url(#incomeFill)" strokeWidth={2}/><Area type="monotone" dataKey="Dépenses" stroke="#b85c5c" fill="url(#expenseFill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
  </Widget>
}

export function ExpenseChartModule() {
  const transactions = useFinanceStore((s) => s.transactions)
  const money = useMoney(); const expenses = monthTransactions(transactions).filter((t) => t.type === 'expense')
  const data = useMemo(() => Object.entries(expenses.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.category]: (acc[item.category] ?? 0) + item.amount }), {})).map(([name, value]) => ({ name, value })), [expenses])
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return <Widget id="expenses" title="Répartition des dépenses" icon={<TrendingUp size={18} />}>
    <div className="donut-layout"><div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="84%" paddingAngle={3} animationDuration={1000}>{data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)}/></PieChart></ResponsiveContainer><div><strong>{money(total)}</strong><span>Total du mois</span></div></div><div className="chart-legend">{data.map((item, i) => <div key={item.name}><i style={{ background: chartColors[i % chartColors.length] }} /><span>{item.name}</span><b>{Math.round(item.value / total * 100)}%</b><small>{money(item.value)}</small></div>)}</div></div>
  </Widget>
}

export function TransactionsModule({ extended = false }: { extended?: boolean }) {
  const transactions = useFinanceStore((s) => s.transactions)
  const remove = useFinanceStore((s) => s.removeTransaction), update=useFinanceStore(s=>s.updateTransaction)
  const setModal = useUIStore((s) => s.setModal), showToast=useUIStore(s=>s.showToast)
  const money = useMoney(), date = useDateFormatter(); const [query, setQuery] = useState(''); const [type, setType] = useState('all'), [page,setPage]=useState(0)
  const filtered = transactions.filter((t) => (type === 'all' || t.type === type) && `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase())), perPage=extended?10:7, pages=Math.max(1,Math.ceil(filtered.length/perPage)), shown=filtered.slice(Math.min(page,pages-1)*perPage,Math.min(page,pages-1)*perPage+perPage)
  const edit=(id:string,title:string,amount:number)=>{const nextTitle=prompt('Modifier le libellé',title)?.trim();if(!nextTitle)return;const nextAmount=Number(prompt('Modifier le montant',String(amount)));update(id,{title:nextTitle,...(Number.isFinite(nextAmount)&&nextAmount>=0?{amount:nextAmount}:{})});showToast('Transaction mise à jour')}
  const exportCSV = () => downloadFile(`lifeos-transactions-${new Date().toISOString().slice(0,10)}.csv`, transactionsToCSV(filtered), 'text/csv;charset=utf-8')
  return <Widget id="transactions" title="Transactions" icon={<ReceiptText size={18} />} action={<div className="header-actions"><IconButton label="Exporter CSV" onClick={exportCSV}><Download size={16} /></IconButton><IconButton label="Ajouter" onClick={() => setModal('transaction')}><Plus size={17} /></IconButton></div>}>
    {extended && <div className="transactions-filters"><Input placeholder="Rechercher une transaction…" value={query} onChange={(e) => setQuery(e.target.value)} /><select className="input" value={type} onChange={(e) => setType(e.target.value)}><option value="all">Tous les types</option><option value="income">Revenus</option><option value="expense">Dépenses</option></select><Button variant="secondary" onClick={exportCSV}><Download size={16}/> CSV</Button></div>}
    <div className={`transaction-list ${extended ? 'extended' : ''}`}>{shown.map((item) => <div key={item.id} className="transaction-row" onDoubleClick={()=>edit(item.id,item.title,item.amount)}><span className={`transaction-avatar ${item.type}`}>{item.category.slice(0, 1)}</span><div><b>{item.title}</b><small>{item.category} · {date(item.date, { day: 'numeric', month: 'short' })}</small></div><strong className={item.type === 'income' ? 'success' : 'danger'}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</strong><IconButton label="Supprimer" className="row-delete" onClick={() => remove(item.id)}><Trash2 size={14}/></IconButton></div>)}</div>{extended&&pages>1&&<div className="pagination"><Button size="sm" variant="ghost" disabled={page<=0} onClick={()=>setPage(p=>p-1)}>← Précédent</Button><span>Page {Math.min(page,pages-1)+1} / {pages}</span><Button size="sm" variant="ghost" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}>Suivant →</Button></div>}
  </Widget>
}

export function BudgetModule({ extended = false }: { extended?: boolean }) {
  const budgets = useFinanceStore((s) => s.budgets), updateBudget=useFinanceStore(s=>s.updateBudget), addBudget=useFinanceStore(s=>s.addBudget), removeBudget=useFinanceStore(s=>s.removeBudget)
  const transactions = useFinanceStore((s) => s.transactions)
  const money = useMoney(); const current = monthTransactions(transactions)
  const rows = budgets.map((budget) => { const spent = current.filter((t) => t.type === 'expense' && t.category === budget.category).reduce((s, t) => s + t.amount, 0); return { ...budget, spent, percent: Math.round(spent / budget.planned * 100) } })
  const warnings = rows.filter((r) => r.percent >= 80)
  return <Widget id="budget" title="Budget mensuel" icon={<WalletCards size={18} />} action={extended?<div className="header-actions"><Badge tone={warnings.length?'warning':'success'}>{warnings.length?`${warnings.length} alerte${warnings.length>1?'s':''}`:'Sous contrôle'}</Badge><IconButton label="Ajouter un budget" onClick={()=>{const category=prompt('Nouvelle catégorie')?.trim();if(!category)return;const planned=Number(prompt('Budget mensuel prévu','1000'));if(planned>0)addBudget({category,planned,color:chartColors[budgets.length%chartColors.length]})}}><Plus size={16}/></IconButton></div>:warnings.length ? <Badge tone="warning"><AlertTriangle size={12}/>{warnings.length} alerte{warnings.length > 1 ? 's' : ''}</Badge> : <Badge tone="success">Sous contrôle</Badge>}>
    <div className={`budget-list ${extended ? 'extended' : ''}`}>{rows.slice(0, extended ? rows.length : 5).map((row) => <div key={row.id} className="budget-row"><div><span><i style={{ background: row.color }}/><b>{row.category}</b></span><small>{money(row.spent)} / {extended?<input aria-label={`Budget ${row.category}`} type="number" min="1" value={row.planned} onChange={(e)=>updateBudget(row.id,{planned:Number(e.target.value)})}/>:money(row.planned)}</small>{extended&&<IconButton label="Supprimer le budget" onClick={()=>removeBudget(row.id)}><Trash2 size={12}/></IconButton>}</div><Progress value={row.percent} tone={row.percent > 100 ? 'danger' : row.percent >= 80 ? 'warning' : 'success'} /><em className={row.percent > 100 ? 'danger' : ''}>{row.percent}%</em></div>)}</div>
    <div className="budget-footer"><span>Budget utilisé</span><strong>{money(rows.reduce((s, r) => s + r.spent, 0))} <small>sur {money(rows.reduce((s, r) => s + r.planned, 0))}</small></strong></div>
  </Widget>
}

export function SavingsModule({ extended = false }: { extended?: boolean }) {
  const goals = useFinanceStore((s) => s.savingsGoals), contribute = useFinanceStore((s) => s.contributeSavings), addGoal=useFinanceStore(s=>s.addSavingsGoal), updateGoal=useFinanceStore(s=>s.updateSavingsGoal), removeGoal=useFinanceStore(s=>s.removeSavingsGoal)
  const showToast=useUIStore(s=>s.showToast), money = useMoney(); const [selected, setSelected] = useState(0); const goal = goals[Math.min(selected,goals.length-1)]
  const add=()=>{const name=prompt('Nom du nouvel objectif')?.trim();if(!name)return;const target=Number(prompt('Montant cible','10000'));if(!Number.isFinite(target)||target<=0)return;const deadline=prompt('Échéance (AAAA-MM-JJ)',new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().slice(0,10))||'';if(!/^\d{4}-\d{2}-\d{2}$/.test(deadline))return;addGoal({name,target,current:0,deadline,icon:'🎯'});setSelected(goals.length);showToast('Objectif d’épargne créé')}
  const edit=(id:string,name:string,target:number,deadline:string)=>{const nextName=prompt('Nom de l’objectif',name)?.trim();if(!nextName)return;const nextTarget=Number(prompt('Montant cible',String(target)));const nextDeadline=prompt('Échéance (AAAA-MM-JJ)',deadline);updateGoal(id,{name:nextName,...(Number.isFinite(nextTarget)&&nextTarget>0?{target:nextTarget}:{}),...(nextDeadline&&/^\d{4}-\d{2}-\d{2}$/.test(nextDeadline)?{deadline:nextDeadline}:{})});showToast('Objectif mis à jour')}
  if(!goal)return <Widget id="savings" title="Objectifs d’épargne" icon={<PiggyBank size={18} />} action={<IconButton label="Créer un objectif" onClick={add}><Plus size={16}/></IconButton>}><div className="empty-state"><PiggyBank size={28}/><b>Aucun objectif</b><span>Créez votre première cible d’épargne.</span><Button size="sm" onClick={add}><Plus size={15}/> Créer</Button></div></Widget>
  const percent = Math.min(100,Math.round(goal.current / goal.target * 100)); const circumference = 2 * Math.PI * 45
  return <Widget id="savings" title="Objectifs d’épargne" icon={<PiggyBank size={18} />} action={<div className="header-actions"><select aria-label="Objectif affiché" className="tiny-select" value={Math.min(selected,goals.length-1)} onChange={(e) => setSelected(Number(e.target.value))}>{goals.map((g, i) => <option key={g.id} value={i}>{g.name}</option>)}</select>{extended&&<IconButton label="Créer un objectif" onClick={add}><Plus size={16}/></IconButton>}</div>}>
    <div className="savings-main"><div className="savings-ring"><svg viewBox="0 0 108 108"><circle cx="54" cy="54" r="45" className="ring-bg"/><circle cx="54" cy="54" r="45" className="ring-progress" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - percent / 100) }}/></svg><div><strong>{percent}%</strong><span>{goal.icon}</span></div></div><div className="savings-copy"><span>{goal.name}</span><strong>{money(goal.current)}</strong><small>sur {money(goal.target)}</small><p>Encore {money(goal.target - goal.current)} · {daysUntil(goal.deadline)} jours</p></div></div>
    <div className="contribution-buttons"><span>Contribution rapide</span>{[100, 500, 1000].map((v) => <button key={v} onClick={() => contribute(goal.id, v)}>+{v}</button>)}</div>
    {extended && <div className="all-savings">{goals.map((item) => <div key={item.id}><span>{item.icon} {item.name}</span><b>{Math.round(item.current / item.target * 100)}%</b><Progress value={item.current / item.target * 100}/><div className="header-actions"><IconButton label="Modifier l’objectif" onClick={()=>edit(item.id,item.name,item.target,item.deadline)}>✎</IconButton><IconButton label="Supprimer l’objectif" onClick={()=>{removeGoal(item.id);setSelected(0)}}><Trash2 size={13}/></IconButton></div></div>)}</div>}
  </Widget>
}

export function InvestmentsModule({ extended = false }: { extended?: boolean }) {
  const investments = useFinanceStore((s) => s.investments); const remove = useFinanceStore((s) => s.removeInvestment), add=useFinanceStore(s=>s.addInvestment); const money = useMoney(); const total = investments.reduce((s, i) => s + i.value, 0)
  const addAsset=()=>{const name=prompt('Nom de l’investissement')?.trim();if(!name)return;const value=Number(prompt('Valeur actuelle','1000'));if(!Number.isFinite(value))return;add({name,symbol:name.slice(0,4).toUpperCase(),type:'Actions',value,invested:value,change:0})}
  return <Widget id="investments" title="Investissements" icon={<Landmark size={18} />} action={extended?<IconButton label="Ajouter un investissement" onClick={addAsset}><Plus size={16}/></IconButton>:undefined}>
    <div className="portfolio-total"><span>Valeur totale</span><strong>{money(total)}</strong><small>+{money(investments.reduce((s, i) => s + (i.value - i.invested), 0))} de performance</small></div>
    <div className="investment-list">{investments.map((item) => <div key={item.id}><span className="asset-symbol">{item.symbol.slice(0, 2)}</span><span><b>{item.name}</b><small>{item.type}</small></span><strong>{money(item.value)}</strong><Badge tone={item.change >= 0 ? 'success' : 'danger'}>{item.change >= 0 ? '+' : ''}{item.change}%</Badge>{extended && <IconButton label="Supprimer" onClick={() => remove(item.id)}><Trash2 size={14}/></IconButton>}</div>)}</div>
  </Widget>
}

export function SavingsSimulatorModule({ extended = false }: { extended?: boolean }) {
  const [initial, setInitial] = useState(10000), [monthly, setMonthly] = useState(1200), [rate, setRate] = useState(6), [years, setYears] = useState(10)
  const money = useMoney(); const data = useMemo(() => compoundProjection(initial, monthly, rate, years), [initial, monthly, rate, years]); const final = data[data.length - 1]
  return <Widget id="simulator" title="Simulateur d’épargne" icon={<TrendingUp size={18} />}>
    <div className={`simulator-layout ${extended ? 'extended' : ''}`}><div className="simulator-controls"><Range label="Capital initial" value={initial} min={0} max={100000} step={1000} display={money(initial)} onChange={setInitial}/><Range label="Versement mensuel" value={monthly} min={0} max={10000} step={100} display={money(monthly)} onChange={setMonthly}/><Range label="Rendement annuel" value={rate} min={0} max={15} step={.5} display={`${rate}%`} onChange={setRate}/><Range label="Durée" value={years} min={1} max={30} step={1} display={`${years} ans`} onChange={setYears}/></div><div className="simulator-result"><div className="projection-stats"><span><small>Capital projeté</small><strong>{money(final.value)}</strong></span><span><small>Intérêts gagnés</small><strong className="success">+{money(final.value - final.invested)}</strong></span><span><small>Total versé</small><strong>{money(final.invested)}</strong></span></div><div className="simulator-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -14 }}><defs><linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#495057" stopOpacity=".28"/><stop offset="1" stopColor="#495057" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false}/><YAxis hide/><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} labelFormatter={(v) => `Année ${v}`}/><Area dataKey="value" name="Avec intérêts" type="monotone" stroke="#495057" fill="url(#projectionFill)" strokeWidth={2}/><Line dataKey="invested" name="Sans intérêts" stroke="#aab0b5" strokeDasharray="5 4" dot={false}/></AreaChart></ResponsiveContainer></div></div></div>
  </Widget>
}

function Range({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) { return <label className="range-field"><span>{label}<b>{display}</b></span><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}/></label> }

export function LoanCalculatorModule({ extended = false }: { extended?: boolean }) {
  const [amount, setAmount] = useState(250000), [rate, setRate] = useState(4.8), [years, setYears] = useState(15); const money = useMoney(); const result = useMemo(() => loanCalculation(amount, rate, years), [amount, rate, years])
  return <Widget id="loan" title="Calculateur de prêt" icon={<Calculator size={18} />}>
    <div className={`loan-grid ${extended ? 'extended' : ''}`}><div><label>Montant<Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}/></label><div className="two-fields"><label>Taux (%)<Input type="number" step=".1" value={rate} onChange={(e) => setRate(Number(e.target.value))}/></label><label>Durée (ans)<Input type="number" value={years} onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}/></label></div><div className="loan-result"><span>Mensualité</span><strong>{money(result.payment)}</strong><small>Coût des intérêts : {money(result.interest)}</small></div></div>{extended && <div className="loan-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.schedule}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="year" tick={{ fontSize: 10 }}/><YAxis hide/><Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)}/><Legend/><Bar dataKey="principal" name="Capital" stackId="a" fill="#495057"/><Bar dataKey="interest" name="Intérêts" stackId="a" fill="#aab0b5"/></BarChart></ResponsiveContainer></div>}</div>
  </Widget>
}

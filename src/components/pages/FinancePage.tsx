import { useState } from 'react'
import { Calculator, CircleDollarSign, Download, Landmark, PiggyBank, Plus, ReceiptText, TrendingUp, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import { monthTransactions, useFinanceStore, useSettingsStore, useUIStore } from '../../store'
import { downloadFile, formatCurrency, transactionsToCSV } from '../../utils/helpers'
import { Button, Tabs } from '../ui'
import { BudgetModule, ExpenseChartModule, FinanceSummaryModule, InvestmentsModule, LoanCalculatorModule, SavingsModule, SavingsSimulatorModule, TransactionsModule } from '../modules/finance'

const tabs = [
  { id: 'overview', label: 'Vue d’ensemble', icon: <CircleDollarSign size={15}/> }, { id: 'transactions', label: 'Transactions', icon: <ReceiptText size={15}/> },
  { id: 'budget', label: 'Budget', icon: <WalletCards size={15}/> }, { id: 'goals', label: 'Épargne', icon: <PiggyBank size={15}/> },
  { id: 'simulator', label: 'Simulateurs', icon: <Calculator size={15}/> }, { id: 'investments', label: 'Investissements', icon: <Landmark size={15}/> },
]
export function FinancePage() {
  const [tab, setTab] = useState('overview'); const transactions = useFinanceStore((s) => s.transactions); const setModal = useUIStore((s) => s.setModal)
  const currency = useSettingsStore((s) => s.currency), hidden = useSettingsStore((s) => s.hideAmounts)
  const current = monthTransactions(transactions), income = current.filter((t) => t.type === 'income').reduce((s,t)=>s+t.amount,0), expense = current.filter((t) => t.type === 'expense').reduce((s,t)=>s+t.amount,0)
  return <motion.div className="page section-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="page-heading"><div><span className="eyebrow"><TrendingUp size={14}/> PILOTAGE FINANCIER</span><h1>Vos finances, en toute clarté.</h1><p>Suivez chaque dirham, planifiez vos objectifs et projetez votre avenir.</p></div><div className="page-actions"><Button variant="secondary" onClick={() => downloadFile('lifeos-transactions.csv', transactionsToCSV(transactions), 'text/csv;charset=utf-8')}><Download size={16}/>Exporter</Button><Button onClick={() => setModal('transaction')}><Plus size={16}/>Transaction</Button></div></div>
    <div className="summary-strip"><div><span>Revenus ce mois</span><strong className="success">{formatCurrency(income,currency,hidden)}</strong><small>↑ 8,4% vs mois dernier</small></div><div><span>Dépenses ce mois</span><strong className="danger">{formatCurrency(expense,currency,hidden)}</strong><small>↓ 3,2% vs mois dernier</small></div><div><span>Épargne nette</span><strong>{formatCurrency(income-expense,currency,hidden)}</strong><small>{income ? Math.round((income-expense)/income*100) : 0}% des revenus</small></div><div><span>Patrimoine investi</span><strong>{formatCurrency(useFinanceStore.getState().investments.reduce((s,i)=>s+i.value,0),currency,hidden)}</strong><small>4 classes d’actifs</small></div></div>
    <Tabs tabs={tabs} value={tab} onChange={setTab}/>
    <div className="tab-content">
      {tab === 'overview' && <div className="overview-grid"><FinanceSummaryModule extended/><ExpenseChartModule/><BudgetModule/><SavingsModule/></div>}
      {tab === 'transactions' && <TransactionsModule extended/>}
      {tab === 'budget' && <div className="two-column-wide"><BudgetModule extended/><ExpenseChartModule/></div>}
      {tab === 'goals' && <div className="two-column-wide"><SavingsModule extended/><SavingsSimulatorModule/></div>}
      {tab === 'simulator' && <div className="simulators-grid"><SavingsSimulatorModule extended/><LoanCalculatorModule extended/></div>}
      {tab === 'investments' && <div className="two-column-wide"><InvestmentsModule extended/><FinanceSummaryModule extended/></div>}
    </div>
  </motion.div>
}

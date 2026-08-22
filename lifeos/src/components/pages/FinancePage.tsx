// ─────────────────────────────────────────────────────────────
// LifeOS – Page Finances (v2)
// Onglets : Vue d'ensemble / Transactions / Budget / Épargne &
// simulateur / Investissements / Prêt
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CreditCard, LineChart as LineIcon, PiggyBank, Receipt, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUIStore } from '../../store';
import { FinanceWidget, BudgetWidget } from '../modules/finance';
import { SavingsWidget, InvestmentsWidget, LoanWidget } from '../modules/finance2';
import { TransactionsFull } from '../modules/extended';
import { rippleHandler } from '../ui';

const TABS = [
  { id: 'overview', icon: LineIcon, key: 'page.overview' },
  { id: 'transactions', icon: Receipt, key: 'page.transactions' },
  { id: 'budget', icon: ClipboardList, key: 'page.budget' },
  { id: 'savings', icon: PiggyBank, key: 'page.simulator' },
  { id: 'investments', icon: TrendingUp, key: 'page.invest' },
  { id: 'loan', icon: CreditCard, key: 'page.loan' },
];

export function FinancePage() {
  const { t } = useApp();
  const tab = useUIStore((s) => s.financeTab);
  const setTab = useUIStore((s) => s.setFinanceTab);

  return (
    <div className="page-wrap">
      <div className="page-head">
        <h1>{t('page.finances')}</h1>
        <div className="page-tabs">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            return (
              <button key={tb.id} className={`page-tab ${tab === tb.id ? 'active' : ''}`} onClick={(e) => { rippleHandler(e); setTab(tb.id); }}>
                <Icon size={14} />
                {t(tb.key)}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {tab === 'overview' && (
          <div className="page-grid-2">
            <FinanceWidget id="finance" />
            <BudgetWidget id="budget" />
          </div>
        )}
        {tab === 'transactions' && <TransactionsFull id="finance" />}
        {tab === 'budget' && <BudgetWidget id="budget" />}
        {tab === 'savings' && (
          <div className="page-grid-2">
            <SavingsWidget id="savings" />
            <InvestmentsWidget id="investments" />
          </div>
        )}
        {tab === 'investments' && <InvestmentsWidget id="investments" />}
        {tab === 'loan' && <LoanWidget id="loan" />}
      </motion.div>
    </div>
  );
}

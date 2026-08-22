// ─────────────────────────────────────────────────────────────
// LifeOS – Page Premium (v2)
// Hero gradient smoke, grille de features, pricing (Gratuit vs
// Premium 9,99 €/mois), FAQ accordion. (Tailwind utilitaires.)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Crown, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PREMIUM_FEATURES_META } from '../premium';

const FAQ_KEYS = ['prem.faq1', 'prem.faq2', 'prem.faq3', 'prem.faq4', 'prem.faq5'];

export function PremiumPage() {
  const { t, state, openPremium } = useApp();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="page-wrap premium-page">
      {/* ── Hero ── */}
      <motion.section
        className="premium-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="premium-hero-smoke" aria-hidden="true" />
        <span className="badge warning" style={{ marginBottom: 14 }}>⭐ {t('prem.badge')}</span>
        <h1 className="premium-hero-title">{t('prem.hero')}</h1>
        <p className="premium-hero-desc">{t('prem.heroDesc')}</p>
        <div className="flex gap-3 flex-wrap justify-center" style={{ marginTop: 20 }}>
          <button className="btn primary premium-cta" onClick={openPremium}>
            <Sparkles size={15} /> {t('prem.trial')}
          </button>
          <button className="btn" onClick={() => document.getElementById('premium-pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('prem.price')} {t('prem.perMonth')}
          </button>
        </div>
      </motion.section>

      {/* ── Features ── */}
      <div className="premium-grid premium-page-grid">
        {PREMIUM_FEATURES_META.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.key}
              className="premium-item"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <span className="pi-icon"><Icon size={16} /></span>
              <span>
                <span className="pi-name">
                  {t(f.key)}
                  <Crown size={11} style={{ color: 'var(--warning)' }} />
                </span>
                <span className="pi-desc">{t(f.descKey)}</span>
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Pricing ── */}
      <div id="premium-pricing" className="pricing-grid">
        {/* Gratuit */}
        <div className="pricing-card">
          <div className="pricing-name">{t('prem.free')}</div>
          <div className="pricing-price">0 €</div>
          <div className="pricing-period">{t('prem.perMonth')}</div>
          <ul className="pricing-list">
            <li><Check size={14} /> {t('prem.incFree1')}</li>
            <li><Check size={14} /> {t('prem.incFree2')}</li>
            <li><Check size={14} /> {t('prem.incFree3')}</li>
            <li><Check size={14} /> {t('prem.incFree4')}</li>
          </ul>
          <div className="pricing-current">{t('prem.current')}</div>
        </div>
        {/* Premium */}
        <div className="pricing-card featured">
          <span className="pricing-badge">⭐ {t('prem.popular')}</span>
          <div className="pricing-name">{t('prem.badge')}</div>
          <div className="pricing-price">{t('prem.price')}</div>
          <div className="pricing-period">{t('prem.perMonth')}</div>
          <ul className="pricing-list">
            <li><Check size={14} /> {t('prem.incFree1')}</li>
            <li><Check size={14} /> {t('prem.incFree2')}</li>
            <li><Check size={14} /> {t('prem.incPrem1')}</li>
            <li><Check size={14} /> {t('prem.incPrem2')}</li>
            <li><Check size={14} /> {t('prem.incPrem3')}</li>
            <li><Check size={14} /> {t('prem.incPrem4')}</li>
          </ul>
          <button className="btn primary" style={{ width: '100%' }} onClick={openPremium}>
            <Crown size={14} /> {t('prem.choose')}
          </button>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="faq-wrap">
        <h2 className="faq-title">{t('prem.faq')}</h2>
        {FAQ_KEYS.map((key) => {
          const open = openFaq === key;
          return (
            <div key={key} className="faq-item">
              <button className="faq-question" onClick={() => setOpenFaq(open ? null : key)} aria-expanded={open}>
                {t(key)}
                <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }} />
              </button>
              {open && <div className="faq-answer">{t(key + 'a')}</div>}
            </div>
          );
        })}
      </div>

      {/* ── Contact footer ── */}
      <div className="premium-contact">
        <span>{t('footer.contact')}</span>
        <a href={`mailto:${state.profile.email}`} className="premium-contact-mail">
          {state.profile.email}
        </a>
        <span className="premium-contact-note">{t('footer.made')}</span>
      </div>
    </div>
  );
}

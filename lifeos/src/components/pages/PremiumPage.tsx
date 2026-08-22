// ─────────────────────────────────────────────────────────────
// LifeOS – Page Fonctionnalités (v2.4 : 100 % gratuit)
// Hero, grille des fonctionnalités incluses, FAQ, contact.
// Plus aucune tarification ni verrou : tout est disponible.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Gem, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUIStore } from '../../store';
import { PREMIUM_FEATURES_META } from '../premium';

const FAQ_KEYS = ['prem.faqFree1', 'prem.faqFree2', 'prem.faqFree3', 'prem.faqFree4', 'prem.faqFree5'];

export function PremiumPage() {
  const { t, state } = useApp();
  const setView = useUIStore((s) => s.setView);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const goDashboard = () => {
    setView('dashboard');
    try {
      window.location.hash = '/dashboard';
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="page-wrap premium-page">
      {/* ── Hero : tout est gratuit ── */}
      <motion.section
        className="premium-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="premium-hero-smoke" aria-hidden="true" />
        <span className="badge success" style={{ marginBottom: 14, fontSize: 11 }}>
          <CheckCircle2 size={12} /> {t('prem.freeBadge')}
        </span>
        <h1 className="premium-hero-title">{t('prem.heroFree')}</h1>
        <p className="premium-hero-desc">{t('prem.heroFreeDesc')}</p>
        <div className="flex gap-3 flex-wrap justify-center" style={{ marginTop: 20 }}>
          <button className="btn primary premium-cta" onClick={goDashboard}>
            <Sparkles size={15} /> {t('prem.startFree')}
          </button>
          <button className="btn" onClick={() => document.getElementById('premium-features')?.scrollIntoView({ behavior: 'smooth' })}>
            <Gem size={14} /> {t('prem.title')}
          </button>
        </div>
      </motion.section>

      {/* ── Toutes les fonctionnalités incluses ── */}
      <div id="premium-features" className="premium-grid premium-page-grid">
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
                  <CheckCircle2 size={11} style={{ color: 'var(--success)' }} />
                </span>
                <span className="pi-desc">{t(f.descKey)}</span>
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bandeau gratuité ── */}
      <div className="free-banner">
        <Gem size={20} style={{ color: 'var(--accent)', flex: 'none' }} />
        <div>
          <strong>{t('prem.title')}</strong>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12.5, marginTop: 2 }}>
            {t('prem.subtitle')}
          </span>
        </div>
        <span className="badge success" style={{ marginLeft: 'auto', fontSize: 10 }}>✓ {t('prem.freeBadge')}</span>
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

      {/* ── Contact ── */}
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

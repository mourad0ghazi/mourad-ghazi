// ─────────────────────────────────────────────────────────────
// LifeOS – Module Premium (vitrine) + modale de verrouillage
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck,
  CloudUpload,
  Crown,
  FileText,
  Gem,
  Landmark,
  LayoutTemplate,
  Plug,
  Smartphone,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, WidgetHead } from './ui';
import type { WidgetId } from '../types';

export const PREMIUM_FEATURES_META: { key: string; descKey: string; icon: LucideIcon }[] = [
  { key: 'prem.f1', descKey: 'prem.f1d', icon: Bot },
  { key: 'prem.f2', descKey: 'prem.f2d', icon: FileText },
  { key: 'prem.f3', descKey: 'prem.f3d', icon: Landmark },
  { key: 'prem.f4', descKey: 'prem.f4d', icon: CloudUpload },
  { key: 'prem.f5', descKey: 'prem.f5d', icon: Users },
  { key: 'prem.f6', descKey: 'prem.f6d', icon: CalendarCheck },
  { key: 'prem.f7', descKey: 'prem.f7d', icon: Smartphone },
  { key: 'prem.f8', descKey: 'prem.f8d', icon: LayoutTemplate },
  { key: 'prem.f9', descKey: 'prem.f9d', icon: BellRing },
  { key: 'prem.f10', descKey: 'prem.f10d', icon: Plug },
  { key: 'prem.f11', descKey: 'prem.f11d', icon: Gem },
  { key: 'prem.f12', descKey: 'prem.f12d', icon: Wifi },
];

const PREMIUM_FEATURES = PREMIUM_FEATURES_META;

export function PremiumWidget({ id }: { id: WidgetId }) {
  const { t, openPremium } = useApp();
  return (
    <div className="widget-card" style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--card))' }}>
      <WidgetHead
        icon={<Crown size={17} style={{ color: 'var(--warning)' }} />}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('prem.title')}
            <span className="badge warning" style={{ fontSize: 9 }}>⭐ {t('prem.badge')}</span>
          </span>
        }
        sub={t('prem.subtitle')}
        actions={
          <button className="btn sm primary" onClick={openPremium}>
            <Crown size={13} /> {t('prem.cta')}
          </button>
        }
      />
      <div className="premium-grid">
        {PREMIUM_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="premium-item" onClick={openPremium} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openPremium()}>
              <span className="pi-icon">
                <Icon size={16} />
              </span>
              <span>
                <span className="pi-name">
                  {t(f.key)}
                  <Crown size={11} style={{ color: 'var(--warning)' }} />
                </span>
                <span className="pi-desc">{t(f.descKey)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Modale "Passez à Premium" – affichée pour toutes les features verrouillées */
export function PremiumModal() {
  const { t, premiumOpen, closePremium, showToast } = useApp();
  return (
    <Modal
      open={premiumOpen}
      onClose={closePremium}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crown size={18} style={{ color: 'var(--warning)' }} /> {t('prem.modalTitle')}
        </span>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, marginRight: 'auto' }}>
            {t('prem.price')} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('prem.perMonth')}</span>
          </span>
          <button
            className="btn ghost"
            onClick={() => {
              const el = document.getElementById('premium-pricing');
              closePremium();
              window.setTimeout(() => el?.scrollIntoView({ behavior: 'smooth' }), 150);
            }}
          >
            {t('prem.free')}
          </button>
          <button
            className="btn primary"
            onClick={() => {
              showToast(t('toast.premium'), 'warning');
              closePremium();
            }}
          >
            <Crown size={14} /> {t('prem.trial')}
          </button>
        </div>
      }
    >
      <p style={{ margin: '0 0 16px', color: 'var(--text-soft)', fontSize: 13.5 }}>{t('prem.modalDesc')}</p>
      <div className="premium-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {PREMIUM_FEATURES.slice(0, 8).map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="premium-item" style={{ cursor: 'default' }}>
              <span className="pi-icon"><Icon size={15} /></span>
              <span>
                <span className="pi-name">
                  {t(f.key)}
                  <Crown size={10} style={{ color: 'var(--warning)' }} />
                </span>
                <span className="pi-desc">{t(f.descKey)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

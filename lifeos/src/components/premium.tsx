// ─────────────────────────────────────────────────────────────
// LifeOS – Widget "Fonctionnalités incluses" (v2.5 : 100 % gratuit)
// Chaque icône ouvre la fonctionnalité réelle correspondante.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { CheckCircle2, Gem, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUIStore } from '../store';
import { WidgetHead } from './ui';
import { FEATURE_REGISTRY } from './features/FeaturePanels';
import type { WidgetId } from '../types';

export const PREMIUM_FEATURES_META = FEATURE_REGISTRY.map((f) => ({
  key: f.key,
  descKey: f.descKey,
  icon: f.icon,
}));

/** Widget du dashboard : chaque carte de fonctionnalité ouvre son panneau */
export function FeaturesWidget({ id }: { id: WidgetId }) {
  const { t } = useApp();
  const setView = useUIStore((s) => s.setView);
  const setFeatureOpen = useUIStore((s) => s.setFeatureOpen);

  return (
    <div className="widget-card" style={{ background: 'linear-gradient(135deg, var(--success-soft), var(--card))' }}>
      <WidgetHead
        icon={<CheckCircle2 size={17} style={{ color: 'var(--success)' }} />}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('prem.title')}
            <span className="badge success" style={{ fontSize: 9 }}>✓ {t('prem.freeBadge')}</span>
          </span>
        }
        sub={t('prem.subtitle')}
        actions={
          <button
            className="btn sm"
            onClick={() => {
              setView('premium');
              try {
                window.location.hash = '/premium';
              } catch {
                /* ignore */
              }
              window.scrollTo({ top: 0 });
            }}
          >
            <Gem size={13} /> {t('prem.cta')}
          </button>
        }
      />
      <div className="premium-grid">
        {FEATURE_REGISTRY.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              className="premium-item premium-item-clickable"
              onClick={() => setFeatureOpen(f.id)}
              title={`${t(f.key)} — ${t('feat.open')}`}
              aria-label={t(f.key)}
            >
              <span className="pi-icon">
                <Icon size={16} />
              </span>
              <span>
                <span className="pi-name">
                  {t(f.key)}
                  <CheckCircle2 size={11} style={{ color: 'var(--success)' }} />
                </span>
                <span className="pi-desc">{t(f.descKey)}</span>
              </span>
              <ChevronRight size={14} className="pi-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Rétro-compatibilité
export const PremiumWidget = FeaturesWidget;

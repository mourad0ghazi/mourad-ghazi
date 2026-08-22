// ─────────────────────────────────────────────────────────────
// LifeOS – Fonctionnalités incluses (v2.4 : 100 % gratuit)
// Plus aucun verrou Premium : toutes les fonctionnalités sont
// disponibles gratuitement pour tous les utilisateurs.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  BellRing,
  Bot,
  CalendarCheck,
  CheckCircle2,
  CloudUpload,
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
import { useUIStore } from '../store';
import { WidgetHead } from './ui';
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

/** Widget du dashboard : vitrine des fonctionnalités — tout est inclus, gratuitement */
export function FeaturesWidget({ id }: { id: WidgetId }) {
  const { t } = useApp();
  const setView = useUIStore((s) => s.setView);

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
        {PREMIUM_FEATURES_META.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="premium-item">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Rétro-compatibilité : certains fichiers importaient `PremiumWidget`
export const PremiumWidget = FeaturesWidget;

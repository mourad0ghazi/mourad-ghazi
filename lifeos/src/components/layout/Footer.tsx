// ─────────────────────────────────────────────────────────────
// LifeOS – Footer discret
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../../context/AppContext';
import { APP_VERSION } from '../../utils/constants';

export function Footer() {
  const { t, state } = useApp();
  return (
    <footer className="app-footer">
      <span>
        <strong>LifeOS</strong> v{APP_VERSION} · {t('misc.demo')}
      </span>
      <span className="app-footer-right">
        {state.settings.lang === 'fr' ? 'Vos données restent sur cet appareil 🔒' : 'Your data stays on this device 🔒'}
      </span>
    </footer>
  );
}

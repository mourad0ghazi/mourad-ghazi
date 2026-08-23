// ─────────────────────────────────────────────────────────────
// LifeOS – Point d'entrée React
// ─────────────────────────────────────────────────────────────

import React from 'react';
import ReactDOM from 'react-dom/client';
// Migration v1→v2 : doit s'exécuter AVANT le chargement des stores
import './store/migrate';
import App from './App';
import './styles/global.css';
import './styles/tailwind.css';

// PWA : enregistrement du service worker (mode hors-ligne)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        /* environnement sans support SW (ex. aperçu sandboxé) : on ignore */
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

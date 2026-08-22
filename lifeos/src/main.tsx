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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

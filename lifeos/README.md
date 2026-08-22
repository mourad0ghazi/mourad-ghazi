# LifeOS – Mon Dashboard Personnel (v2)

> Un tableau de bord personnel complet pour piloter sa vie : finances, organisation,
> habitudes, objectifs et un agent IA intégré. Design "fumée" minimaliste
> (blanc → gris clair), animations douces, 100 % contrôlable.

## 🧰 Stack (v2)

- **React 18.3 + Vite 5 + TypeScript 5** (strict)
- **Tailwind CSS 3.4** (utilitaires, config design tokens "smoke") + CSS design system custom
- **Zustand 4.5** avec persist middleware (5 stores : settings, dashboard, finance, personal, chatbot + UI store)
- **Framer Motion 11** · **Recharts 2** · **react-grid-layout 1.5** · **Lucide React** · **date-fns** · **clsx** · **tailwind-merge**

## 🗺️ Pages

| Page | Contenu |
|---|---|
| **Dashboard** (`#/dashboard`) | Bannière d'accueil (gradient smoke, parallax, mini-stats) + grille drag & drop 15 modules |
| **Finances** (`#/finances`) | Onglets : Vue d'ensemble / Transactions (pagination, filtres) / Budget / Épargne & simulateur / Investissements / Prêt |
| **Vie personnelle** (`#/personal`) | Onglets : Tâches (liste + **Kanban**) / Calendrier / Notes / Habitudes (+ progression mensuelle) / Journal / Objectifs SMART |
| **Premium** (`#/premium`) | Hero, 12 features, pricing (Gratuit 0 € vs Premium 9,99 €/mois), FAQ accordion |
| **Paramètres** (`#/settings`) | 9 onglets de configuration complète |

## ✨ Fonctionnalités clés

- **Drag & drop + redimensionnement** des modules, masquer/afficher, layout persisté
- **Tâches** : sous-tâches, tags, priorités (dont Urgente), statuts (À faire/En cours/Terminé), Kanban, réordonnancement par glisser-déposer, export CSV
- **Habitudes** : tri-état (fait ✓ / manqué ✗ / vide), streaks, graphique mensuel
- **Objectifs SMART** : milestones (étapes clés), échéances, alertes de retard
- **Journal** : humeur, historique, **protection par PIN optionnelle**
- **Finances** : graphiques animés, budget avec **alertes à niveaux** (attention ≥ seuil configurable, critique > 100 %), simulateur d'intérêts composés, calculateur de prêt, investissements, export CSV
- **Agent IA** : réponses contextuelles (budget, revenus, dépenses, tâches, planification), 80 conseils + 48 citations + 20 faits éducatifs (FR/EN), **coach proactif** (fréquence + heure configurables), badge non-lus, historique persistant
- **Paramètres** : thème clair/sombre/auto, accents, densité, toggles d'animations, langue FR/EN, devises, formats de date/heure (12h/24h), séparateur décimal, **masquage des montants**, fuseau horaire, notifications, PIN de verrouillage
- **Raccourcis clavier** : `Ctrl+K` recherche · `Ctrl+T` tâche · `Ctrl+N` note · `Ctrl+M` transaction · `Ctrl+/` assistant · `Ctrl+Shift+L` thème · `Ctrl+,` paramètres · `Ctrl+?` aide · `P` pomodoro · `L` verrouiller
- **Données** : import/export JSON, export CSV, réinitialisation, **migration automatique v1 → v2** du localStorage
- **Responsive** : desktop (grille 12 colonnes), tablette (2 colonnes / empilé), mobile (empilé + sidebar tiroir)

## 🚀 Lancer

```bash
cd lifeos
npm install
npm run dev      # http://localhost:5173
npm run build    # lifeos/dist (assets relatifs → déployable en sous-dossier)
```

## 🗂️ Structure

```
lifeos/src
├── store/            # Zustand (settings, dashboard, finance, personal, chatbot, ui) + migration v1→v2
├── context/          # AppProvider : composition des stores, toasts, thème, verrouillage
├── data/             # données initiales, base de connaissances IA (conseils, citations, faits), registre modules
├── i18n/             # traductions FR / EN
├── utils/            # formateurs, calculs financiers, formatConfig (masquage/séparateur/horloge), helpers
├── hooks/            # (composants UI : useMediaQuery, useReveal…)
├── components/
│   ├── layout/       # Sidebar (pages + modules), Header (recherche, alertes, actions rapides)
│   ├── pages/        # DashboardPage, FinancePage, PersonalPage, PremiumPage (+ SettingsContent)
│   ├── modules/      # personal, planner, finance, finance2, extended (Kanban, mensuel, transactions)
│   ├── chatbot/      # widget + moteur de réponses + coach proactif
│   ├── settings/     # panneau de paramètres
│   └── ui.tsx        # Modal, Toggle, compteurs animés, ripple, skeleton…
├── styles/           # global.css (design system) + tailwind.css
└── types.ts          # typage complet
```

## 📄 Données

Aucun fichier Excel n'étant fourni, des données de démonstration réalistes
(Mourad Ghazi, Casablanca, MAD) sont pré-chargées. Importez vos données via
**Paramètres → Données → Importer (JSON)** ou remplacez `src/data/initialData.ts`.

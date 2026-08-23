# LifeOS – Mon Dashboard Personnel (v2.5)

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
| **Fonctionnalités** (`#/premium`) | Hero « 100 % gratuit », **12 fonctionnalités réelles et cliquables**, FAQ, contact — aucune tarification |
| **Paramètres** (`#/settings`) | 9 onglets de configuration complète |

## ✨ Fonctionnalités clés

- **Drag & drop + redimensionnement** des modules, masquer/afficher, layout persisté
- **Horloge** : mode **digital + analogique** (cadran SVG animé)
- **Pomodoro** : Play/Pause/Reset/**Skip**, anneau de progression, son, sessions
- **Tâches** : sous-tâches, tags, priorités (dont Urgente), statuts (À faire/En cours/Terminé), Kanban, réordonnancement par glisser-déposer (`useDragReorder`), export CSV
- **Habitudes** : tri-état (fait ✓ / manqué ✗ / vide), streaks, graphique mensuel
- **Objectifs SMART** : milestones (étapes clés), échéances, alertes de retard
- **Journal** : humeur, historique, **protection par PIN optionnelle**
- **Finances** : graphiques animés (revenus/dépenses/**épargne nette**), budget avec **alertes à niveaux** + **projection fin de mois**, simulateur d'intérêts composés (courbe **avec/sans intérêts**), calculateur de prêt, investissements, avatars de catégories, export CSV
- **Météo** : géolocalisation ou **ville au choix** (7 villes prédéfinies, persistée)
- **Fonctionnalités avancées — 100 % gratuites et réellement fonctionnelles** (clic sur une icône = ouverture du panneau) :
  1. 🤖 **IA avancée** : prévisions 3 mois, analyse de portefeuille (score de diversification, meilleur/plus mauvais actif), conseils personnalisés, projection d'épargne 12 mois
  2. 📄 **Rapports automatisés** : génération **PDF** (impression), **Excel** (.xls) et **CSV** selon le périmètre choisi
  3. 🏦 **Synchronisation bancaire** : connexion à une banque (simulation locale) + **import réel de transactions**
  4. ☁️ **Cloud sync & backup** : synchronisation, téléchargement/restauration du fichier de sauvegarde, backup automatique quotidien
  5. 👨‍👩‍👧 **Famille** : membres avec budget — chaque membre crée une vraie catégorie budgétaire
  6. 🔌 **Intégrations** : exports réels — **.ics** pour Google/Outlook Calendar, **.md** pour Notion, **CSV** pour Trello
  7. 📱 **PWA hors-ligne** : manifest + service worker + icônes + bouton d'installation
  8. 📋 **Templates** : budgets (Étudiant, Famille, Freelance, Minimaliste), habitudes, objectifs — application en un clic
  9. 🔔 **Alertes SMS/Email** : notifications bureau réelles (permission + test), email et SMS simulés
  10. 🔑 **API ouverte** : clé API, documentation des endpoints, console JSON interactive
  11. 🎨 **Thèmes personnalisés** : création de thèmes avec couleur au choix, application instantanée
  12. 💬 **Support** : tickets enregistrés, accès direct à l'assistant IA
- **Paramètres** : profil (photo, téléphone, anniversaire), thème clair/sombre/auto, accents, densité, toggles d'animations, langue FR/EN, devises, formats de date/heure (12h/24h), séparateur décimal, **masquage des montants**, fuseau horaire, notifications, PIN de verrouillage, **sauvegarde manuelle + restauration**
- **Raccourcis clavier** : `Ctrl+K` recherche · `Ctrl+T` tâche · `Ctrl+N` note · `Ctrl+M` transaction · `Ctrl+/` assistant · `Ctrl+Shift+L` thème · `Ctrl+,` paramètres · `Ctrl+?` aide · `P` pomodoro · `L` verrouiller
- **Données** : import/export JSON, export CSV, réinitialisation, **migration automatique v1 → v2** du localStorage
- **Responsive** : desktop (grille 12 colonnes), tablette (2 colonnes / empilé), mobile (empilé + **barre de navigation basse** + sidebar tiroir)
- **Hooks maison** (`src/hooks/`) : useDebounce, useLocalStorage, useMediaQuery, useAnimation, useDragReorder, useChatbot
- **Variants Framer Motion centralisés** (`src/utils/animations.ts`) : fadeInUp, staggerContainer, scaleIn, slideInRight/Bottom, cardHover, modalOverlay/Content, toastVariants, messageVariants, typingDot, counterVariants, pageTransition

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
├── utils/            # formateurs, calculs financiers, formatConfig, animations (variants), constants, validators, helpers
├── hooks/            # useDebounce, useLocalStorage, useMediaQuery, useAnimation, useDragReorder, useChatbot
├── components/
│   ├── layout/       # Sidebar (pages + modules), Header (recherche, alertes, actions rapides)
│   ├── pages/        # DashboardPage, FinancePage, PersonalPage, PremiumPage (fonctionnalités gratuites) (+ SettingsContent)
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

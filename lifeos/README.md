# LifeOS – Mon Dashboard Personnel

> Un tableau de bord personnel complet pour piloter sa vie : finances, organisation,
> habitudes, objectifs et un agent IA intégré. Design "fumée" minimaliste
> (blanc → gris clair), animations douces, 100 % contrôlable.

## ✨ Fonctionnalités

### Vie personnelle
- 🕐 **Horloge temps réel** (fuseau horaire configurable, semaine ISO)
- 🌤️ **Météo locale** (Open-Meteo, géolocalisation, repli démo hors-ligne)
- 📅 **Calendrier interactif** (mois / semaine / jour, événements colorés)
- ✅ **Todo list** (priorités, échéances, filtres, retards)
- 📝 **Notes rapides** (édition inline, sauvegarde automatique)
- 🔁 **Tracker d'habitudes** (grille 7 jours, streaks 🔥)
- 📓 **Journal quotidien** (humeur, historique)
- 🎯 **Objectifs SMART** (barres de progression animées, deadlines)
- 🍅 **Pomodoro** (25/5/15, anneau de progression, son, sessions)

### Finances & développement financier
- 💹 **Aperçu finances** : revenus / dépenses / solde animés, courbes 6 mois (Recharts), camembert par catégorie
- 🧾 **Transactions** : ajout/suppression, export CSV
- 📊 **Budget mensuel** : catégories personnalisables, alertes de dépassement (cloche + toasts)
- 🏦 **Objectifs d'épargne** + versements
- 📈 **Simulateur d'intérêts composés** (projection animée)
- 💼 **Investissements** (actions, crypto, immobilier, liquidités — répartition + performance)
- 🏠 **Calculateur de prêt** (mensualité, coût total, amortissement)

### Agent IA intégré (chatbot)
- Widget flottant en bas à droite (style Intercom)
- Réponses **contextuelles** basées sur vos données réelles (budget, tâches, épargne…)
- 40 conseils financiers + 40 conseils productivité + 24 citations (FR & EN)
- Mode **Coach**, historique persistant, chips de questions rapides, animation "typing…"

### Contrôle & personnalisation
- **Drag & drop** des cartes + **redimensionnement** (react-grid-layout)
- **Masquer / afficher** chaque module (sidebar ou paramètres)
- **Paramètres** : profil & photo, thème (clair/sombre/auto), accent, densité,
  langue (FR/EN), devise, format de date, fuseau horaire, notifications, coach
- **Recherche globale** en temps réel (`/`)
- **Verrouillage par code PIN** (écran de verrouillage dédié)
- **Import / Export JSON**, export CSV, réinitialisation
- **Raccourcis clavier** : `/` recherche · `N` tâche · `Shift+N` note · `T` thème · `P` pomodoro · `?` raccourcis · `L` verrouiller
- **Persistance totale** dans `localStorage`

### Premium (mocké)
12 fonctionnalités verrouillées (IA avancée, rapports PDF/Excel, sync bancaire,
cloud, famille, intégrations, PWA, API, support prioritaire…) avec modale
« Passez à Premium ».

## 🧰 Stack

React 18 + TypeScript + Vite · Framer Motion · Recharts · react-grid-layout ·
Lucide Icons · CSS custom (design system "smoke", light/dark, 3 densités).

## 🚀 Lancer

```bash
cd lifeos
npm install
npm run dev      # http://localhost:5173
```

## 📦 Production / GitHub Pages

```bash
npm run build    # génère lifeos/dist (assets relatifs, déployable en sous-dossier)
```

Le dossier `dist/` est commité : il suffit d'activer GitHub Pages sur le repo
et de visiter `/lifeos/dist/` — ou de copier son contenu à la racine de la page.

## 🗂️ Structure

```
lifeos/src
├── components
│   ├── layout/       # Sidebar, Header (recherche, notifs, actions rapides)
│   ├── modules/      # personal (horloge, météo, calendrier, pomodoro)
│   │                 # planner (tâches, notes, habitudes, journal, objectifs)
│   │                 # finance (aperçu, budget) + finance2 (épargne, invest., prêt)
│   ├── chatbot/      # agent IA + moteur de règles
│   ├── settings/     # panneau de paramètres (9 onglets)
│   └── ui.tsx        # composants réutilisables (modal, toggle, compteurs…)
├── context/          # état global + persistance + toasts + thème
├── data/             # données initiales (mock), registre modules, base de connaissances IA
├── i18n/             # traductions FR / EN
├── styles/           # design system CSS complet
└── utils/            # dates, formats, CSV, stockage
```

## 📄 Données initiales

Aucun fichier Excel n'ayant été fourni, des données de démonstration réalistes
(Mourad Ghazi, Casablanca, MAD) sont pré-chargées. Importez votre propre export
via **Paramètres → Données → Importer (JSON)** ou remplacez `src/data/initialData.ts`.

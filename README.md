# LifeOS

A complete, local-first personal dashboard for everyday planning, goals, habits, journaling, and financial management. The interface is in French by default and ships with realistic demo data for Mourad Ghazi in Casablanca (MAD).

## Highlights

- **Configurable dashboard** — 17 widgets with persisted visibility, drag, resize, reorder, and layout reset.
- **Personal planning** — calendar month/week/day views, event management, tasks with list/Kanban/CSV workflows, notes, tri-state habits, private journal, SMART goals, Pomodoro, clock, and live Open-Meteo weather with fallback data.
- **Finance center** — six-month overview charts, searchable and paginated transactions, editable budgets and alerts, savings contributions, compound-interest projection, investments, and loan amortization.
- **Local assistant** — contextual answers from the current LifeOS stores, quick prompts, message history, and finance/productivity coaching without a remote AI dependency.
- **12 included tools** — local forecasts, printable/CSV reports, intelligent Excel personalization, JSON backup/restore, family profiles, ICS calendar export, offline installation, themes, local data access, routines, privacy controls, and diagnostics.
- **Settings & privacy** — profile/avatar, themes, accent and density, locale/currency/timezone, module visibility, notifications, PIN lock, journal lock, masked amounts, exports, and reset controls.
- **Responsive and accessible** — desktop sidebar, tablet drawer, mobile bottom bar, visible focus states, ARIA labels, keyboard controls, reduced-motion support, and light/dark/automatic themes.
- **Local-first persistence** — Zustand stores are persisted in `localStorage`; a production service worker supports repeat visits offline.

## Tech stack

React 18.3, Vite 5, strict TypeScript, Zustand Persist, Framer Motion, Recharts, react-grid-layout, Tailwind CSS/PostCSS, Lucide React, and date-fns.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The deployable output is generated in `dist/`. Deploy it as a static site. Hash-based navigation means no server rewrite rules are required.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ K` | Focus global search |
| `Ctrl/⌘ T` | Create a task |
| `Ctrl/⌘ N` | Create a note |
| `Ctrl/⌘ M` | Create a transaction |
| `Ctrl/⌘ /` | Open the assistant |
| `Ctrl/⌘ Shift L` | Cycle the theme |
| `Ctrl/⌘ ,` | Open settings |
| `P` | Open the Pomodoro widget |
| `L` | Lock LifeOS |

The initial demo PIN is `2026` and can be changed under **Paramètres → Sécurité**.

## Personalize LifeOS from Excel

Open **Outils gratuits → Import Excel intelligent**, use the dashboard import shortcut, or choose **Paramètres → Données → Personnaliser avec Excel**.

Supported files:

- `.xlsx`, `.xlsm`, and `.xltx` workbooks up to 25 MB
- `.csv` files with comma or semicolon separators
- Legacy `.xls` files should first be saved as `.xlsx` in Excel or LibreOffice

LifeOS reads every worksheet locally, extracts cell values, dates, shared strings, inline strings, and saved formula results, and never executes formulas or macros. It recognizes tables for transactions, tasks, events, budgets, savings goals, investments, SMART goals, habits, notes, journal entries, and profile settings. Before applying anything, the import assistant displays:

1. worksheets and detected modules;
2. record and formula counts;
3. a tabular preview of each sheet;
4. formulas with their cached values;
5. any unrecognized worksheets or mapping warnings.

Choose whether to replace only the detected demo collections or merge and deduplicate them with existing data. The optional **Adapter mon dashboard** setting makes matching widgets visible, moves them to the top, and persists the new layout. A multi-sheet `.xlsx` template is available directly inside the importer.

## Data and backups

LifeOS does not require a backend. Its store keys use the `lifeos:v2:*` prefix in `localStorage`. Use **Paramètres → Données** or **Outils gratuits → Sauvegarde portable** to download a JSON backup. Transaction data can be exported/imported as CSV, and events can be exported in ICS format.

For CSV import, use these columns:

```text
Date;Libellé;Type;Catégorie;Montant
2026-08-20;Courses;Dépense;Alimentation;450
```

## Weather and offline behavior

Weather uses the public Open-Meteo endpoint. If it is unavailable, the widget keeps a built-in Casablanca fallback. On a production deployment, the service worker caches same-origin app resources after the first successful visit. All persisted user data remains local to the browser.

## Validation

```bash
npm run lint   # strict TypeScript validation
npm run build  # strict validation + optimized Vite bundle
```

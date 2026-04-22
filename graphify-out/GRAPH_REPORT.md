# Graph Report - d:/Personal Finance  (2026-04-21)

## Corpus Check
- Corpus is ~9,931 words - fits in a single context window. You may not need a graph.

## Summary
- 40 nodes · 71 edges · 9 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.84)
- Token cost: 4,200 input · 3,100 output

## God Nodes (most connected - your core abstractions)
1. `Personal Finance Tracker â€” Design Spec` - 14 edges
2. `Personal Finance Tracker â€” Implementation Plan` - 8 edges
3. `src/router.jsx` - 8 edges
4. `Database Table: transactions` - 7 edges
5. `Supabase Backend (Auth + Postgres + Edge Functions)` - 6 edges
6. `supabase/migrations/001_initial.sql` - 6 edges
7. `Row Level Security (RLS)` - 5 edges
8. `Database Table: users` - 5 edges
9. `Database Table: categories` - 5 edges
10. `Dashboard Page` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Personal Finance Tracker â€” Implementation Plan` --semantically_similar_to--> `Personal Finance Tracker â€” Design Spec`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `src/router.jsx` --implements--> `Dashboard Page`  [INFERRED]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `src/router.jsx` --implements--> `Transactions Page`  [INFERRED]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `src/router.jsx` --implements--> `Reports Page`  [INFERRED]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `src/router.jsx` --implements--> `Categories Page`  [INFERRED]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md

## Hyperedges (group relationships)
- **Supabase RLS + Auth + DB â€” Data Isolation** — spec_rls, spec_supabase_backend, spec_db_users, spec_rls_rationale [EXTRACTED 0.95]
- **Telegram Bot Transaction Entry Flow** — spec_telegram_bot, plan_edge_function, spec_db_transactions, spec_telegram_linking [EXTRACTED 0.90]
- **Zero-Cost Hosting Stack Decision** — spec_react_spa, spec_supabase_backend, spec_free_hosting_rationale, plan_deploy_yml [EXTRACTED 0.93]

## Communities

### Community 0 - "Deployment & Client Layer"
Cohesion: 0.38
Nodes (7): .github/workflows/deploy.yml, src/lib/supabase.js, Task 3: Supabase Client + Utils, src/lib/utils.js, Rationale: Free Hosting Stack, React Static SPA (GitHub Pages), Supabase Backend (Auth + Postgres + Edge Functions)

### Community 1 - "Project Scaffold & Plan"
Cohesion: 0.29
Nodes (7): Project File Structure, Personal Finance Tracker â€” Implementation Plan, tailwind.config.js, Task 1: Project Scaffold, Task 2: Supabase Schema, Task 5: Login + Signup Pages, Dark Mode UI Theme

### Community 2 - "Database Schema & Categories"
Cohesion: 0.5
Nodes (5): supabase/migrations/001_initial.sql, Categories Page, Database Table: budgets, Database Table: categories, System Default Categories

### Community 3 - "Charts & UI Pages"
Cohesion: 0.4
Nodes (5): Tech Stack, Dashboard Page, Recharts (Charting Library), Reports Page, Responsive Navigation

### Community 4 - "Core Data Model"
Cohesion: 0.83
Nodes (4): Database Table: transactions, Database Table: users, Personal Finance Tracker â€” Design Spec, Transactions Page

### Community 5 - "Auth & Routing"
Cohesion: 1.0
Nodes (4): src/App.jsx, src/router.jsx, Task 4: Auth Hook + Protected Routes, src/hooks/useAuth.js

### Community 6 - "Telegram Integration"
Cohesion: 0.5
Nodes (4): supabase/functions/telegram-bot/index.ts, Settings Page, Telegram Bot, Telegram Account Linking Flow

### Community 7 - "Security Policy"
Cohesion: 1.0
Nodes (2): Row Level Security (RLS), Rationale: RLS for Data Isolation

### Community 8 - "Scope Decisions"
Cohesion: 1.0
Nodes (2): Out of Scope Decisions, USD Fixed Currency

## Knowledge Gaps
- **9 isolated node(s):** `Responsive Navigation`, `Rationale: RLS for Data Isolation`, `Out of Scope Decisions`, `Project File Structure`, `Task 5: Login + Signup Pages` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Security Policy`** (2 nodes): `Row Level Security (RLS)`, `Rationale: RLS for Data Isolation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scope Decisions`** (2 nodes): `Out of Scope Decisions`, `USD Fixed Currency`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Personal Finance Tracker â€” Design Spec` connect `Core Data Model` to `Deployment & Client Layer`, `Project Scaffold & Plan`, `Database Schema & Categories`, `Charts & UI Pages`, `Telegram Integration`, `Security Policy`?**
  _High betweenness centrality (0.421) - this node is a cross-community bridge._
- **Why does `Personal Finance Tracker â€” Implementation Plan` connect `Project Scaffold & Plan` to `Deployment & Client Layer`, `Charts & UI Pages`, `Core Data Model`, `Auth & Routing`?**
  _High betweenness centrality (0.329) - this node is a cross-community bridge._
- **Why does `Supabase Backend (Auth + Postgres + Edge Functions)` connect `Deployment & Client Layer` to `Core Data Model`, `Telegram Integration`, `Security Policy`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `src/router.jsx` (e.g. with `Dashboard Page` and `Transactions Page`) actually correct?**
  _`src/router.jsx` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Database Table: transactions` (e.g. with `Dashboard Page` and `Transactions Page`) actually correct?**
  _`Database Table: transactions` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Responsive Navigation`, `Rationale: RLS for Data Isolation`, `Out of Scope Decisions` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
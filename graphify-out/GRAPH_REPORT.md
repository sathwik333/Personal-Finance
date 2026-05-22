# Graph Report - d:/Personal Finance  (2026-05-20)

## Corpus Check
- Corpus is ~22,516 words - fits in a single context window. You may not need a graph.

## Summary
- 141 nodes · 212 edges · 14 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.88)
- Token cost: 28,500 input · 4,800 output

## God Nodes (most connected - your core abstractions)
1. `Database Table: categories` - 11 edges
2. `useCategories Hook (src/hooks/useCategories.js)` - 8 edges
3. `useTransactions Hook (src/hooks/useTransactions.js)` - 8 edges
4. `Database Table: transactions` - 8 edges
5. `useAuth Hook (src/hooks/useAuth.js)` - 7 edges
6. `src/router.jsx (Protected Routes)` - 7 edges
7. `Dashboard Page (src/pages/Dashboard.jsx)` - 7 edges
8. `supabase/migrations/001_initial.sql` - 7 edges
9. `Recharts (Charting Library)` - 7 edges
10. `HexColorPicker UI Component (Color Wheel)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Personal Finance Tracker â€” Implementation Plan` --semantically_similar_to--> `Personal Finance Tracker â€” Design Spec`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `Graph Report â€” d:/Personal Finance (2026-04-21)` --references--> `Personal Finance Tracker â€” Implementation Plan`  [EXTRACTED]
  graphify-out/GRAPH_REPORT.md → docs/superpowers/plans/2026-04-21-personal-finance-app.md
- `Categories: Color Picker & Edit Feature â€” Implementation Plan` --semantically_similar_to--> `Categories: Color Picker & Edit Feature â€” Design Spec`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-04-29-categories-color-picker-edit.md → docs/superpowers/specs/2026-04-29-categories-color-picker-edit-design.md
- `Graph Report â€” d:/Personal Finance (2026-04-21)` --references--> `Personal Finance Tracker â€” Design Spec`  [EXTRACTED]
  graphify-out/GRAPH_REPORT.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md
- `useCategories Hook (src/hooks/useCategories.js)` --shares_data_with--> `Database Table: categories`  [INFERRED]
  docs/superpowers/plans/2026-04-21-personal-finance-app.md → docs/superpowers/specs/2026-04-21-personal-finance-design.md

## Hyperedges (group relationships)
- **Categories Color Picker & Edit Feature â€” Full Stack Flow** — react_colorful, hex_color_picker_ui, normalize_hex, update_category, use_categories_hook, categories_page, inline_edit_ui [EXTRACTED 0.95]
- **Supabase RLS + Auth + DB â€” Per-User Data Isolation** — rls_policy, supabase_backend, db_users, rationale_rls, migration_001 [EXTRACTED 0.95]
- **Telegram Bot Transaction Entry Flow** — telegram_bot, telegram_linking, settings_page, db_transactions, task13_telegram [EXTRACTED 0.90]

## Communities

### Community 0 - "App Routing and Pages"
Cohesion: 0.12
Nodes (0): 

### Community 1 - "Feature Implementation Tasks"
Cohesion: 0.15
Nodes (23): src/App.jsx, Categories Page (src/pages/Categories.jsx), CategoryBadge Component, Task 2: Add normalizeHex utility and tests (Color Picker Plan), Task 3: Add updateCategory to useCategories (Color Picker Plan), Task 4: Rewrite Categories.jsx with color wheel and inline edit (Color Picker Plan), computeSummary Function (exported from useTransactions), Dashboard Page (src/pages/Dashboard.jsx) (+15 more)

### Community 2 - "Database Schema and Deployment"
Cohesion: 0.22
Nodes (17): Database Table: budgets, Database Table: categories, Database Table: transactions, Database Table: users (auth.users), .github/workflows/deploy.yml (GitHub Actions), React Static SPA (GitHub Pages), supabase/migrations/001_initial.sql, Rationale: Zero-Cost Hosting (GitHub Pages + Supabase Free Tier) (+9 more)

### Community 3 - "Dashboard UI Components"
Cohesion: 0.13
Nodes (0): 

### Community 4 - "Transaction Logic and Utils"
Cohesion: 0.15
Nodes (4): computeSummary(), useTransactions(), src/lib/utils.test.js, Vitest (Test Framework)

### Community 5 - "Charts and Data Visualization"
Cohesion: 0.15
Nodes (8): SpendingBarChart Component, CSV Export Feature (Reports Page), Dark Mode UI Theme (Color System), DonutChart Component (src/components/DonutChart.jsx), TrendLineChart Component, Recharts (Charting Library), Reports Page (src/pages/Reports.jsx), Task 1: Project Scaffold

### Community 6 - "Telegram Bot"
Cohesion: 0.29
Nodes (0): 

### Community 7 - "Navigation Layout"
Cohesion: 0.33
Nodes (0): 

### Community 8 - "Plans and Design Docs"
Cohesion: 0.47
Nodes (6): Graph Report â€” d:/Personal Finance (2026-04-21), Out of Scope Decisions (OAuth, Bank Import, Multi-currency), Categories: Color Picker & Edit Feature â€” Implementation Plan, Personal Finance Tracker â€” Implementation Plan, Categories: Color Picker & Edit Feature â€” Design Spec, Personal Finance Tracker â€” Design Spec

### Community 9 - "Color Picker Feature"
Cohesion: 0.5
Nodes (5): Task 1: Install react-colorful (Color Picker Plan), 10-Swatch Color Picker (Removed), HexColorPicker UI Component (Color Wheel), Rationale: Color Wheel over Swatches (Full HSL Range), react-colorful (HexColorPicker Dependency)

### Community 10 - "Responsive Nav Components"
Cohesion: 0.67
Nodes (4): BottomNav Component (Mobile Tab Bar), Layout Component (src/components/Layout.jsx), Responsive Navigation (Mobile Bottom / Desktop Top), TopNav Component (Desktop Nav Bar)

### Community 11 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Test Setup"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **8 isolated node(s):** `StatCard Component`, `Rationale: RLS for Per-User Data Isolation`, `Out of Scope Decisions (OAuth, Bank Import, Multi-currency)`, `CSV Export Feature (Reports Page)`, `Task 1: Project Scaffold` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Setup`** (1 nodes): `test-setup.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Recharts (Charting Library)` connect `Charts and Data Visualization` to `Dashboard UI Components`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Why does `HexColorPicker UI Component (Color Wheel)` connect `Color Picker Feature` to `Feature Implementation Tasks`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `react-colorful (HexColorPicker Dependency)` connect `Color Picker Feature` to `App Routing and Pages`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Database Table: categories` (e.g. with `Categories Page (src/pages/Categories.jsx)` and `useCategories Hook (src/hooks/useCategories.js)`) actually correct?**
  _`Database Table: categories` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Database Table: transactions` (e.g. with `useTransactions Hook (src/hooks/useTransactions.js)` and `Dashboard Page (src/pages/Dashboard.jsx)`) actually correct?**
  _`Database Table: transactions` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `StatCard Component`, `Rationale: RLS for Per-User Data Isolation`, `Out of Scope Decisions (OAuth, Bank Import, Multi-currency)` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Routing and Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
# Personal Finance App — Feature Gaps Design

**Date:** 2026-05-20
**Goal:** Close the gap with Rocket Money by adding Budgets, Goals, recurring transaction tracking, transaction search, and date range filtering.

---

## 1. Navigation & Structure

Bottom nav becomes 5 tabs: **Dashboard · Transactions · Reports · Budgets · Goals**

- `/categories` route is kept but removed from both `BottomNav` and `TopNav` links
- Settings page gets a "Manage Categories" link that navigates to `/categories`
- `TopNav` (desktop) updated to show Budgets + Goals links instead of Categories
- **Mobile Settings access:** `TopNav` is currently `hidden md:flex` — Settings is inaccessible on mobile. Fix: make `TopNav` visible on mobile as a minimal strip (logo + settings gear icon only), hiding the nav links on small screens. This restores Settings access on mobile.
- New routes: `/budgets`, `/goals`

---

## 2. Budgets Page (`/budgets`)

### Data Model

New table `budgets`:
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references auth.users not null
category_id uuid references categories(id) on delete cascade not null
monthly_limit numeric(10,2) not null check (monthly_limit > 0)
created_at  timestamptz default now()
unique(user_id, category_id)
```

Spending per category is computed live from `transactions` for the current calendar month — no month column needed, budgets auto-reset naturally.

### UI

- Header: "Budgets" title + current month label (e.g. "May 2026")
- **Summary ring** (SVG donut): shows % of total budget used, center displays remaining amount; ring turns red when overall budget is exceeded
- **2-column status grid**: one tile per category that has a budget set
  - Green: spent < 80% of limit
  - Amber: spent 80–99% of limit
  - Red: spent ≥ 100% of limit
  - Each tile shows: category icon + name, `$spent / $limit`
  - Tap tile → inline edit to change the limit
- **"Set budget" button**: for categories without a budget; opens form (category picker + amount)
- Categories with no budget are not shown in the grid

### Hook

`useBudgets()` — two separate Supabase queries: (1) fetch all `budgets` for the user, (2) fetch all `transactions` for the current month where `type = 'expense'`, grouped client-side by `category_id` to compute `spent`. Returns `{ budgets, loading, error, addBudget, updateBudget, deleteBudget }`.

### RLS

Row Level Security enabled on `budgets`: users can only select/insert/update/delete their own rows (`user_id = auth.uid()`).

---

## 3. Goals Page (`/goals`)

### Data Model

New table `goals`:
```sql
id            uuid primary key default gen_random_uuid()
user_id       uuid references auth.users not null
name          text not null
emoji         text not null default '🎯'
target_amount numeric(10,2) not null check (target_amount > 0)
deadline      date
created_at    timestamptz default now()
```

New table `goal_deposits`:
```sql
id         uuid primary key default gen_random_uuid()
goal_id    uuid references goals(id) on delete cascade not null
user_id    uuid references auth.users not null
amount     numeric(10,2) not null check (amount > 0)
date       date not null default current_date
note       text
created_at timestamptz default now()
```

`current_amount` is always `SUM(goal_deposits.amount)` — never stored directly.

### UI

- Header: "Goals" title + total saved across all goals
- **2-column grid** of circular progress ring tiles (SVG)
  - Each tile: emoji, name, `$current / $target`, % ring, deadline badge if set
  - Ring color: purple normally, green when 100% complete
- Last tile: dashed "+ New goal" card
- **Tap a tile** → bottom sheet with:
  - Deposit history list (date, amount, note)
  - "Add deposit" button → form (amount + optional note + date)
  - Delete goal option (with confirmation)

### Hook

`useGoals()` — fetches `goals` rows, then fetches `goal_deposits` grouped by `goal_id` (or uses a Supabase view that sums deposits). Merges client-side to produce `goal.current_amount`. Returns `{ goals, loading, error, addGoal, deleteGoal, addDeposit, deleteDeposit }`.

### RLS

Row Level Security enabled on `goals` and `goal_deposits`: users can only access rows where `user_id = auth.uid()`.

---

## 4. Transaction Enhancements

### Database Change

New migration: add `is_recurring boolean default false` to `transactions` table.

### Search

- Search icon (🔍) added to Transactions page header, right of title
- Tapping expands an inline search bar below the header; X button to dismiss and clear
- Filters by `note` field client-side (case-insensitive contains) on already-fetched transactions
- No additional network requests needed

### Date Range Filter

- Compact date pill added to the right of the type-filter row (All / Expenses / Income)
- Options: **This Month** (default), **Last Month**, **Last 3 Months**, **All Time**
- Selecting a range passes updated `from`/`to` to `useTransactions`

### Recurring

- Toggle "Recurring transaction" added to `TransactionForm`
- `TransactionItem` shows 🔁 icon when `is_recurring = true`
- "Recurring" filter pill added alongside All / Expenses / Income
- Saves `is_recurring` field on create/update

---

## 5. Dashboard — Recurring Summary Card

New card inserted between stat cards and donut chart:

- Shows: 🔁 "Monthly Recurring" label, total sum of `is_recurring = true` expense transactions this month, count (e.g. "6 subscriptions")
- Tapping navigates to `/transactions` with Recurring filter pre-applied
- No new data fetching — computed from transactions already loaded on Dashboard

---

## 6. Settings — Categories Integration

- `/categories` route and page are unchanged functionally
- Settings page gets a "Manage Categories" row that navigates to `/categories`
- No functional changes to categories logic or the Categories page itself

---

## 7. New Files

| File | Purpose |
|------|---------|
| `src/pages/Budgets.jsx` | Budgets page |
| `src/pages/Goals.jsx` | Goals page |
| `src/hooks/useBudgets.js` | Budget data + spending computation |
| `src/hooks/useGoals.js` | Goals + deposits data |
| `src/components/BudgetRing.jsx` | SVG summary ring for Budgets page |
| `src/components/GoalRing.jsx` | SVG circular progress ring for goal tiles |
| `src/components/GoalSheet.jsx` | Bottom sheet for goal detail + deposits |
| `supabase/migrations/007_budgets_goals_recurring.sql` | All DB changes |

## 8. Modified Files

| File | Change |
|------|--------|
| `src/router.jsx` | Add `/budgets`, `/goals` routes |
| `src/components/BottomNav.jsx` | Replace Categories tab with Budgets + Goals |
| `src/components/TopNav.jsx` | Replace Categories link with Budgets + Goals; show logo+gear on mobile |
| `src/pages/Settings.jsx` | Add "Manage Categories" nav row |
| `src/pages/Transactions.jsx` | Add search, date range, recurring filter |
| `src/components/TransactionForm.jsx` | Add recurring toggle |
| `src/components/TransactionItem.jsx` | Show recurring icon |
| `src/pages/Dashboard.jsx` | Add recurring summary card |
| `src/hooks/useTransactions.js` | Pass `is_recurring` in insert/update |

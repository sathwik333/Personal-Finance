# Personal Finance Tracker — Design Spec
**Date:** 2026-04-21  
**Status:** Approved

---

## Overview

A personal finance web app for 2 independent users. Each user has a private account — no shared data. Users can track income and expenses, view spending by category, and get weekly/monthly reports with charts. Transactions can be entered via the web app or a Telegram bot.

---

## Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | React (static export) on GitHub Pages | Free forever |
| Auth + Database | Supabase (Postgres + RLS) | Free tier |
| Telegram Bot | Supabase Edge Function (webhook) | Free tier |

**No Vercel. No paid services.**

---

## Architecture

```
GitHub Pages          Supabase
─────────────         ──────────────────────────────
React App     ──────► Auth (email + password)
(static)      ──────► Database (Postgres + RLS)
                      Edge Function ◄── Telegram Bot
                            │
                            └──► writes to Database
```

- React app communicates directly with Supabase for all reads/writes
- Telegram webhook is a Supabase Edge Function
- Row Level Security (RLS) enforces data isolation at the database level — `user_id = auth.uid()` on every table
- Telegram linking: user runs `/start` in bot → receives a one-time code → pastes it in web app Settings → their Telegram chat ID is stored on their profile

---

## Database Schema

```sql
-- Managed by Supabase Auth
users
  id uuid
  email text
  created_at timestamptz
  telegram_chat_id bigint  -- set when Telegram account is linked

-- User transactions
transactions
  id uuid
  user_id uuid  -- FK to auth.users
  amount decimal(10,2)
  type text  -- 'expense' | 'income'
  category_id uuid  -- FK to categories
  note text  -- optional
  date date  -- defaults to today
  created_at timestamptz

-- System defaults (user_id = null) + user custom categories
categories
  id uuid
  user_id uuid  -- null = system default, uuid = user's custom
  name text
  icon text  -- emoji
  color text  -- hex color

-- Optional monthly spending limits per category
budgets
  id uuid
  user_id uuid
  category_id uuid
  monthly_limit decimal(10,2)
  month date  -- first day of the month
```

**Default categories (system-seeded):**
Food 🍔, Transport 🚗, Rides 🛵, Shopping 🛍️, Bills 🧾, Health 🏥, Entertainment 🎬, Education 📚, Other 📦

**RLS:** All tables enforce `user_id = auth.uid()`. No user can read or write another user's data.

---

## Features & Pages

### 1. Dashboard
- Monthly balance (income − expenses)
- 3 stat cards: Total Spent, Total Income, Top Category
- Donut chart: spending by category (current month)
- Recent transactions list (last 5)
- Floating `+` Add Transaction button

### 2. Transactions
- Full transaction list — filterable by date range, category, type (income/expense)
- Add transaction form: amount, type, category, date (defaults today), note
- Edit and delete any transaction

### 3. Reports
- Toggle: Weekly / Monthly view
- Bar chart: spending per category over time
- Line chart: daily spending trend
- Month-over-month comparison text (e.g. "You spent $120 more on Food than last month")
- Export to CSV

### 4. Categories
- View all default + custom categories
- Add custom: name + emoji + color
- Delete custom categories (system defaults are protected)

### 5. Settings
- Email and password management
- Telegram bot linking (link code display + connection status)
- Danger zone: delete all my data

---

## Telegram Bot

**Commands:**
| Command | Action |
|---|---|
| `/start` | Generates one-time link code to connect Telegram to web account |
| `spent 45 food lunch` | Logs $45 expense in Food, note: "lunch" |
| `income 2000 salary` | Logs $2000 income, note: "salary" |
| `/summary` | Returns current month total spent, income, and balance |
| `/categories` | Lists all available categories |

**Message parsing:** Edge Function uses simple NLP — `[spent|income] [amount] [category] [optional note]`. If parsing fails, bot replies with a usage hint.

**Security:** Edge Function verifies Telegram webhook secret header before processing any message.

---

## UI/UX

**Theme:** Dark-mode first, clean and minimal.

**Color system:**
- Background: `#0F1117`
- Card surface: `#1A1D27`
- Accent: `#6366F1` (indigo)
- Income: `#10B981` (emerald)
- Expense: `#F43F5E` (rose)
- Text primary: white
- Text secondary: `#94A3B8`

**Typography:** Inter

**Charts:** Recharts — animated, hover tooltips, consistent category colors across all views.

**Navigation:**
- Mobile: bottom tab bar (Dashboard, Transactions, Reports, Categories)
- Desktop: top navigation bar
- Fully responsive

**Forms:** Slide-up sheet on mobile, modal on desktop.

**Dashboard layout:**
```
┌─────────────────────────────────┐
│  Balance: $1,240.00      👤     │
├──────────┬──────────┬───────────┤
│ Spent    │ Income   │ Top Cat   │
│ $860     │ $2,100   │ 🍔 Food  │
├──────────┴──────────┴───────────┤
│        Donut Chart              │
├─────────────────────────────────┤
│  Recent Transactions            │
│  🍔 Food    Lunch     -$12.50   │
│  🛵 Rides   Uber       -$8.00   │
│  💰 Salary             +$2,100  │
└─────────────────────────────────┘
[+]  ← floating action button
```

---

## Currency

USD ($) — fixed for now, extensible later.

---

## Out of Scope

- OAuth / social login (email + password only)
- Bank import / CSV import (manual entry only)
- Multi-currency
- Shared budgets between users
- Mobile native app

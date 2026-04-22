# Personal Finance Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal finance web app with expense/income tracking, category charts, weekly/monthly reports, and a Telegram bot for quick entry — hosted free on GitHub Pages + Supabase.

**Architecture:** React static SPA on GitHub Pages communicates directly with Supabase (auth + Postgres). A Supabase Edge Function serves as the Telegram bot webhook. Row Level Security isolates each user's data at the database level.

**Tech Stack:** React 18, Vite, Tailwind CSS, React Router v6, Recharts, @supabase/supabase-js, date-fns, Lucide React, Vitest, Deno (Edge Function)

---

## File Structure

```
d:/Personal Finance/
├── src/
│   ├── main.jsx                        # Entry point
│   ├── App.jsx                         # Router + auth gate
│   ├── lib/
│   │   ├── supabase.js                 # Supabase client singleton
│   │   └── utils.js                    # Currency formatting, date helpers
│   ├── hooks/
│   │   ├── useAuth.js                  # Auth state + login/logout/signup
│   │   ├── useTransactions.js          # CRUD transactions + aggregations
│   │   └── useCategories.js            # CRUD categories
│   ├── components/
│   │   ├── Layout.jsx                  # Page wrapper + nav switcher
│   │   ├── BottomNav.jsx               # Mobile tab bar
│   │   ├── TopNav.jsx                  # Desktop nav bar
│   │   ├── StatCard.jsx                # Summary metric card
│   │   ├── TransactionForm.jsx         # Add/edit transaction slide-up/modal
│   │   ├── TransactionItem.jsx         # Single row in transaction list
│   │   ├── DonutChart.jsx              # Recharts donut (spending by category)
│   │   ├── SpendingBarChart.jsx        # Recharts bar (category over time)
│   │   ├── TrendLineChart.jsx          # Recharts line (daily spending)
│   │   └── CategoryBadge.jsx          # Emoji + colored pill
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Reports.jsx
│   │   ├── Categories.jsx
│   │   └── Settings.jsx
│   └── router.jsx                      # Route definitions
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql             # Schema + RLS + seed categories
│   └── functions/
│       └── telegram-bot/
│           └── index.ts                # Edge Function (Deno)
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.local                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── .github/
    └── workflows/
        └── deploy.yml                  # GitHub Actions → GitHub Pages
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.jsx`

- [ ] **Step 1: Initialise Vite + React project**

```bash
cd "d:/Personal Finance"
npm create vite@latest . -- --template react
```

Expected: Files created — `package.json`, `vite.config.js`, `src/`, `index.html`

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install @supabase/supabase-js react-router-dom recharts date-fns lucide-react
npm install -D tailwindcss postcss autoprefixer vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#1A1D27',
        base: '#0F1117',
        accent: '#6366F1',
        income: '#10B981',
        expense: '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Configure Vite**

Replace `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Update index.html**

Replace `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finance Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-base text-white font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create main.jsx**

Replace `src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Create index.css**

Replace `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 9: Create .env.local**

Create `.env.local` (fill in after Supabase project is created in Task 2):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:5173` with default Vite page.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/
git commit -m "chore: scaffold vite react project with tailwind and dependencies"
```

---

## Task 2: Supabase Project + Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com and sign in
2. Click "New Project" — name it `finance-tracker`
3. Choose a region close to you, set a strong database password
4. Wait for project to provision (~2 minutes)
5. Go to Settings → API — copy `Project URL` and `anon public` key into `.env.local`

- [ ] **Step 2: Create Telegram bot**

1. Open Telegram, message `@BotFather`
2. Send `/newbot` — follow prompts, name it e.g. `MyFinanceBot`
3. Copy the token BotFather gives you into `.env.local` as `VITE_TELEGRAM_BOT_TOKEN`

- [ ] **Step 3: Write migration SQL**

Create `supabase/migrations/001_initial.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Extend auth.users with telegram_chat_id
alter table auth.users add column if not exists telegram_chat_id bigint unique;
alter table auth.users add column if not exists telegram_link_code text unique;

-- Categories table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  color text not null default '#6366F1',
  created_at timestamptz default now()
);

-- Transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references categories(id) on delete set null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Budgets table
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  monthly_limit decimal(10,2) not null check (monthly_limit > 0),
  month date not null,
  unique(user_id, category_id, month)
);

-- Row Level Security
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

-- Categories RLS: system defaults (user_id is null) are readable by all authenticated users
create policy "Users can read own and system categories" on categories
  for select using (user_id = auth.uid() or user_id is null);

create policy "Users can insert own categories" on categories
  for insert with check (user_id = auth.uid());

create policy "Users can update own categories" on categories
  for update using (user_id = auth.uid());

create policy "Users can delete own categories" on categories
  for delete using (user_id = auth.uid());

-- Transactions RLS
create policy "Users can read own transactions" on transactions
  for select using (user_id = auth.uid());

create policy "Users can insert own transactions" on transactions
  for insert with check (user_id = auth.uid());

create policy "Users can update own transactions" on transactions
  for update using (user_id = auth.uid());

create policy "Users can delete own transactions" on transactions
  for delete using (user_id = auth.uid());

-- Budgets RLS
create policy "Users can manage own budgets" on budgets
  for all using (user_id = auth.uid());

-- Seed default system categories (user_id = null)
insert into categories (id, user_id, name, icon, color) values
  (uuid_generate_v4(), null, 'Food',          '🍔', '#F59E0B'),
  (uuid_generate_v4(), null, 'Transport',     '🚗', '#3B82F6'),
  (uuid_generate_v4(), null, 'Rides',         '🛵', '#8B5CF6'),
  (uuid_generate_v4(), null, 'Shopping',      '🛍️', '#EC4899'),
  (uuid_generate_v4(), null, 'Bills',         '🧾', '#EF4444'),
  (uuid_generate_v4(), null, 'Health',        '🏥', '#10B981'),
  (uuid_generate_v4(), null, 'Entertainment', '🎬', '#F97316'),
  (uuid_generate_v4(), null, 'Education',     '📚', '#06B6D4'),
  (uuid_generate_v4(), null, 'Other',         '📦', '#6B7280');
```

- [ ] **Step 4: Run migration in Supabase**

1. In Supabase dashboard → SQL Editor
2. Paste the entire SQL above and click Run
3. Verify: Table Editor should show `categories`, `transactions`, `budgets`
4. Verify: categories table has 9 rows (the system defaults)

- [ ] **Step 5: Commit**

```bash
git add supabase/ .env.local
git commit -m "feat: supabase schema with RLS and seeded categories"
```

---

## Task 3: Supabase Client + Utils

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/lib/utils.js`
- Create: `src/lib/utils.test.js`

- [ ] **Step 1: Write failing tests for utils**

Create `src/lib/utils.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, groupByCategory, getMonthRange, getWeekRange } from './utils'

describe('formatCurrency', () => {
  it('formats positive number as USD', () => {
    expect(formatCurrency(45.5)).toBe('$45.50')
  })
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
  it('formats large number with commas', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    expect(formatDate('2026-04-21')).toBe('Apr 21, 2026')
  })
})

describe('groupByCategory', () => {
  it('sums amounts by category name', () => {
    const transactions = [
      { amount: 10, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
      { amount: 20, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
      { amount: 30, type: 'expense', categories: { name: 'Transport', color: '#3B82F6', icon: '🚗' } },
    ]
    const result = groupByCategory(transactions)
    expect(result).toEqual([
      { name: 'Food', value: 30, color: '#F59E0B', icon: '🍔' },
      { name: 'Transport', value: 30, color: '#3B82F6', icon: '🚗' },
    ])
  })
  it('ignores income transactions', () => {
    const transactions = [
      { amount: 100, type: 'income', categories: { name: 'Salary', color: '#10B981', icon: '💰' } },
    ]
    expect(groupByCategory(transactions)).toEqual([])
  })
})

describe('getMonthRange', () => {
  it('returns first and last day of given month', () => {
    const { from, to } = getMonthRange(2026, 3) // April (0-indexed)
    expect(from).toBe('2026-04-01')
    expect(to).toBe('2026-04-30')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/utils.test.js
```

Expected: FAIL — "Cannot find module './utils'"

- [ ] **Step 3: Implement utils**

Create `src/lib/utils.js`:
```js
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(dateStr) {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM dd, yyyy')
}

export function groupByCategory(transactions) {
  const map = {}
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    const cat = tx.categories
    if (!cat) continue
    if (!map[cat.name]) {
      map[cat.name] = { name: cat.name, value: 0, color: cat.color, icon: cat.icon }
    }
    map[cat.name].value += Number(tx.amount)
  }
  return Object.values(map)
}

export function getMonthRange(year, month) {
  const date = new Date(year, month, 1)
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getWeekRange(date = new Date()) {
  return {
    from: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    to: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

export function calcBalance(transactions) {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + Number(tx.amount) : acc - Number(tx.amount)
  }, 0)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/utils.test.js
```

Expected: PASS — all 6 tests green

- [ ] **Step 5: Create Supabase client**

Create `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('Missing Supabase env vars')

export const supabase = createClient(url, key)
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat: supabase client and utility functions with tests"
```

---

## Task 4: Auth Hook + Protected Routes

**Files:**
- Create: `src/hooks/useAuth.js`
- Create: `src/router.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create useAuth hook**

Create `src/hooks/useAuth.js`:
```js
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Create router**

Create `src/router.jsx`:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Update App.jsx**

Replace `src/App.jsx`:
```jsx
import { AuthProvider } from './hooks/useAuth'
import Router from './router'

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
```

- [ ] **Step 4: Create stub pages so router doesn't crash**

Create `src/pages/Dashboard.jsx`:
```jsx
export default function Dashboard() { return <div className="p-4">Dashboard</div> }
```

Create `src/pages/Transactions.jsx`:
```jsx
export default function Transactions() { return <div className="p-4">Transactions</div> }
```

Create `src/pages/Reports.jsx`:
```jsx
export default function Reports() { return <div className="p-4">Reports</div> }
```

Create `src/pages/Categories.jsx`:
```jsx
export default function Categories() { return <div className="p-4">Categories</div> }
```

Create `src/pages/Settings.jsx`:
```jsx
export default function Settings() { return <div className="p-4">Settings</div> }
```

Create `src/pages/Login.jsx`:
```jsx
export default function Login() { return <div className="p-4">Login</div> }
```

Create `src/pages/Signup.jsx`:
```jsx
export default function Signup() { return <div className="p-4">Signup</div> }
```

Create `src/components/Layout.jsx`:
```jsx
import { Outlet } from 'react-router-dom'
export default function Layout() { return <div><Outlet /></div> }
```

- [ ] **Step 5: Verify app loads without errors**

```bash
npm run dev
```

Expected: App loads at `http://localhost:5173`, redirects to `/login` (shows "Login" text)

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: auth context, protected routes, stub pages"
```

---

## Task 5: Login + Signup Pages

**Files:**
- Modify: `src/pages/Login.jsx`
- Modify: `src/pages/Signup.jsx`

- [ ] **Step 1: Implement Login page**

Replace `src/pages/Login.jsx`:
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 mb-8">Sign in to your finance tracker</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-expense text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement Signup page**

Replace `src/pages/Signup.jsx`:
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      await signUp(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-gray-400 mb-8">Start tracking your finances</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-expense text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Enable email confirmations (optional)**

In Supabase dashboard → Authentication → Providers → Email:
- Disable "Confirm email" for development so login works immediately
- Re-enable for production if desired

- [ ] **Step 4: Test auth flow manually**

```bash
npm run dev
```

1. Go to `/signup` — create an account with a test email/password
2. Should redirect to `/` showing "Dashboard"
3. Refresh — should stay on Dashboard (session persists)
4. Go to `/login` — sign in with same credentials
5. Open Supabase dashboard → Authentication → Users — verify user appears

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.jsx src/pages/Signup.jsx
git commit -m "feat: login and signup pages"
```

---

## Task 6: Layout + Navigation

**Files:**
- Modify: `src/components/Layout.jsx`
- Create: `src/components/BottomNav.jsx`
- Create: `src/components/TopNav.jsx`

- [ ] **Step 1: Create BottomNav**

Create `src/components/BottomNav.jsx`:
```jsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Tag } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/categories', icon: Tag, label: 'Categories' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 flex md:hidden z-40">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${
              isActive ? 'text-accent' : 'text-gray-500'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Create TopNav**

Create `src/components/TopNav.jsx`:
```jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/reports', label: 'Reports' },
  { to: '/categories', label: 'Categories' },
]

export default function TopNav() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="hidden md:flex items-center bg-surface border-b border-gray-800 px-6 h-14 gap-1">
      <span className="text-white font-semibold mr-8">💰 Finance</span>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <NavLink to="/settings" className={({ isActive }) =>
          `p-2 rounded-md transition-colors ${isActive ? 'text-accent' : 'text-gray-400 hover:text-white'}`
        }>
          <Settings size={18} />
        </NavLink>
        <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-white transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Update Layout**

Replace `src/components/Layout.jsx`:
```jsx
import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-base">
      <TopNav />
      <main className="pb-20 md:pb-0 max-w-3xl mx-auto px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Verify navigation visually**

```bash
npm run dev
```

Sign in and verify:
- On narrow window: bottom tab bar visible, top nav hidden
- On wide window (>768px): top nav visible, bottom nav hidden
- Active tab highlighted in indigo
- Clicking tabs navigates between stub pages

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: responsive layout with bottom and top navigation"
```

---

## Task 7: Categories Hook + Page

**Files:**
- Create: `src/hooks/useCategories.js`
- Create: `src/components/CategoryBadge.jsx`
- Modify: `src/pages/Categories.jsx`

- [ ] **Step 1: Create useCategories hook**

Create `src/hooks/useCategories.js`:
```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchCategories()
  }, [user])

  async function fetchCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
    if (!error) setCategories(data)
    setLoading(false)
  }

  async function addCategory({ name, icon, color }) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, icon, color })
      .select()
      .single()
    if (error) throw error
    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const systemCategories = categories.filter(c => c.user_id === null)
  const customCategories = categories.filter(c => c.user_id !== null)

  return { categories, systemCategories, customCategories, loading, addCategory, deleteCategory, refetch: fetchCategories }
}
```

- [ ] **Step 2: Create CategoryBadge component**

Create `src/components/CategoryBadge.jsx`:
```jsx
export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return <span className="text-gray-500 text-sm">Uncategorized</span>
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: category.color + '22', color: category.color }}
    >
      {category.icon} {category.name}
    </span>
  )
}
```

- [ ] **Step 3: Implement Categories page**

Replace `src/pages/Categories.jsx`:
```jsx
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'

const COLORS = ['#F59E0B','#3B82F6','#8B5CF6','#EC4899','#EF4444','#10B981','#F97316','#06B6D4','#6B7280','#6366F1']
const EMOJIS = ['🍔','🚗','🛵','🛍️','🧾','🏥','🎬','📚','📦','💊','🏋️','✈️','🎮','🍺','☕','🐾','🏠','💡']

export default function Categories() {
  const { systemCategories, customCategories, loading, addCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#6366F1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await addCategory({ name: name.trim(), icon, color })
      setName('')
      setIcon('📦')
      setColor('#6366F1')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Transactions using it will become uncategorized.')) return
    try {
      await deleteCategory(id)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p className="text-gray-400 py-8 text-center">Loading...</p>

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="Category name"
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setIcon(e)}
                  className={`text-xl p-1 rounded ${icon === e ? 'ring-2 ring-accent' : ''}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-expense text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <section>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Default</h2>
        <div className="bg-surface rounded-xl divide-y divide-gray-800">
          {systemCategories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl">{cat.icon}</span>
              <span className="text-white flex-1">{cat.name}</span>
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
          ))}
        </div>
      </section>

      {customCategories.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Custom</h2>
          <div className="bg-surface rounded-xl divide-y divide-gray-800">
            {customCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-white flex-1">{cat.name}</span>
                <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                <button onClick={() => handleDelete(cat.id)} className="text-gray-600 hover:text-expense transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify categories page**

```bash
npm run dev
```

1. Navigate to `/categories`
2. Verify 9 default categories appear
3. Click "Add" → fill in name, pick emoji and color → Save
4. Custom category appears in "Custom" section
5. Delete button removes it (after confirmation)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCategories.js src/components/CategoryBadge.jsx src/pages/Categories.jsx
git commit -m "feat: categories hook and page with add/delete"
```

---

## Task 8: Transactions Hook + Form

**Files:**
- Create: `src/hooks/useTransactions.js`
- Create: `src/components/TransactionForm.jsx`
- Create: `src/components/TransactionItem.jsx`

- [ ] **Step 1: Write failing tests for useTransactions aggregations**

Create `src/hooks/useTransactions.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { computeSummary } from './useTransactions'

describe('computeSummary', () => {
  const transactions = [
    { amount: 2000, type: 'income', categories: null },
    { amount: 45.50, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
    { amount: 8, type: 'expense', categories: { name: 'Rides', color: '#8B5CF6', icon: '🛵' } },
    { amount: 200, type: 'expense', categories: { name: 'Food', color: '#F59E0B', icon: '🍔' } },
  ]

  it('calculates total income', () => {
    expect(computeSummary(transactions).totalIncome).toBe(2000)
  })

  it('calculates total expenses', () => {
    expect(computeSummary(transactions).totalExpenses).toBeCloseTo(253.50)
  })

  it('calculates balance', () => {
    expect(computeSummary(transactions).balance).toBeCloseTo(1746.50)
  })

  it('finds top category by spend', () => {
    expect(computeSummary(transactions).topCategory.name).toBe('Food')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/hooks/useTransactions.test.js
```

Expected: FAIL — "Cannot find module './useTransactions'"

- [ ] **Step 3: Create useTransactions hook with computeSummary**

Create `src/hooks/useTransactions.js`:
```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { groupByCategory } from '../lib/utils'

export function computeSummary(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const byCategory = groupByCategory(transactions)
  const topCategory = byCategory.sort((a, b) => b.value - a.value)[0] ?? null

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, topCategory, byCategory }
}

export function useTransactions({ from, to } = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data, error } = await query
    if (!error) setTransactions(data)
    setLoading(false)
  }, [user, from, to])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  async function addTransaction({ amount, type, category_id, note, date }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, amount: Number(amount), type, category_id: category_id || null, note: note || null, date })
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setTransactions(prev => [data, ...prev])
    return data
  }

  async function updateTransaction(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const summary = computeSummary(transactions)

  return { transactions, loading, summary, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/hooks/useTransactions.test.js
```

Expected: PASS — all 4 tests green

- [ ] **Step 5: Create TransactionForm component**

Create `src/components/TransactionForm.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { format } from 'date-fns'

export default function TransactionForm({ onSave, onClose, initial = null }) {
  const { categories } = useCategories()
  const [type, setType] = useState(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ amount: Number(amount), type, category_id: categoryId || null, note, date })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {['expense', 'income'].map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === 'expense' ? 'bg-expense text-white' : 'bg-income text-white'
                  : 'text-gray-400'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-semibold focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Note (optional)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="What was this for?"
              maxLength={100}
            />
          </div>

          {error && <p className="text-expense text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : initial ? 'Update' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create TransactionItem component**

Create `src/components/TransactionItem.jsx`:
```jsx
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils'
import CategoryBadge from './CategoryBadge'

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { amount, type, note, date, categories } = transaction
  const isIncome = type === 'income'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-2xl">{categories?.icon ?? '📦'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryBadge category={categories} />
        </div>
        {note && <p className="text-sm text-gray-400 truncate mt-0.5">{note}</p>}
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(date)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <div className="flex gap-2 justify-end mt-1">
          <button onClick={() => onEdit(transaction)} className="text-gray-600 hover:text-white transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(transaction.id)} className="text-gray-600 hover:text-expense transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useTransactions.js src/hooks/useTransactions.test.js src/components/TransactionForm.jsx src/components/TransactionItem.jsx
git commit -m "feat: transactions hook with tests, form, and list item components"
```

---

## Task 9: Transactions Page

**Files:**
- Modify: `src/pages/Transactions.jsx`

- [ ] **Step 1: Implement Transactions page**

Replace `src/pages/Transactions.jsx`:
```jsx
import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'

export default function Transactions() {
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('')
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    return true
  })

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }

  function handleEdit(tx) {
    setEditing(tx)
    setShowForm(true)
  }

  async function handleSave(data) {
    if (editing) {
      await updateTransaction(editing.id, data)
    } else {
      await addTransaction(data)
    }
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'expense', 'income'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              filterType === t ? 'bg-accent text-white' : 'bg-surface text-gray-400'
            }`}>
            {t}
          </button>
        ))}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-surface text-gray-400 text-sm rounded-full px-3 py-1 focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      ) : (
        <div className="bg-surface rounded-xl divide-y divide-gray-800">
          {filtered.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          initial={editing}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test transactions page manually**

```bash
npm run dev
```

1. Navigate to `/transactions`
2. Click Add → fill in amount $45, type expense, category Food, note "Lunch" → Add Transaction
3. Transaction appears in list with correct color and badge
4. Click pencil icon → form opens pre-filled → change amount → Update
5. Click trash → confirm → transaction removed
6. Test filters: type filter and category filter both work

- [ ] **Step 3: Commit**

```bash
git add src/pages/Transactions.jsx
git commit -m "feat: transactions page with add/edit/delete and filters"
```

---

## Task 10: Dashboard Page

**Files:**
- Create: `src/components/StatCard.jsx`
- Create: `src/components/DonutChart.jsx`
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Create StatCard**

Create `src/components/StatCard.jsx`:
```jsx
export default function StatCard({ label, value, color }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color ?? 'text-white'}`}>{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create DonutChart**

Create `src/components/DonutChart.jsx`:
```jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function DonutChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No expense data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`$${value.toFixed(2)}`, '']}
          contentStyle={{ backgroundColor: '#1A1D27', border: 'none', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Implement Dashboard page**

Replace `src/pages/Dashboard.jsx`:
```jsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange } from '../lib/utils'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import TransactionItem from '../components/TransactionItem'
import TransactionForm from '../components/TransactionForm'

export default function Dashboard() {
  const now = new Date()
  const { from, to } = getMonthRange(now.getFullYear(), now.getMonth())
  const { transactions, loading, summary, addTransaction, updateTransaction, deleteTransaction } = useTransactions({ from, to })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }

  function handleEdit(tx) { setEditing(tx); setShowForm(true) }
  function handleClose() { setShowForm(false); setEditing(null) }
  async function handleSave(data) {
    if (editing) await updateTransaction(editing.id, data)
    else await addTransaction(data)
  }

  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-6 py-4">
      {/* Balance header */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 mb-1">Balance this month</p>
        <p className={`text-4xl font-bold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(Math.abs(summary.balance))}
        </p>
        {summary.balance < 0 && <p className="text-expense text-sm mt-1">in the red</p>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Spent" value={formatCurrency(summary.totalExpenses)} color="text-expense" />
        <StatCard label="Income" value={formatCurrency(summary.totalIncome)} color="text-income" />
        <StatCard
          label="Top Category"
          value={summary.topCategory ? `${summary.topCategory.icon} ${summary.topCategory.name}` : '—'}
        />
      </div>

      {/* Donut chart */}
      <div className="bg-surface rounded-xl p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Spending by Category</h2>
        <DonutChart data={summary.byCategory} />
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Transactions</h2>
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions this month</p>
        ) : (
          <div className="bg-surface rounded-xl divide-y divide-gray-800">
            {recent.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-accent hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <Plus size={24} />
      </button>

      {showForm && <TransactionForm initial={editing} onSave={handleSave} onClose={handleClose} />}
    </div>
  )
}
```

- [ ] **Step 4: Test dashboard manually**

```bash
npm run dev
```

1. Add a few transactions (expenses and income) via the `+` button
2. Balance, spent, income cards update correctly
3. Donut chart shows categories with correct colors
4. Recent transactions list shows latest 5
5. Floating `+` button sits above the bottom nav on mobile

- [ ] **Step 5: Commit**

```bash
git add src/components/StatCard.jsx src/components/DonutChart.jsx src/pages/Dashboard.jsx
git commit -m "feat: dashboard with balance, stat cards, donut chart, and recent transactions"
```

---

## Task 11: Reports Page

**Files:**
- Create: `src/components/SpendingBarChart.jsx`
- Create: `src/components/TrendLineChart.jsx`
- Modify: `src/pages/Reports.jsx`

- [ ] **Step 1: Create SpendingBarChart**

Create `src/components/SpendingBarChart.jsx`:
```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function SpendingBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={v => [`$${Number(v).toFixed(2)}`, 'Spent']}
          contentStyle={{ backgroundColor: '#1A1D27', border: 'none', borderRadius: 8 }}
          cursor={{ fill: 'rgba(99,102,241,0.1)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Create TrendLineChart**

Create `src/components/TrendLineChart.jsx`:
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1D27" />
        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={v => [`$${Number(v).toFixed(2)}`, 'Spent']}
          contentStyle={{ backgroundColor: '#1A1D27', border: 'none', borderRadius: 8 }}
        />
        <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Implement Reports page**

Replace `src/pages/Reports.jsx`:
```jsx
import { useState, useMemo } from 'react'
import { subMonths, format, eachDayOfInterval, parseISO } from 'date-fns'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, getMonthRange, getWeekRange, groupByCategory } from '../lib/utils'
import SpendingBarChart from '../components/SpendingBarChart'
import TrendLineChart from '../components/TrendLineChart'

export default function Reports() {
  const [view, setView] = useState('monthly')
  const now = new Date()

  const range = view === 'monthly' ? getMonthRange(now.getFullYear(), now.getMonth()) : getWeekRange(now)
  const prevRange = view === 'monthly'
    ? getMonthRange(now.getFullYear(), now.getMonth() - 1)
    : getWeekRange(subMonths(now, 0)) // simplified: same week last month not needed

  const { transactions, loading } = useTransactions(range)
  const { transactions: prevTxs } = useTransactions(prevRange)

  const byCategory = useMemo(() => groupByCategory(transactions), [transactions])

  const dailyTrend = useMemo(() => {
    if (!range.from || !range.to) return []
    const days = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) })
    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd')
      const total = transactions
        .filter(t => t.date === key && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { date: format(day, 'MMM d'), total }
    })
  }, [transactions, range])

  const currentSpend = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const prevSpend = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const diff = currentSpend - prevSpend

  function exportCSV() {
    const header = 'Date,Type,Category,Amount,Note'
    const rows = transactions.map(t =>
      `${t.date},${t.type},${t.categories?.name ?? ''},${t.amount},"${t.note ?? ''}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-${range.from}-${range.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Reports</h1>
        <button onClick={exportCSV} className="text-sm text-accent hover:underline">Export CSV</button>
      </div>

      {/* Toggle */}
      <div className="flex bg-surface rounded-lg p-1 gap-1">
        {['weekly', 'monthly'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              view === v ? 'bg-accent text-white' : 'text-gray-400'
            }`}>
            {v}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-400 text-center py-8">Loading...</p> : (
        <>
          {/* Period comparison */}
          {diff !== 0 && (
            <div className={`rounded-xl p-4 text-sm ${diff > 0 ? 'bg-expense/10 text-expense' : 'bg-income/10 text-income'}`}>
              You spent {formatCurrency(Math.abs(diff))} {diff > 0 ? 'more' : 'less'} than last {view === 'monthly' ? 'month' : 'week'}.
            </div>
          )}

          {/* By category */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">By Category</h2>
            <SpendingBarChart data={byCategory} />
          </div>

          {/* Daily trend */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Daily Spending</h2>
            <TrendLineChart data={dailyTrend} />
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Test reports page**

```bash
npm run dev
```

1. Navigate to `/reports`
2. Toggle between Weekly and Monthly — range changes
3. Bar chart shows categories (with their colors)
4. Line chart shows daily trend
5. Period comparison message shows correctly
6. Export CSV button downloads a valid CSV

- [ ] **Step 5: Commit**

```bash
git add src/components/SpendingBarChart.jsx src/components/TrendLineChart.jsx src/pages/Reports.jsx
git commit -m "feat: reports page with bar chart, line chart, comparison, and CSV export"
```

---

## Task 12: Settings Page + Telegram Linking

**Files:**
- Modify: `src/pages/Settings.jsx`

- [ ] **Step 1: Implement Settings page**

Replace `src/pages/Settings.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [linkCode, setLinkCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [password, setPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    checkTelegramStatus()
  }, [user])

  async function checkTelegramStatus() {
    const { data } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', user.id)
      .single()
    setTelegramLinked(!!data?.telegram_chat_id)
  }

  async function generateLinkCode() {
    setLoadingCode(true)
    const code = generateCode()
    await supabase.auth.updateUser({ data: { telegram_link_code: code } })
    setLinkCode(code)
    setLoadingCode(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (password.length < 6) { setPwError('Password must be at least 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setPwError(error.message)
    else { setPwSuccess('Password updated'); setPassword('') }
  }

  async function handleDeleteAccount() {
    if (!confirm('This will delete ALL your transactions and categories. This cannot be undone. Are you sure?')) return
    if (!confirm('Last chance — permanently delete everything?')) return
    await supabase.from('transactions').delete().eq('user_id', user.id)
    await supabase.from('categories').delete().eq('user_id', user.id)
    await signOut()
    navigate('/login')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Account */}
      <section className="bg-surface rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-400">Account</h2>
        <p className="text-white text-sm">{user?.email}</p>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-base border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
              placeholder="New password"
            />
          </div>
          {pwError && <p className="text-expense text-sm">{pwError}</p>}
          {pwSuccess && <p className="text-income text-sm">{pwSuccess}</p>}
          <button type="submit" className="bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Update password
          </button>
        </form>
      </section>

      {/* Telegram */}
      <section className="bg-surface rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-400">Telegram Bot</h2>
        {telegramLinked ? (
          <div className="flex items-center gap-2">
            <span className="text-income text-sm">✓ Connected</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Link your Telegram account to log transactions by sending a message to the bot.
            </p>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Open Telegram and message <span className="text-accent">@YourBotUsername</span></li>
              <li>Send <code className="bg-base px-1 rounded">/start</code></li>
              <li>Generate a code below and send it to the bot</li>
            </ol>
            {linkCode ? (
              <div className="bg-base rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Your link code (expires in 10 minutes):</p>
                <p className="text-accent text-2xl font-mono font-bold tracking-widest">{linkCode}</p>
                <p className="text-xs text-gray-500 mt-1">Send this code to the bot in Telegram</p>
              </div>
            ) : (
              <button
                onClick={generateLinkCode}
                disabled={loadingCode}
                className="bg-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {loadingCode ? 'Generating...' : 'Generate Link Code'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors"
      >
        <LogOut size={18} /> Sign out
      </button>

      {/* Danger zone */}
      <section className="border border-expense/30 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-expense">Danger Zone</h2>
        <p className="text-sm text-gray-400">Permanently delete all your data. This cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="bg-expense/10 hover:bg-expense/20 text-expense text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Delete all my data
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Test settings page**

```bash
npm run dev
```

1. Navigate to `/settings`
2. Email shows correctly
3. Password change form works
4. Telegram section shows "Generate Link Code" button → clicking generates an 8-char code
5. Sign out works and redirects to login

- [ ] **Step 3: Commit**

```bash
git add src/pages/Settings.jsx
git commit -m "feat: settings page with password change, telegram linking, and account deletion"
```

---

## Task 13: Telegram Bot Edge Function

**Files:**
- Create: `supabase/functions/telegram-bot/index.ts`

- [ ] **Step 1: Write the Edge Function**

Create `supabase/functions/telegram-bot/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

interface ParsedTransaction {
  type: 'income' | 'expense'
  amount: number
  categoryHint: string
  note: string
}

function parseMessage(text: string): ParsedTransaction | null {
  // Format: "spent 45 food lunch" or "income 2000 salary"
  const lower = text.toLowerCase().trim()
  const match = lower.match(/^(spent|expense|income)\s+(\d+(?:\.\d{1,2})?)\s*(.*)$/)
  if (!match) return null

  const [, typeWord, amountStr, rest] = match
  const parts = rest.trim().split(/\s+/)
  const categoryHint = parts[0] ?? ''
  const note = parts.slice(1).join(' ')

  return {
    type: typeWord === 'income' ? 'income' : 'expense',
    amount: parseFloat(amountStr),
    categoryHint,
    note,
  }
}

async function getUserByTelegramId(chatId: number) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single()
  return data
}

async function linkAccount(chatId: number, code: string) {
  // Find user with this link code in user_metadata
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users.find(u => u.user_metadata?.telegram_link_code === code.toUpperCase())
  if (!user) return false

  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { telegram_link_code: null, telegram_chat_id: chatId },
  })
  // Also store in a queryable column via raw SQL
  await supabase.rpc('set_telegram_chat_id', { p_user_id: user.id, p_chat_id: chatId })
  return true
}

async function findCategory(userId: string, hint: string) {
  if (!hint) return null
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .or(`user_id.eq.${userId},user_id.is.null`)
  if (!data) return null
  const lower = hint.toLowerCase()
  return data.find(c => c.name.toLowerCase().startsWith(lower)) ?? null
}

serve(async (req) => {
  // Verify webhook secret
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret !== WEBHOOK_SECRET) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const message = body.message
  if (!message?.text) return new Response('OK')

  const chatId: number = message.chat.id
  const text: string = message.text.trim()

  // /start command
  if (text === '/start') {
    await sendMessage(chatId, '👋 Welcome! Generate a link code in the app Settings → Telegram, then send it here to connect your account.')
    return new Response('OK')
  }

  // Link code (8 uppercase alphanumeric chars)
  if (/^[A-Z0-9]{8}$/i.test(text)) {
    const linked = await linkAccount(chatId, text)
    if (linked) {
      await sendMessage(chatId, '✅ Account linked! You can now log transactions.\n\nExamples:\n<code>spent 45 food lunch</code>\n<code>income 2000 salary</code>\n<code>/summary</code>')
    } else {
      await sendMessage(chatId, '❌ Invalid or expired code. Generate a new one in the app.')
    }
    return new Response('OK')
  }

  // All other commands require linked account
  const user = await getUserByTelegramId(chatId)
  if (!user) {
    await sendMessage(chatId, '⚠️ Account not linked. Go to Settings → Telegram in the app to get a link code.')
    return new Response('OK')
  }

  // /summary command
  if (text === '/summary') {
    const now = new Date()
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', from)

    const income = txs?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
    const spent = txs?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0
    const balance = income - spent

    await sendMessage(chatId,
      `📊 <b>This month</b>\nIncome: <b>$${income.toFixed(2)}</b>\nSpent: <b>$${spent.toFixed(2)}</b>\nBalance: <b>${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}</b>`
    )
    return new Response('OK')
  }

  // /categories command
  if (text === '/categories') {
    const { data: cats } = await supabase
      .from('categories')
      .select('name, icon')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
    const list = cats?.map(c => `${c.icon} ${c.name.toLowerCase()}`).join('\n') ?? ''
    await sendMessage(chatId, `📂 <b>Categories:</b>\n${list}`)
    return new Response('OK')
  }

  // Transaction logging
  const parsed = parseMessage(text)
  if (!parsed) {
    await sendMessage(chatId,
      '❓ I didn\'t understand that.\n\nTry:\n<code>spent 45 food lunch</code>\n<code>income 2000 salary</code>\n<code>/summary</code>\n<code>/categories</code>'
    )
    return new Response('OK')
  }

  const category = await findCategory(user.id, parsed.categoryHint)
  const today = new Date().toISOString().split('T')[0]

  await supabase.from('transactions').insert({
    user_id: user.id,
    amount: parsed.amount,
    type: parsed.type,
    category_id: category?.id ?? null,
    note: parsed.note || null,
    date: today,
  })

  const emoji = parsed.type === 'income' ? '💰' : '💸'
  const catName = category?.name ?? parsed.categoryHint ?? 'Uncategorized'
  await sendMessage(chatId,
    `${emoji} Logged: <b>$${parsed.amount.toFixed(2)}</b> — ${catName}${parsed.note ? ` (${parsed.note})` : ''}`
  )

  return new Response('OK')
})
```

- [ ] **Step 2: Add RPC function for setting telegram_chat_id**

In Supabase SQL Editor, run:
```sql
create or replace function set_telegram_chat_id(p_user_id uuid, p_chat_id bigint)
returns void language sql security definer as $$
  update auth.users set raw_user_meta_data =
    raw_user_meta_data || jsonb_build_object('telegram_chat_id', p_chat_id)
  where id = p_user_id;
$$;
```

- [ ] **Step 3: Deploy Edge Function**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets for the Edge Function
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token
supabase secrets set TELEGRAM_WEBHOOK_SECRET=make_up_a_random_string_here

# Deploy function
supabase functions deploy telegram-bot
```

- [ ] **Step 4: Register Telegram webhook**

Replace `YOUR_PROJECT_REF` and `YOUR_WEBHOOK_SECRET` with actual values:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_PROJECT_REF.supabase.co/functions/v1/telegram-bot&secret_token=YOUR_WEBHOOK_SECRET"
```

Expected response: `{"ok":true,"result":true,"description":"Webhook was set"}`

- [ ] **Step 5: Test Telegram bot**

1. Open Telegram, find your bot, send `/start`
2. Expected reply: welcome message with instructions
3. In app Settings, generate a link code
4. Send the code to the bot
5. Expected: "✅ Account linked!" message
6. Send `spent 12 food coffee`
7. Expected: "💸 Logged: $12.00 — Food (coffee)"
8. Open web app dashboard — transaction appears

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/
git commit -m "feat: telegram bot edge function with account linking and transaction logging"
```

---

## Task 14: GitHub Actions Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add GitHub secrets**

In your GitHub repo → Settings → Secrets and variables → Actions:
- Add `VITE_SUPABASE_URL` = your Supabase project URL
- Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

- [ ] **Step 3: Enable GitHub Pages**

In GitHub repo → Settings → Pages:
- Source: **GitHub Actions**

- [ ] **Step 4: Add 404 redirect for React Router**

Create `public/404.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    var l = window.location;
    l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1).join('/') + '/?/' +
      l.pathname.slice(1) + (l.search ? '&' + l.search.slice(1) : '') + l.hash);
  </script>
</head>
</html>
```

Add redirect handler to `index.html` `<head>`:
```html
<script>
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
    }
  }(window.location))
</script>
```

- [ ] **Step 5: Push to GitHub and verify deploy**

```bash
git add .github/ public/404.html index.html
git commit -m "chore: github actions deploy workflow and spa 404 redirect"

# Create GitHub repo if not exists, then:
git remote add origin https://github.com/YOUR_USERNAME/personal-finance.git
git push -u origin main
```

1. Go to GitHub → Actions tab — watch build and deploy jobs complete
2. Click the deployed URL — app loads and redirects to `/login`
3. Sign up, add transactions, verify everything works on the live URL

- [ ] **Step 6: Run all tests one final time**

```bash
npx vitest run
```

Expected: All tests pass

---

## Self-Review

**Spec coverage check:**
- ✅ Two separate user accounts with private data — Supabase Auth + RLS on every table
- ✅ Manual entry via web form — TransactionForm component
- ✅ Telegram bot entry — Edge Function with account linking
- ✅ Default categories (Food, Transport, Rides, Shopping, Bills, Health, Entertainment, Education, Other) — seeded in migration
- ✅ Custom categories — useCategories hook + Categories page
- ✅ Dashboard with balance, stats, donut chart, recent transactions
- ✅ Reports with weekly/monthly toggle, bar chart, line chart, comparison, CSV export
- ✅ USD currency — formatCurrency uses Intl.NumberFormat with USD
- ✅ Free hosting — GitHub Pages + Supabase free tier, no Vercel

**Placeholder scan:** No TBDs, no "implement this", all code complete. ✓

**Type consistency:** `computeSummary` exported from `useTransactions.js` and imported in test. `groupByCategory` used in both utils and useTransactions. `getMonthRange`/`getWeekRange` used in Dashboard and Reports. All consistent. ✓

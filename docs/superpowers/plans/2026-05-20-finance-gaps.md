# Finance Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Budgets, Goals, recurring transaction tracking, transaction search, and date range filtering to the Finely personal finance app.

**Architecture:** New Supabase tables for budgets/goals/deposits with RLS. Pure computation functions extracted and tested. React hooks follow existing `useTransactions` / `useCategories` patterns. New pages for Budgets and Goals; enhancements to existing pages. Navigation restructured to 5 tabs.

**Tech Stack:** React 18, Vite, Supabase JS v2, date-fns v4, Tailwind CSS, Vitest, lucide-react

---

## File Map

**Create:**
- `supabase/migrations/007_budgets_goals_recurring.sql` — DB schema changes
- `src/hooks/useBudgets.js` — budget data + spending computation
- `src/hooks/useGoals.js` — goals + deposits data
- `src/components/BudgetRing.jsx` — SVG summary ring for Budgets page
- `src/components/GoalRing.jsx` — SVG circular progress ring for goal tiles
- `src/components/GoalSheet.jsx` — bottom sheet for goal detail + deposits
- `src/pages/Budgets.jsx` — Budgets page
- `src/pages/Goals.jsx` — Goals page

**Modify:**
- `src/lib/utils.js` — add `getDateRange` helper
- `src/lib/utils.test.js` — add `getDateRange` tests
- `src/hooks/useTransactions.js` — pass `is_recurring` in insert/update
- `src/components/TransactionForm.jsx` — add recurring toggle
- `src/components/TransactionItem.jsx` — show recurring icon
- `src/pages/Dashboard.jsx` — add recurring summary card
- `src/pages/Transactions.jsx` — add search, date range, recurring filter
- `src/components/BottomNav.jsx` — replace Categories tab with Budgets + Goals
- `src/components/TopNav.jsx` — add Budgets/Goals links; show settings gear on mobile
- `src/router.jsx` — add `/budgets`, `/goals` routes
- `src/pages/Settings.jsx` — add "Manage Categories" link

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/007_budgets_goals_recurring.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/007_budgets_goals_recurring.sql

-- 1. Add is_recurring to transactions
alter table transactions
  add column if not exists is_recurring boolean not null default false;

-- 2. budgets table
create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  category_id   uuid references categories(id) on delete cascade not null,
  monthly_limit numeric(10,2) not null check (monthly_limit > 0),
  created_at    timestamptz default now(),
  unique(user_id, category_id)
);
alter table budgets enable row level security;
create policy "budgets: user owns" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. goals table
create table if not exists goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  name          text not null,
  emoji         text not null default '🎯',
  target_amount numeric(10,2) not null check (target_amount > 0),
  deadline      date,
  created_at    timestamptz default now()
);
alter table goals enable row level security;
create policy "goals: user owns" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. goal_deposits table
create table if not exists goal_deposits (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid references goals(id) on delete cascade not null,
  user_id    uuid references auth.users not null,
  amount     numeric(10,2) not null check (amount > 0),
  date       date not null default current_date,
  note       text,
  created_at timestamptz default now()
);
alter table goal_deposits enable row level security;
create policy "goal_deposits: user owns" on goal_deposits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
npx supabase db push
```

Expected: migration applies without errors. Verify in Supabase Studio that `budgets`, `goals`, `goal_deposits` tables exist and `transactions` has `is_recurring` column.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_budgets_goals_recurring.sql
git commit -m "feat: add budgets, goals, goal_deposits tables and is_recurring column"
```

---

## Task 2: Navigation Restructure

**Files:**
- Modify: `src/components/BottomNav.jsx`
- Modify: `src/components/TopNav.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Update BottomNav — replace Categories with Budgets + Goals**

Replace the entire contents of `src/components/BottomNav.jsx`:

```jsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, PiggyBank, Target } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-40 px-4 pb-safe-area-inset-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div
        className="flex w-full rounded-2xl overflow-hidden mx-auto"
        style={{
          background: 'rgba(15, 18, 33, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
          marginBottom: '8px',
        }}
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-accent/15' : ''
                }`}>
                  <Icon size={19} aria-hidden="true" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className={isActive ? 'text-accent' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update TopNav — add Budgets/Goals links and make Settings accessible on mobile**

Replace the entire contents of `src/components/TopNav.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/reports', label: 'Reports' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/goals', label: 'Goals' },
]

export default function TopNav() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const popoverRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!showConfirm) return
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setShowConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showConfirm])

  async function handleConfirmSignOut() {
    setSigningOut(true)
    try { await signOut() } catch {}
    navigate('/login')
  }

  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center px-4 md:px-6 h-12 md:h-16 gap-1 sticky top-0 z-40"
      style={{
        background: 'rgba(8, 11, 24, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2 md:mr-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-900/50">
          <TrendingUp size={14} className="text-white" aria-hidden="true" />
        </div>
        <span className="hidden md:block text-white font-bold tracking-tight">Finely</span>
      </div>

      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `hidden md:block px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-accent bg-accent/10 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {label}
        </NavLink>
      ))}

      <div className="ml-auto flex items-center gap-1 relative">
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={({ isActive }) =>
            `p-2 rounded-lg transition-all duration-200 cursor-pointer ${
              isActive ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings size={17} aria-hidden="true" />
        </NavLink>

        <button
          ref={btnRef}
          onClick={() => setShowConfirm(s => !s)}
          aria-label="Sign out"
          aria-expanded={showConfirm}
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
            showConfirm ? 'text-expense bg-expense/10' : 'text-gray-400 hover:text-expense hover:bg-expense/10'
          }`}
        >
          <LogOut size={17} aria-hidden="true" />
        </button>

        {showConfirm && (
          <div
            ref={popoverRef}
            className="absolute top-full right-0 mt-2 w-52 rounded-2xl p-4 z-50 animate-scale-in"
            style={{
              background: 'rgba(10, 12, 28, 0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              transformOrigin: 'top right',
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-expense/15 flex items-center justify-center flex-shrink-0">
                <LogOut size={15} className="text-expense" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sign out?</p>
                <p className="text-gray-500 text-xs font-body">You'll need to sign back in</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                disabled={signingOut}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60"
                style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Update router — add /budgets and /goals routes**

Replace the entire contents of `src/router.jsx`:

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
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-xl animate-pulse">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <p className="text-gray-600 text-sm font-body">Loading Finely...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function Router() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="goals" element={<Goals />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify nav renders — run dev server**

```bash
npm run dev
```

Open the app in browser. Confirm bottom nav shows: Home, Transactions, Reports, Budgets, Goals. Confirm top nav gear icon is visible on mobile viewport (use DevTools to resize). Navigating to `/budgets` and `/goals` should show blank pages (components don't exist yet — create stubs if needed to prevent crashes):

If the app crashes on `/budgets` or `/goals` because the imports don't exist, create temporary stubs:

```jsx
// src/pages/Budgets.jsx (temporary stub)
export default function Budgets() { return <div className="text-white p-4">Budgets coming soon</div> }
```

```jsx
// src/pages/Goals.jsx (temporary stub)
export default function Goals() { return <div className="text-white p-4">Goals coming soon</div> }
```

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomNav.jsx src/components/TopNav.jsx src/router.jsx src/pages/Budgets.jsx src/pages/Goals.jsx
git commit -m "feat: restructure nav — add Budgets and Goals tabs, show settings on mobile"
```

---

## Task 3: Recurring Transaction Support

**Files:**
- Modify: `src/hooks/useTransactions.js`
- Modify: `src/components/TransactionForm.jsx`
- Modify: `src/components/TransactionItem.jsx`

- [ ] **Step 1: Update useTransactions — pass is_recurring in addTransaction and updateTransaction**

In `src/hooks/useTransactions.js`, update `addTransaction` and `updateTransaction`:

```js
async function addTransaction({ amount, type, category_id, note, date, is_recurring = false }) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: user.id, amount: Number(amount), type, category_id: category_id || null, note: note || null, date, is_recurring })
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
    .eq('user_id', user.id)
    .select('*, categories(id, name, icon, color)')
    .single()
  if (error) throw error
  setTransactions(prev => prev.map(t => t.id === id ? data : t))
  return data
}
```

The `updateTransaction` signature is already correct (accepts arbitrary `updates` object), so it passes `is_recurring` through automatically.

- [ ] **Step 2: Add recurring toggle to TransactionForm**

In `src/components/TransactionForm.jsx`:

Add state after existing state declarations:
```jsx
const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false)
```

Update `handleSave` to pass `is_recurring`:
```jsx
await onSave({ amount: Number(amount), type, category_id: categoryId || null, note, date, is_recurring: isRecurring })
```

Add the recurring toggle field inside the scrollable body, after the Note field and before the error message:
```jsx
{/* Recurring toggle */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
  <div>
    <label htmlFor="tx-recurring" style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
      🔁 Recurring transaction
    </label>
    <p style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>e.g. rent, subscriptions</p>
  </div>
  <button
    id="tx-recurring"
    type="button"
    role="switch"
    aria-checked={isRecurring}
    onClick={() => setIsRecurring(v => !v)}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.2s',
      background: isRecurring ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.12)',
      position: 'relative',
      flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute',
      top: '3px',
      left: isRecurring ? '23px' : '3px',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.2s',
    }} />
  </button>
</div>
```

- [ ] **Step 3: Add recurring icon to TransactionItem**

In `src/components/TransactionItem.jsx`, update the import line:
```jsx
import { Pencil, Trash2, Repeat2 } from 'lucide-react'
```

Update the destructuring to include `is_recurring`:
```jsx
const { amount, type, note, date, categories, is_recurring } = transaction
```

In the middle section, add the recurring icon next to the CategoryBadge:
```jsx
<div className="flex items-center gap-2">
  <CategoryBadge category={categories} />
  {is_recurring && (
    <span title="Recurring" aria-label="Recurring transaction">
      <Repeat2 size={11} className="text-accent/60" />
    </span>
  )}
</div>
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Add a new transaction. Confirm the recurring toggle appears and can be toggled. Save it. Confirm the 🔁 icon appears on the transaction item in the list.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTransactions.js src/components/TransactionForm.jsx src/components/TransactionItem.jsx
git commit -m "feat: add recurring transaction support — toggle, icon, and db field"
```

---

## Task 4: Dashboard Recurring Summary Card

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Add recurring summary card to Dashboard**

In `src/pages/Dashboard.jsx`, add the `Repeat2` icon to imports:
```jsx
import { Plus, TrendingUp, TrendingDown, Wallet, Repeat2 } from 'lucide-react'
```

Add `useNavigate` import:
```jsx
import { useNavigate } from 'react-router-dom'
```

Inside the `Dashboard` component, add:
```jsx
const navigate = useNavigate()
const recurringTxs = transactions.filter(t => t.is_recurring && t.type === 'expense')
const recurringTotal = recurringTxs.reduce((s, t) => s + Number(t.amount), 0)
```

Insert the recurring card between the stat cards section and the donut chart section (after the `{loading ? <SkeletonStatCards /> : (...)}` block):

```jsx
{/* Recurring summary card */}
{!loading && recurringTxs.length > 0 && (
  <button
    onClick={() => navigate('/transactions', { state: { filterRecurring: true } })}
    className="glass-card rounded-2xl px-5 py-4 flex items-center gap-4 w-full text-left animate-fade-up cursor-pointer hover:bg-white/[0.03] transition-colors"
    style={{ animationDelay: '130ms', animationFillMode: 'both' }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <Repeat2 size={18} className="text-accent" aria-hidden="true" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white">Monthly Recurring</p>
      <p className="text-xs text-gray-500 font-body mt-0.5">{recurringTxs.length} subscription{recurringTxs.length !== 1 ? 's' : ''} this month</p>
    </div>
    <p className="text-expense font-bold text-sm tabular-nums flex-shrink-0">{formatCurrency(recurringTotal)}</p>
  </button>
)}
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Mark at least one existing expense as recurring (edit it). The recurring card should appear on the Dashboard. Clicking it navigates to `/transactions`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: add monthly recurring summary card to dashboard"
```

---

## Task 5: Transaction Page — Search, Date Range, Recurring Filter

**Files:**
- Modify: `src/lib/utils.js`
- Modify: `src/lib/utils.test.js`
- Modify: `src/pages/Transactions.jsx`

- [ ] **Step 1: Write failing test for getDateRange**

Add to `src/lib/utils.test.js`:

```js
import { subMonths, format } from 'date-fns'

describe('getDateRange', () => {
  const now = new Date(2026, 4, 20) // May 20 2026

  it('returns current month range for this-month', () => {
    const { from, to } = getDateRange('this-month', now)
    expect(from).toBe('2026-05-01')
    expect(to).toBe('2026-05-31')
  })

  it('returns previous month range for last-month', () => {
    const { from, to } = getDateRange('last-month', now)
    expect(from).toBe('2026-04-01')
    expect(to).toBe('2026-04-30')
  })

  it('returns 3-month range for last-3-months', () => {
    const { from, to } = getDateRange('last-3-months', now)
    expect(from).toBe('2026-02-20')
    expect(to).toBe('2026-05-20')
  })

  it('returns empty object for all-time', () => {
    expect(getDateRange('all-time', now)).toEqual({})
  })
})
```

Also add `getDateRange` to the import line at the top of `utils.test.js`:
```js
import { formatCurrency, formatDate, groupByCategory, getMonthRange, getWeekRange, calcBalance, normalizeHex, getDateRange } from './utils'
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- utils.test
```

Expected: FAIL — `getDateRange is not a function`

- [ ] **Step 3: Implement getDateRange in utils.js**

Add to `src/lib/utils.js` (add `subMonths` to the date-fns import):
```js
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'
```

Add the function:
```js
export function getDateRange(rangeKey, now = new Date()) {
  switch (rangeKey) {
    case 'this-month':
      return getMonthRange(now.getFullYear(), now.getMonth())
    case 'last-month':
      return getMonthRange(now.getFullYear(), now.getMonth() - 1)
    case 'last-3-months':
      return {
        from: format(subMonths(now, 3), 'yyyy-MM-dd'),
        to: format(now, 'yyyy-MM-dd'),
      }
    default:
      return {}
  }
}
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
npm test -- utils.test
```

Expected: all tests PASS

- [ ] **Step 5: Rewrite Transactions page with search, date range, and recurring filter**

Replace the entire contents of `src/pages/Transactions.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, X, Repeat2 } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { getDateRange } from '../lib/utils'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'
import { SkeletonTransactions } from '../components/Skeleton'

const DATE_RANGES = [
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'last-3-months', label: '3 Months' },
  { key: 'all-time', label: 'All Time' },
]

export default function Transactions() {
  const location = useLocation()
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRecurring, setFilterRecurring] = useState(location.state?.filterRecurring ?? false)
  const [dateRange, setDateRange] = useState('this-month')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  const range = getDateRange(dateRange)
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions(range)
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    if (filterRecurring && !t.is_recurring) return false
    if (searchQuery && !t.note?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    try { await deleteTransaction(id) } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  function handleEdit(tx) { setEditing(tx); setShowForm(true) }
  async function handleSave(data) {
    if (editing) await updateTransaction(editing.id, data)
    else await addTransaction(data)
    handleClose()
  }
  function handleClose() { setShowForm(false); setEditing(null) }

  function handleCloseSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const typeFilters = [
    { key: 'all', label: 'All' },
    { key: 'expense', label: 'Expenses' },
    { key: 'income', label: 'Income' },
  ]

  const activeRange = DATE_RANGES.find(r => r.key === dateRange)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-gray-500 font-body mt-0.5">
            {!loading && `${filtered.length} ${filtered.length === 1 ? 'record' : 'records'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSearchOpen(v => !v); if (searchOpen) handleCloseSearch() }}
            aria-label="Search transactions"
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer glass-card ${searchOpen ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-white'}`}
          >
            <Search size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus size={16} aria-hidden="true" /> Add
          </button>
        </div>
      </div>

      {/* Inline search bar */}
      {searchOpen && (
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up">
          <Search size={15} className="text-accent flex-shrink-0" aria-hidden="true" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by note..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            aria-label="Search transactions by note"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-gray-500 hover:text-white cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div
        className="glass-card rounded-2xl p-3 space-y-3 animate-fade-up"
        style={{ animationDelay: '60ms', animationFillMode: 'both' }}
      >
        {/* Type filter pills + date range pill */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by type">
          {typeFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filterType === key
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => setFilterRecurring(v => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterRecurring
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Repeat2 size={11} aria-hidden="true" /> Recurring
          </button>

          {/* Date range pill — right side */}
          <div className="ml-auto relative">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              aria-label="Date range"
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-300 cursor-pointer appearance-none pr-7"
              style={{ appearance: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {DATE_RANGES.map(r => (
                <option key={r.key} value={r.key} style={{ background: '#0F1221' }}>{r.label}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" aria-hidden="true" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="glass-input w-full rounded-xl pl-8 pr-4 py-2 text-xs cursor-pointer"
              style={{ appearance: 'none' }}
              aria-label="Filter by category"
            >
              <option value="" style={{ background: '#0F1221' }}>All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0F1221' }}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center font-body animate-fade-up">
          Failed to load transactions. Please refresh.
        </div>
      )}

      {/* Transaction list */}
      {loading ? (
        <SkeletonTransactions count={6} />
      ) : filtered.length === 0 ? (
        <div
          className="glass-card rounded-2xl px-6 py-14 text-center animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm font-body">No transactions found</p>
          <p className="text-gray-600 text-xs mt-1 font-body">Try adjusting your filters</p>
        </div>
      ) : (
        <div
          className="glass-card rounded-2xl divide-y divide-white/[0.05] overflow-hidden animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          {filtered.map((tx, i) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={handleEdit}
              onDelete={handleDelete}
              animDelay={i * 30}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm initial={editing} onSave={handleSave} onClose={handleClose} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Run `npm run dev`. On the Transactions page:
- Click the search icon — search bar should expand inline
- Type in the search bar — list should filter by note text
- Select "Last Month" from the date dropdown — list should update
- Toggle "Recurring" pill — should show only recurring transactions
- Click the Dashboard recurring card — Transactions page should open with Recurring pre-filtered

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js src/pages/Transactions.jsx
git commit -m "feat: add search, date range, and recurring filter to transactions page"
```

---

## Task 6: useBudgets Hook

**Files:**
- Create: `src/hooks/useBudgets.js`
- Create: `src/hooks/useBudgets.test.js`

- [ ] **Step 1: Write failing tests for computeBudgetStats**

Create `src/hooks/useBudgets.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { computeBudgetStats } from './useBudgets'

const budgets = [
  { id: '1', category_id: 'cat-a', monthly_limit: '500.00', categories: { name: 'Food', icon: '🍔', color: '#F59E0B' } },
  { id: '2', category_id: 'cat-b', monthly_limit: '200.00', categories: { name: 'Transport', icon: '🚗', color: '#3B82F6' } },
  { id: '3', category_id: 'cat-c', monthly_limit: '100.00', categories: { name: 'Fun', icon: '🎮', color: '#8B5CF6' } },
]

const spending = { 'cat-a': 340, 'cat-b': 210, 'cat-c': 50 }

describe('computeBudgetStats', () => {
  it('sums total limit across all budgets', () => {
    const { totalLimit } = computeBudgetStats(budgets, spending)
    expect(totalLimit).toBe(800)
  })

  it('sums total spent across all budgets', () => {
    const { totalSpent } = computeBudgetStats(budgets, spending)
    expect(totalSpent).toBe(600)
  })

  it('marks over-limit budget as over', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-b').status).toBe('over')
  })

  it('marks 68% spent budget as ok', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-a').status).toBe('ok')
  })

  it('marks 50% spent budget as ok', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-c').status).toBe('ok')
  })

  it('returns 0 spent for category with no transactions', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, {})
    expect(budgetsWithStats[0].spent).toBe(0)
  })

  it('caps pct at 1 when over budget', () => {
    const { budgetsWithStats } = computeBudgetStats(budgets, spending)
    expect(budgetsWithStats.find(b => b.category_id === 'cat-b').pct).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useBudgets.test
```

Expected: FAIL — `computeBudgetStats is not a function`

- [ ] **Step 3: Create useBudgets.js**

Create `src/hooks/useBudgets.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function computeBudgetStats(budgets, spending) {
  const totalLimit = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.category_id] || 0), 0)
  const budgetsWithStats = budgets.map(b => {
    const spent = spending[b.category_id] || 0
    const limit = Number(b.monthly_limit)
    const pct = limit > 0 ? Math.min(spent / limit, 1) : 0
    const status = spent >= limit ? 'over' : spent >= limit * 0.8 ? 'warning' : 'ok'
    return { ...b, spent, pct, status }
  })
  return { totalLimit, totalSpent, budgetsWithStats }
}

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [spending, setSpending] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBudgets = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const now = new Date()
    const from = format(startOfMonth(now), 'yyyy-MM-dd')
    const to = format(endOfMonth(now), 'yyyy-MM-dd')

    const [{ data: budgetData, error: budgetErr }, { data: txData, error: txErr }] = await Promise.all([
      supabase.from('budgets').select('*, categories(id, name, icon, color)').eq('user_id', user.id),
      supabase.from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to),
    ])

    if (budgetErr || txErr) { setError(budgetErr || txErr); setLoading(false); return }

    const spendMap = {}
    for (const tx of txData) {
      if (!tx.category_id) continue
      spendMap[tx.category_id] = (spendMap[tx.category_id] || 0) + Number(tx.amount)
    }

    setBudgets(budgetData)
    setSpending(spendMap)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchBudgets()
  }, [fetchBudgets, user])

  async function addBudget({ category_id, monthly_limit }) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: user.id, category_id, monthly_limit: Number(monthly_limit) },
        { onConflict: 'user_id,category_id' }
      )
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category_id === category_id)
      if (idx >= 0) { const next = [...prev]; next[idx] = data; return next }
      return [...prev, data]
    })
    return data
  }

  async function updateBudget(id, monthly_limit) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ monthly_limit: Number(monthly_limit) })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, categories(id, name, icon, color)')
      .single()
    if (error) throw error
    setBudgets(prev => prev.map(b => b.id === id ? data : b))
    return data
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return { budgets, spending, loading, error, addBudget, updateBudget, deleteBudget, refetch: fetchBudgets }
}
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
npm test -- useBudgets.test
```

Expected: all 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBudgets.js src/hooks/useBudgets.test.js
git commit -m "feat: add useBudgets hook with computeBudgetStats"
```

---

## Task 7: BudgetRing Component + Budgets Page

**Files:**
- Create: `src/components/BudgetRing.jsx`
- Modify: `src/pages/Budgets.jsx`

- [ ] **Step 1: Create BudgetRing component**

Create `src/components/BudgetRing.jsx`:

```jsx
import { formatCurrency } from '../lib/utils'

export default function BudgetRing({ pct, remaining, totalLimit }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  const color = pct >= 1 ? '#f87171' : pct >= 0.8 ? '#fbbf24' : '#a78bfa'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-500 font-body">remaining</p>
          <p className="text-xl font-bold" style={{ color }}>{formatCurrency(Math.max(remaining, 0))}</p>
          <p className="text-xs text-gray-500 font-body">{Math.round(pct * 100)}% used</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-body">
        {formatCurrency(totalLimit - Math.max(remaining, 0))} spent of {formatCurrency(totalLimit)}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Build Budgets page**

Replace the stub in `src/pages/Budgets.jsx` with the full implementation:

```jsx
import { useState } from 'react'
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react'
import { useBudgets, computeBudgetStats } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency } from '../lib/utils'
import BudgetRing from '../components/BudgetRing'
import { SkeletonStatCards } from '../components/Skeleton'

function statusColor(status) {
  if (status === 'over') return { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', text: '#f87171' }
  if (status === 'warning') return { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', text: '#fbbf24' }
  return { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', text: '#34d399' }
}

function statusLabel(status, spent, limit) {
  if (status === 'over') return `$${(spent - limit).toFixed(0)} over`
  return `$${(limit - spent).toFixed(0)} left`
}

export default function Budgets() {
  const { budgets, spending, loading, error, addBudget, updateBudget, deleteBudget } = useBudgets()
  const { categories } = useCategories()
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addCategoryId, setAddCategoryId] = useState('')
  const [addLimit, setAddLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const { totalLimit, totalSpent, budgetsWithStats } = computeBudgetStats(budgets, spending)
  const remaining = totalLimit - totalSpent
  const overallPct = totalLimit > 0 ? totalSpent / totalLimit : 0

  const now = new Date()
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const categoriesWithoutBudget = categories.filter(
    c => !budgets.some(b => b.category_id === c.id)
  )

  async function handleSaveEdit(budget) {
    if (!editValue || Number(editValue) <= 0) return
    setSaving(true)
    try { await updateBudget(budget.id, editValue) } catch (err) { console.error(err) } finally {
      setSaving(false)
      setEditingId(null)
    }
  }

  async function handleAddBudget() {
    if (!addCategoryId || !addLimit || Number(addLimit) <= 0) return
    setSaving(true)
    try {
      await addBudget({ category_id: addCategoryId, monthly_limit: addLimit })
      setShowAddForm(false)
      setAddCategoryId('')
      setAddLimit('')
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this budget?')) return
    try { await deleteBudget(id) } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Budgets</h1>
        <p className="text-xs text-gray-500 font-body mt-0.5">{monthLabel}</p>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center">Failed to load budgets. Please refresh.</div>
      )}

      {loading ? <SkeletonStatCards /> : (
        <>
          {/* Summary ring */}
          {totalLimit > 0 && (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center animate-fade-up">
              <BudgetRing pct={overallPct} remaining={remaining} totalLimit={totalLimit} />
            </div>
          )}

          {budgetsWithStats.length === 0 && (
            <div className="glass-card rounded-2xl px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-body">No budgets set yet</p>
              <p className="text-gray-600 text-xs mt-1 font-body">Set a monthly limit for any category</p>
            </div>
          )}

          {/* Budget grid */}
          {budgetsWithStats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
              {budgetsWithStats.map(b => {
                const colors = statusColor(b.status)
                return editingId === b.id ? (
                  <div key={b.id} className="rounded-2xl p-4 space-y-2" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <p className="text-xs font-semibold text-white">{b.categories?.icon} {b.categories?.name}</p>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                      placeholder="Monthly limit"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(b)} disabled={saving} className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-income bg-income/15 cursor-pointer">
                        <Check size={12} className="inline mr-1" />Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={b.id} className="rounded-2xl p-4 space-y-2 group" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold text-white truncate">{b.categories?.icon} {b.categories?.name}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(b.id); setEditValue(b.monthly_limit) }} aria-label="Edit budget" className="cursor-pointer text-gray-500 hover:text-white">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => handleDelete(b.id)} aria-label="Delete budget" className="cursor-pointer text-gray-500 hover:text-expense">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 font-body">{formatCurrency(b.spent)}</span>
                        <span className="text-gray-500 font-body">{formatCurrency(Number(b.monthly_limit))}</span>
                      </div>
                      <div className="rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="rounded-full h-1.5 transition-all duration-500" style={{ width: `${b.pct * 100}%`, background: colors.text }} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold font-body" style={{ color: colors.text }}>
                      {statusLabel(b.status, b.spent, Number(b.monthly_limit))}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add budget button / form */}
          {categoriesWithoutBudget.length > 0 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer animate-fade-up"
              style={{ border: '1px dashed rgba(255,255,255,0.12)', animationDelay: '120ms', animationFillMode: 'both' }}
            >
              <Plus size={16} /> Set budget for a category
            </button>
          )}

          {showAddForm && (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-up">
              <h2 className="text-sm font-semibold text-white">Set a budget</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={addCategoryId}
                  onChange={e => setAddCategoryId(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
                  style={{ appearance: 'none' }}
                >
                  <option value="" style={{ background: '#0F1221' }}>Choose a category…</option>
                  {categoriesWithoutBudget.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0F1221' }}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Monthly limit ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={addLimit}
                  onChange={e => setAddLimit(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddBudget} disabled={saving || !addCategoryId || !addLimit} className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-40">
                  {saving ? 'Saving…' : 'Set Budget'}
                </button>
                <button onClick={() => { setShowAddForm(false); setAddCategoryId(''); setAddLimit('') }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer glass-card">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Navigate to `/budgets`:
- With no budgets: shows empty state + "Set budget for a category" button
- Add a budget: select a category, enter a limit, save → tile appears in the grid
- Add a second budget where you've already spent more than the limit → tile shows red with "over" label
- Ring appears once at least one budget is set

- [ ] **Step 4: Commit**

```bash
git add src/components/BudgetRing.jsx src/pages/Budgets.jsx
git commit -m "feat: add Budgets page with summary ring and category status grid"
```

---

## Task 8: useGoals Hook

**Files:**
- Create: `src/hooks/useGoals.js`
- Create: `src/hooks/useGoals.test.js`

- [ ] **Step 1: Write failing tests for computeGoalStats**

Create `src/hooks/useGoals.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { computeGoalStats } from './useGoals'

const goals = [
  { id: 'g1', name: 'Vacation', emoji: '✈️', target_amount: '3000.00' },
  { id: 'g2', name: 'Emergency', emoji: '🏠', target_amount: '5000.00' },
  { id: 'g3', name: 'New Laptop', emoji: '💻', target_amount: '1500.00' },
]

const deposits = [
  { goal_id: 'g1', amount: '1800.00' },
  { goal_id: 'g1', amount: '200.00' },
  { goal_id: 'g2', amount: '500.00' },
  { goal_id: 'g3', amount: '1500.00' },
]

describe('computeGoalStats', () => {
  it('sums deposits for each goal', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').current_amount).toBe(2000)
  })

  it('calculates percentage progress', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').pct).toBeCloseTo(2000 / 3000)
  })

  it('returns 0 for goal with no deposits', () => {
    const result = computeGoalStats(goals, [])
    expect(result.find(g => g.id === 'g1').current_amount).toBe(0)
  })

  it('marks goal as complete when current >= target', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g3').complete).toBe(true)
  })

  it('does not mark incomplete goal as complete', () => {
    const result = computeGoalStats(goals, deposits)
    expect(result.find(g => g.id === 'g1').complete).toBe(false)
  })

  it('caps pct at 1 when over target', () => {
    const overdepositedDeposits = [...deposits, { goal_id: 'g3', amount: '500.00' }]
    const result = computeGoalStats(goals, overdepositedDeposits)
    expect(result.find(g => g.id === 'g3').pct).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useGoals.test
```

Expected: FAIL — `computeGoalStats is not a function`

- [ ] **Step 3: Create useGoals.js**

Create `src/hooks/useGoals.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function computeGoalStats(goals, deposits) {
  const depositMap = {}
  for (const d of deposits) {
    depositMap[d.goal_id] = (depositMap[d.goal_id] || 0) + Number(d.amount)
  }
  return goals.map(g => {
    const current = depositMap[g.id] || 0
    const target = Number(g.target_amount)
    const pct = Math.min(current / target, 1)
    return { ...g, current_amount: current, pct, complete: current >= target }
  })
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const [{ data: goalsData, error: goalsErr }, { data: depositsData, error: depositsErr }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('goal_deposits').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ])

    if (goalsErr || depositsErr) { setError(goalsErr || depositsErr); setLoading(false); return }
    setGoals(goalsData)
    setDeposits(depositsData)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchGoals()
  }, [fetchGoals, user])

  async function addGoal({ name, emoji, target_amount, deadline }) {
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: user.id, name, emoji: emoji || '🎯', target_amount: Number(target_amount), deadline: deadline || null })
      .select()
      .single()
    if (error) throw error
    setGoals(prev => [...prev, data])
    return data
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setGoals(prev => prev.filter(g => g.id !== id))
    setDeposits(prev => prev.filter(d => d.goal_id !== id))
  }

  async function addDeposit({ goal_id, amount, date, note }) {
    const { data, error } = await supabase
      .from('goal_deposits')
      .insert({ goal_id, user_id: user.id, amount: Number(amount), date, note: note || null })
      .select()
      .single()
    if (error) throw error
    setDeposits(prev => [data, ...prev])
    return data
  }

  async function deleteDeposit(id) {
    const { error } = await supabase.from('goal_deposits').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setDeposits(prev => prev.filter(d => d.id !== id))
  }

  const goalsWithStats = computeGoalStats(goals, deposits)

  return { goals: goalsWithStats, deposits, loading, error, addGoal, deleteGoal, addDeposit, deleteDeposit, refetch: fetchGoals }
}
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
npm test -- useGoals.test
```

Expected: all 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGoals.js src/hooks/useGoals.test.js
git commit -m "feat: add useGoals hook with computeGoalStats"
```

---

## Task 9: GoalRing + GoalSheet + Goals Page

**Files:**
- Create: `src/components/GoalRing.jsx`
- Create: `src/components/GoalSheet.jsx`
- Modify: `src/pages/Goals.jsx`

- [ ] **Step 1: Create GoalRing component**

Create `src/components/GoalRing.jsx`:

```jsx
export default function GoalRing({ pct, complete }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  const color = complete ? '#34d399' : '#a78bfa'

  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color, fontSize: 11, fontWeight: 700 }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create GoalSheet component**

Create `src/components/GoalSheet.jsx`:

```jsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency, formatDate } from '../lib/utils'
import GoalRing from './GoalRing'

export default function GoalSheet({ goal, deposits, onClose, onAddDeposit, onDeleteDeposit, onDeleteGoal }) {
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const goalDeposits = deposits.filter(d => d.goal_id === goal.id)

  async function handleAddDeposit() {
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onAddDeposit({ goal_id: goal.id, amount, date, note })
      setAmount('')
      setNote('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setShowDepositForm(false)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function handleDeleteDeposit(id) {
    if (!confirm('Remove this deposit?')) return
    try { await onDeleteDeposit(id) } catch (err) { console.error(err) }
  }

  async function handleDeleteGoal() {
    if (!confirm(`Delete "${goal.name}"? All deposits will be lost. This cannot be undone.`)) return
    try { await onDeleteGoal(goal.id); onClose() } catch (err) { console.error(err) }
  }

  const sheet = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '448px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(13, 16, 30, 0.99)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '28px 28px 0 0', boxShadow: '0 -8px 60px rgba(0,0,0,0.7)', animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GoalRing pct={goal.pct} complete={goal.complete} />
            <div>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{goal.emoji} {goal.name}</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '2px 0 0' }}>
                {formatCurrency(goal.current_amount)} of {formatCurrency(Number(goal.target_amount))}
                {goal.deadline ? ` · ${formatDate(goal.deadline)}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '12px', color: '#94A3B8', cursor: 'pointer', padding: '8px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Add deposit form */}
          {showDepositForm ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>Add deposit</p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700, fontSize: '18px' }}>$</span>
                <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                  className="glass-input" style={{ width: '100%', borderRadius: '12px', paddingLeft: '34px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px', fontSize: '20px', fontWeight: 700, boxSizing: 'border-box' }}
                  placeholder="0.00" autoFocus />
              </div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="glass-input" style={{ width: '100%', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box' }} />
              <input value={note} onChange={e => setNote(e.target.value)}
                className="glass-input" style={{ width: '100%', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Note (optional)" maxLength={100} />
              {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAddDeposit} disabled={saving} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving…' : 'Add'}
                </button>
                <button onClick={() => { setShowDepositForm(false); setAmount(''); setNote(''); setError('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDepositForm(true)}
              className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Deposit
            </button>
          )}

          {/* Deposit history */}
          {goalDeposits.length > 0 && (
            <div>
              <p style={{ color: '#64748B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Deposit History</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', overflow: 'hidden' }}>
                {goalDeposits.map((d, i) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: i < goalDeposits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div>
                      <p style={{ color: '#34d399', fontWeight: 700, fontSize: '14px', margin: 0 }}>+{formatCurrency(d.amount)}</p>
                      <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
                        {formatDate(d.date)}{d.note ? ` · ${d.note}` : ''}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteDeposit(d.id)} aria-label="Delete deposit" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete goal */}
          <button onClick={handleDeleteGoal}
            style={{ marginTop: '8px', width: '100%', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
            Delete goal
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(sheet, document.body)
}
```

- [ ] **Step 3: Build Goals page**

Replace the stub in `src/pages/Goals.jsx`:

```jsx
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { useGoals } from '../hooks/useGoals'
import { formatCurrency } from '../lib/utils'
import GoalRing from '../components/GoalRing'
import GoalSheet from '../components/GoalSheet'
import { SkeletonStatCards } from '../components/Skeleton'

export default function Goals() {
  const { goals, deposits, loading, error, addGoal, deleteGoal, addDeposit, deleteDeposit } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const selectedGoal = goals.find(g => g.id === selectedGoalId) ?? null
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newTarget, setNewTarget] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)

  async function handleAddGoal() {
    if (!newName.trim()) { setFormError('Enter a goal name'); return }
    if (!newTarget || Number(newTarget) <= 0) { setFormError('Enter a valid target amount'); return }
    setSaving(true)
    setFormError('')
    try {
      await addGoal({ name: newName.trim(), emoji: newEmoji, target_amount: newTarget, deadline: newDeadline || null })
      setShowNewForm(false)
      setNewName('')
      setNewEmoji('🎯')
      setNewTarget('')
      setNewDeadline('')
    } catch (err) { setFormError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Goals</h1>
          {goals.length > 0 && (
            <p className="text-xs text-gray-500 font-body mt-0.5">{formatCurrency(totalSaved)} saved across {goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-2xl px-4 py-3 text-expense text-sm text-center">Failed to load goals. Please refresh.</div>
      )}

      {loading ? <SkeletonStatCards /> : (
        <>
          {goals.length === 0 && !showNewForm && (
            <div className="glass-card rounded-2xl px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-body">No goals yet</p>
              <p className="text-gray-600 text-xs mt-1 font-body">Create your first savings goal below</p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-up">
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoalId(g.id)}
                  className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
                  style={g.complete ? { border: '1px solid rgba(52,211,153,0.3)' } : {}}
                >
                  <GoalRing pct={g.pct} complete={g.complete} />
                  <div>
                    <p className="text-sm font-semibold text-white">{g.emoji} {g.name}</p>
                    <p className="text-xs text-gray-500 font-body mt-0.5">
                      {formatCurrency(g.current_amount)} / {formatCurrency(Number(g.target_amount))}
                    </p>
                    {g.deadline && (
                      <p className="text-xs font-body mt-0.5" style={{ color: g.complete ? '#34d399' : '#64748B' }}>
                        {g.complete ? '🎉 Complete!' : g.deadline}
                      </p>
                    )}
                    {!g.deadline && g.complete && (
                      <p className="text-xs text-income font-body mt-0.5">🎉 Complete!</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* New goal form */}
          {showNewForm ? (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">New Goal</h2>
                <button onClick={() => { setShowNewForm(false); setFormError('') }} className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Emoji</label>
                  <input
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    className="glass-input rounded-xl px-3 py-3 text-xl text-center"
                    style={{ width: '56px' }}
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Goal name</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                    placeholder="e.g. Vacation Fund"
                    autoFocus
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Target amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="glass-input w-full rounded-xl pl-8 pr-4 py-3 text-xl font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Deadline <span className="text-gray-600 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
                />
              </div>

              {formError && <p className="text-expense text-sm font-body">{formError}</p>}

              <button onClick={handleAddGoal} disabled={saving} className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-40">
                {saving ? 'Creating…' : 'Create Goal'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer animate-fade-up"
              style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <Plus size={16} /> New goal
            </button>
          )}
        </>
      )}

      {selectedGoal && (
        <GoalSheet
          goal={selectedGoal}
          deposits={deposits}
          onClose={() => setSelectedGoalId(null)}
          onAddDeposit={addDeposit}
          onDeleteDeposit={deleteDeposit}
          onDeleteGoal={async (id) => { await deleteGoal(id); setSelectedGoalId(null) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Navigate to `/goals`:
- Empty state shows with "New goal" button
- Create a goal: enter emoji, name, target amount, optional deadline → tile appears in 2-col grid with circular ring
- Tap a goal tile → GoalSheet opens with "Add Deposit" button
- Add a deposit → ring fills, deposit appears in history
- Delete a deposit → history updates, ring shrinks
- Complete a goal (deposits >= target) → ring turns green, shows "🎉 Complete!"
- Delete goal → confirms, removes from grid

- [ ] **Step 5: Commit**

```bash
git add src/components/GoalRing.jsx src/components/GoalSheet.jsx src/pages/Goals.jsx
git commit -m "feat: add Goals page with circular rings, deposit tracking, and goal sheet"
```

---

## Task 10: Settings — Manage Categories Link

**Files:**
- Modify: `src/pages/Settings.jsx`

- [ ] **Step 1: Add Manage Categories link to Settings**

In `src/pages/Settings.jsx`, add the `Tag, ChevronRight` import to lucide-react:

```jsx
import { LogOut, Shield, MessageCircle, KeyRound, AlertTriangle, CheckCircle, Tag, ChevronRight } from 'lucide-react'
```

Add `useNavigate` import:
```jsx
import { useNavigate } from 'react-router-dom'
```

Add `const navigate = useNavigate()` inside the component body.

Insert a new section after the `</section>` closing tag of the "Change Password" section, and before the Telegram section:

```jsx
{/* Manage Categories */}
<button
  onClick={() => navigate('/categories')}
  className="glass-card rounded-2xl p-5 flex items-center gap-3 w-full text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
>
  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.12)' }}>
    <Tag size={15} className="text-accent" aria-hidden="true" />
  </div>
  <div className="flex-1">
    <h2 className="text-sm font-semibold text-white">Manage Categories</h2>
    <p className="text-xs text-gray-500 font-body mt-0.5">Add, edit, or remove your custom categories</p>
  </div>
  <ChevronRight size={16} className="text-gray-600" aria-hidden="true" />
</button>
```

- [ ] **Step 2: Verify in browser**

Navigate to Settings. "Manage Categories" row should appear. Tapping it navigates to `/categories`. Confirm all existing category management (add, edit, delete) still works.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Settings.jsx
git commit -m "feat: add Manage Categories link to Settings page"
```

---

## Completion Checklist

- [ ] Migration applied — `budgets`, `goals`, `goal_deposits` tables exist, `is_recurring` column on `transactions`
- [ ] BottomNav shows: Home · Transactions · Reports · Budgets · Goals
- [ ] Settings gear icon visible on mobile (top nav strip)
- [ ] Transaction form has recurring toggle
- [ ] Transaction items show recurring icon when flagged
- [ ] Dashboard shows recurring summary card with monthly total
- [ ] Transactions page has inline search, date range pill, recurring filter
- [ ] `/budgets` page: summary ring + 2-col status grid, add/edit/delete budgets
- [ ] `/goals` page: 2-col ring grid, goal sheet with deposit history
- [ ] Settings has "Manage Categories" link
- [ ] All tests pass: `npm test`

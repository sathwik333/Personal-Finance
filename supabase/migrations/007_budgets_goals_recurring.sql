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

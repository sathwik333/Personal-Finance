-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table (stores telegram linking data; linked 1-to-1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  telegram_chat_id bigint unique,
  telegram_link_code text unique,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile" on profiles
  for select using (id = auth.uid());

create policy "Users can update own profile" on profiles
  for update using (id = auth.uid());

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

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

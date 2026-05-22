-- The UNIQUE constraint on telegram_link_code treats NULL as non-distinct in PG15,
-- causing "duplicate key" errors for every user after the first who signs up.
-- Replace it with a partial unique index that only enforces uniqueness on non-null values.
alter table profiles drop constraint profiles_telegram_link_code_key;

create unique index profiles_telegram_link_code_unique
  on profiles (telegram_link_code)
  where telegram_link_code is not null;

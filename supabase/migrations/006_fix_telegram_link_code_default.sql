-- Remove any non-null default on telegram_link_code.
-- If the column defaulted to '' (empty string), every signup would insert a duplicate
-- empty string, violating the unique index even though the trigger only inserts (id).
ALTER TABLE profiles ALTER COLUMN telegram_link_code DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN telegram_link_code SET DEFAULT NULL;

-- Remove stale "month" column from budgets table (schema mismatch from earlier creation)
alter table budgets drop column if exists month;

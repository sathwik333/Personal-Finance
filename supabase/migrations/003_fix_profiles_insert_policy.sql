-- Allow the trigger (running as postgres/service role) to insert profiles on signup.
-- The handle_new_user() trigger is security definer so it bypasses RLS, but
-- some Supabase versions enforce RLS even for security definer functions.
create policy "Service role can insert profiles" on profiles
  for insert with check (true);

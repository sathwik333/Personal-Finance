-- Allow users to delete their own profile row (required for account deletion flow in Settings)
create policy "Users can delete own profile" on profiles
  for delete using (id = auth.uid());

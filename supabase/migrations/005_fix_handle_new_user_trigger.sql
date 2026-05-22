-- Reset trigger to only insert id on signup.
-- Link codes are generated on-demand from the Settings page, not at account creation.
-- The old trigger was auto-generating link codes which caused collisions on the unique index.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

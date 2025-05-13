-- Add provider metadata columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS provider_id text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON profiles(provider_id);

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.provider IS 'The OAuth provider (e.g., google)';
COMMENT ON COLUMN profiles.provider_id IS 'The unique identifier from the OAuth provider';
COMMENT ON COLUMN profiles.full_name IS 'The user''s full name from the OAuth provider';
COMMENT ON COLUMN profiles.avatar_url IS 'The user''s avatar URL from the OAuth provider'; 
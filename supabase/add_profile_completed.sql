-- Add profile_completed column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have profile_completed = false (or true if you want to assume existing users are complete, but safer to say false)
-- However, if we want to force existing users to complete profile, false is better.
UPDATE public.users SET profile_completed = FALSE WHERE profile_completed IS NULL;

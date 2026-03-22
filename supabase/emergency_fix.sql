-- EMERGENCY FIX FOR INFINITE RECURSION (Error 42P17)

-- 1. Disable RLS immediately to stop the recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies on the users table. 
-- We iterate through them to ensure we catch any hidden or lingering policies.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create NON-RECURSIVE policies
-- These policies do NOT query the users table within themselves.

-- Policy 1: Everyone can read basic profile info (Required for login/profile fetch)
CREATE POLICY "public_read_access"
ON public.users FOR SELECT
USING (true);

-- Policy 2: Users can insert their own profile (Required for signup)
CREATE POLICY "user_insert_own"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "user_update_own"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 5. Fix Storage Policies (just in case)
-- Drop potentially problematic storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;

-- Recreate simple storage policies
CREATE POLICY "public_avatar_read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "auth_avatar_upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "owner_avatar_update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "owner_avatar_delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

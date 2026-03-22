-- 1. Temporarily disable RLS to break the loop immediately
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on the 'users' table
-- We use a DO block to iterate and drop everything to be sure
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

-- 4. Create SIMPLE, SAFE policies that cannot recurse

-- Allow everyone to read profiles (needed for login checks and public profiles)
CREATE POLICY "allow_select_everyone" 
ON public.users 
FOR SELECT 
USING (true);

-- Allow users to insert their OWN profile (for sign up)
CREATE POLICY "allow_insert_own" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their OWN profile
CREATE POLICY "allow_update_own" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- 5. Check Storage Policies (just in case they are causing issues too)
-- Drop potential recursive storage policies
DROP POLICY IF EXISTS "Give users access to own folder 1ok12a_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12a_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12a_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12a_3" ON storage.objects;

-- Ensure standard storage policies exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );

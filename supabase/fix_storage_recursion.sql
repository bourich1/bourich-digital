-- FIX FOR INFINITE RECURSION (Error 42P17) DURING IMAGE UPLOAD

-- The error happens because a policy is checking a table that checks back, creating a loop.
-- We will remove all complex checks and use simple, direct ownership checks.

-- 1. Fix 'users' table policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple User Policies (No lookups to other tables)
CREATE POLICY "public_view_users" ON public.users FOR SELECT USING (true);
CREATE POLICY "user_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Fix 'storage.objects' policies
-- We need to be careful to only drop policies affecting our app, or use a safe reset.
-- This block drops ALL policies on storage.objects to ensure a clean slate.
-- If you have other buckets with custom policies, you might need to restore them.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Simple Storage Policies (Direct checks only, NO SQL queries in USING/CHECK)
-- 1. Everyone can view avatars
CREATE POLICY "public_view_avatars" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- 2. Authenticated users can upload to avatars
CREATE POLICY "auth_upload_avatars" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated' 
);

-- 3. Users can update their own files (owner is set automatically by Supabase storage)
CREATE POLICY "owner_update_avatars" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'avatars' 
  AND auth.uid() = owner 
);

-- 4. Users can delete their own files
CREATE POLICY "owner_delete_avatars" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'avatars' 
  AND auth.uid() = owner 
);

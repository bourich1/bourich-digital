-- 1. USERS Table Schema
-- Updates the users table to include all profile fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS domain_of_interest TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS join_reasons TEXT[],
ADD COLUMN IF NOT EXISTS tools_preferences TEXT[],
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. TOOLS Table Schema
-- Creates the table for managing tools
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add basic policies for tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view public tools
DROP POLICY IF EXISTS "Public tools are viewable by everyone" ON public.tools;
CREATE POLICY "Public tools are viewable by everyone" 
ON public.tools FOR SELECT 
USING ( is_public = true );

-- Policy: Admins can manage all tools
DROP POLICY IF EXISTS "Admins can manage tools" ON public.tools;
CREATE POLICY "Admins can manage tools" 
ON public.tools FOR ALL 
USING ( 
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin') 
);

-- 3. CONTACT_MESSAGES Table Schema
-- Creates the table for contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add basic policies for messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert a message
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK ( true );

-- Policy: Admins can view/delete messages
DROP POLICY IF EXISTS "Admins can manage messages" ON public.contact_messages;
CREATE POLICY "Admins can manage messages" 
ON public.contact_messages FOR ALL 
USING ( 
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin') 
);

-- BONUS: Storage Setup (Required for Avatars)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;
CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' );

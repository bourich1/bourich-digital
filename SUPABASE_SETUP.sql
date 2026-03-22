-- Run this in your Supabase SQL Editor to add the bio column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

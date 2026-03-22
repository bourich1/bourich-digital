-- 0. Enable required extensions
create extension if not exists pgcrypto;

-- 1. Create the verification_codes table
create table if not exists public.verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  code text not null,
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz default now(),
  attempts integer default 0
);

-- 2. Enable Row Level Security (RLS)
alter table public.verification_codes enable row level security;

-- 3. Create Policy: ONLY the backend (Service Role) can access this table
drop policy if exists "Service role only" on public.verification_codes;
create policy "Service role only" on public.verification_codes
  for all
  to service_role
  using (true)
  with check (true);

-- 4. Function to generate code and trigger email (Optional: If using DB Trigger)
-- Note: This requires pg_net extension and a valid Edge Function URL.
-- For this demo, we will handle the logic in the application server (API Route).
-- But here is the trigger code if you wish to deploy it later.

/*
create extension if not exists pg_net;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  generated_code text;
begin
  -- Generate a random 6-digit code
  generated_code := floor(random() * (999999 - 100000 + 1) + 100000)::text;

  -- Insert into verification_codes
  insert into public.verification_codes (user_id, email, code)
  values (new.id, new.email, generated_code);

  -- Call the Edge Function (Replace URL and Key)
  perform net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY' 
    ),
    body := jsonb_build_object(
      'email', new.email,
      'code', generated_code
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/

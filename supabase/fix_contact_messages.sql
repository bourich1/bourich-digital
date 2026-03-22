-- Fix contact_messages table if it exists or create it
drop table if exists public.contact_messages cascade;

create table public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies for Contact Messages
drop policy if exists "Everyone can insert messages" on public.contact_messages;
create policy "Everyone can insert messages"
  on public.contact_messages for insert
  with check ( true );

drop policy if exists "Admins can view messages" on public.contact_messages;
create policy "Admins can view messages"
  on public.contact_messages for select
  using ( auth.role() = 'authenticated' );

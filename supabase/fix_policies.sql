-- Drop all policies on users table to fix infinite recursion
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where tablename = 'users') loop
    execute 'drop policy "' || r.policyname || '" on public.users';
  end loop;
end $$;

-- Re-enable RLS
alter table public.users enable row level security;

-- Recreate correct policies
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Drop all policies on storage.objects related to avatars to be safe
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where tablename = 'objects' and schemaname = 'storage') loop
    -- Only drop policies that mention 'avatars' in their definition or name if possible, but safer to just drop known ones by name
    -- Or just drop all policies on objects? No, that might break other buckets.
    -- Let's just drop the ones we created or might have created.
    if r.policyname = 'Avatar images are publicly accessible.' or 
       r.policyname = 'Anyone can upload an avatar.' or 
       r.policyname = 'Anyone can update their own avatar.' then
      execute 'drop policy "' || r.policyname || '" on storage.objects';
    end if;
  end loop;
end $$;

-- Recreate storage policies
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

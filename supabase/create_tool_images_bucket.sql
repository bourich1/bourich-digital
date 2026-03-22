-- Create storage bucket for tool images
insert into storage.buckets (id, name, public)
values ('tool-images', 'tool-images', true)
on conflict (id) do nothing;

-- Drop existing policies if any
drop policy if exists "Tool images are publicly accessible." on storage.objects;
drop policy if exists "Authenticated users can upload tool images." on storage.objects;
drop policy if exists "Users can update their own tool images." on storage.objects;
drop policy if exists "Users can delete their own tool images." on storage.objects;

-- Storage policies for tool-images
create policy "Tool images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'tool-images' );

create policy "Authenticated users can upload tool images."
  on storage.objects for insert
  with check ( bucket_id = 'tool-images' AND auth.role() = 'authenticated' );

create policy "Users can update their own tool images."
  on storage.objects for update
  using ( bucket_id = 'tool-images' AND auth.uid() = owner );

create policy "Users can delete their own tool images."
  on storage.objects for delete
  using ( bucket_id = 'tool-images' AND auth.uid() = owner );

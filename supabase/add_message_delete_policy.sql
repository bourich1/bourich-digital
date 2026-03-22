-- Allow admins to delete messages
create policy "Admins can delete messages"
  on public.contact_messages for delete
  using ( auth.role() = 'authenticated' );

-- Storage for images embedded in project notes. The Tiptap starter's demo upload stub
-- returned a placeholder path and discarded the file; handleImageUpload now writes here.
--
-- The bucket is public-read on purpose: the returned URL is embedded in the saved notes
-- HTML and has to keep resolving, whereas a signed URL would expire and leave dead
-- images in old notes. Writes are restricted to authenticated users below, and object
-- names are random UUIDs, so objects aren't enumerable or guessable.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notes-images',
  'notes-images',
  true,
  5242880, -- 5MB, matches MAX_FILE_SIZE in src/lib/tiptap-utils.ts
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "notes-images authenticated insert" on storage.objects;
drop policy if exists "notes-images authenticated update" on storage.objects;
drop policy if exists "notes-images authenticated delete" on storage.objects;

create policy "notes-images authenticated insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'notes-images');

create policy "notes-images authenticated update" on storage.objects
  for update to authenticated
  using (bucket_id = 'notes-images') with check (bucket_id = 'notes-images');

create policy "notes-images authenticated delete" on storage.objects
  for delete to authenticated using (bucket_id = 'notes-images');

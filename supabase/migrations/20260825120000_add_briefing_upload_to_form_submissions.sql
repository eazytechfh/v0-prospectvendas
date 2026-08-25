alter table public.form_submissions
  add column briefing_url text,
  add column briefing_filename text;

insert into storage.buckets (id, name, public)
values ('briefings', 'briefings', true)
on conflict (id) do nothing;

-- TEMPORARIO: a role anon recebe acesso enquanto /interno nao possui autenticacao,
-- assim como as demais policies de form_submissions. Remova anon assim que a
-- autenticacao da area interna for implementada.
create policy "insert de briefings para authenticated e anon"
  on storage.objects
  for insert
  to authenticated, anon
  with check (bucket_id = 'briefings');

create policy "select de briefings para authenticated e anon"
  on storage.objects
  for select
  to authenticated, anon
  using (bucket_id = 'briefings');

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('apc_servicos', 'apc_contabilidade')),
  company_name text,
  answers jsonb not null,
  read boolean not null default false,
  webhook_delivered boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_form_submissions_created
  on public.form_submissions (created_at desc);

create index idx_form_submissions_unread
  on public.form_submissions (created_at desc)
  where read = false;

alter publication supabase_realtime add table public.form_submissions;

alter table public.form_submissions enable row level security;

-- TEMPORARIO: a role anon recebe acesso enquanto /interno nao possui autenticacao.
-- Remova anon destas policies assim que a autenticacao da area interna for implementada.
create policy "select para authenticated e anon"
  on public.form_submissions
  for select
  to authenticated, anon
  using (true);

create policy "insert para authenticated e anon"
  on public.form_submissions
  for insert
  to authenticated, anon
  with check (true);

create policy "update para authenticated e anon"
  on public.form_submissions
  for update
  to authenticated, anon
  using (true)
  with check (true);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  action text not null,
  submission_id uuid references public.form_submissions(id) on delete set null,
  company_name text,
  form_type text,
  details jsonb,
  tokens_used integer,
  error text
);

create index idx_activity_logs_created_at
  on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

-- TEMPORARIO: anon e usado pelo painel interno e pelas rotas do servidor sem autenticacao.
create policy "select para authenticated e anon"
  on public.activity_logs
  for select
  to authenticated, anon
  using (true);

create policy "insert para authenticated e anon"
  on public.activity_logs
  for insert
  to authenticated, anon
  with check (true);
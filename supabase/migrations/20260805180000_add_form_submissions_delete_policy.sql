-- TEMPORARIO: a role anon recebe acesso enquanto /interno nao possui autenticacao.
-- Remova anon desta policy assim que a autenticacao da area interna for implementada.
create policy "delete para authenticated e anon"
  on public.form_submissions
  for delete
  to authenticated, anon
  using (true);

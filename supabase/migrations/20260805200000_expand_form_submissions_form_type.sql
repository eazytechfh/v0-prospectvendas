alter table public.form_submissions
  drop constraint if exists form_submissions_form_type_check;

alter table public.form_submissions
  add constraint form_submissions_form_type_check
  check (form_type in (
    'apc_servicos',
    'apc_contabilidade',
    'entrevista_diretoria',
    'entrevista_equipe_comercial'
  ));


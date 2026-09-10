alter table public.form_submissions
  add column if not exists drive_folder_id text,
  add column if not exists drive_briefing_file_id text,
  add column if not exists drive_briefing_url text,
  add column if not exists drive_plano_file_id text,
  add column if not exists drive_plano_url text,
  add column if not exists drive_sync_error text,
  add column if not exists drive_synced_at timestamptz;

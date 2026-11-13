-- Juma Finance: einmal im Supabase SQL Editor ausführen.
-- Die Tabelle enthält nur verschlüsselte Pakete (ein Paket pro Monat, plus Einstellungen).

create table if not exists public.juma_docs (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.juma_docs enable row level security;

drop policy if exists "eigene Daten" on public.juma_docs;
create policy "eigene Daten" on public.juma_docs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Echtzeit-Abgleich zwischen den Geräten
alter publication supabase_realtime add table public.juma_docs;

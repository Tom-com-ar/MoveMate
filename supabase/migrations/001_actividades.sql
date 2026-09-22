create table if not exists public.actividades (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('caminata', 'carrera', 'bicicleta')),
  iniciada_en timestamptz not null,
  finalizada_en timestamptz not null,
  duracion_segundos integer not null check (duracion_segundos >= 0),
  distancia_metros double precision not null check (distancia_metros >= 0),
  calorias integer not null check (calorias >= 0),
  ruta jsonb not null default '[]'::jsonb,
  creada_en timestamptz not null default now()
);

create index if not exists actividades_usuario_fecha_indice
  on public.actividades (usuario_id, iniciada_en desc);

alter table public.actividades enable row level security;

drop policy if exists "Cada usuario lee sus actividades" on public.actividades;
create policy "Cada usuario lee sus actividades"
  on public.actividades
  for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

drop policy if exists "Cada usuario crea sus actividades" on public.actividades;
create policy "Cada usuario crea sus actividades"
  on public.actividades
  for insert
  to authenticated
  with check ((select auth.uid()) = usuario_id);

drop policy if exists "Cada usuario actualiza sus actividades" on public.actividades;
create policy "Cada usuario actualiza sus actividades"
  on public.actividades
  for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

drop policy if exists "Cada usuario elimina sus actividades" on public.actividades;
create policy "Cada usuario elimina sus actividades"
  on public.actividades
  for delete
  to authenticated
  using ((select auth.uid()) = usuario_id);

grant select, insert, update, delete on public.actividades to authenticated;

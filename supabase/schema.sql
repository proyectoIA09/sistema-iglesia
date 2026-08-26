-- ============================================================
-- Esquema de base de datos: Sistema de Iglesia
-- Ejecutar en Supabase -> SQL Editor
-- ============================================================

-- Roles posibles: admin, pastor, supervisor, lider, finanzas
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  role text not null default 'lider' check (role in ('admin','pastor','supervisor','lider','finanzas')),
  zona_id uuid,
  telefono text,
  creado_en timestamptz not null default now()
);

create table if not exists public.zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  supervisor_id uuid references public.profiles(id),
  creado_en timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_zona_fk foreign key (zona_id) references public.zonas(id);

create table if not exists public.celulas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  zona_id uuid references public.zonas(id) on delete set null,
  lider_id uuid references public.profiles(id) on delete set null,
  dia_semana text,
  hora time,
  ubicacion text,
  activa boolean not null default true,
  motivo_inactiva text,
  fecha_inactiva date,
  creado_en timestamptz not null default now()
);

create table if not exists public.reportes_celula (
  id uuid primary key default gen_random_uuid(),
  celula_id uuid not null references public.celulas(id) on delete cascade,
  fecha date not null,
  ninos int not null default 0,
  jovenes int not null default 0,
  adultos int not null default 0,
  mayores int not null default 0,
  visitantes int not null default 0,
  conversiones int not null default 0,
  reconciliaciones int not null default 0,
  ofrenda numeric(12,2) not null default 0,
  notas text,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  creado_por uuid references public.profiles(id),
  creado_en timestamptz not null default now(),
  unique (celula_id, fecha)
);

-- Registro de visitantes de cada reporte: nombre, edad y teléfono para poder darles seguimiento
create table if not exists public.visitantes_celula (
  id uuid primary key default gen_random_uuid(),
  reporte_id uuid not null references public.reportes_celula(id) on delete cascade,
  nombre text not null,
  edad int,
  telefono text,
  creado_en timestamptz not null default now()
);

create table if not exists public.fondos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text
);

insert into public.fondos (nombre, descripcion)
values ('Fondo General', 'Ingresos y gastos generales de la iglesia'),
       ('Fondo de Misiones', 'Ofrendas y gastos destinados a misiones'),
       ('Fondo de Construcción', 'Ofrendas y gastos de proyectos de infraestructura')
on conflict (nombre) do nothing;

create table if not exists public.movimientos_financieros (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ingreso','gasto')),
  categoria text not null,
  monto numeric(12,2) not null check (monto > 0),
  fondo_id uuid references public.fondos(id),
  fecha date not null,
  origen text not null default 'otro' check (origen in ('celula','servicio','donacion','otro')),
  celula_id uuid references public.celulas(id),
  descripcion text,
  creado_por uuid references public.profiles(id),
  creado_en timestamptz not null default now()
);

-- ============================================================
-- Proyectos: fondos con meta y tiempo definido (ej. "Siembra para mi casa")
-- ============================================================
create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  meta numeric(12,2) not null check (meta > 0),
  duracion_meses int not null check (duracion_meses > 0),
  fecha_inicio date not null default current_date,
  activo boolean not null default true,
  creado_por uuid references public.profiles(id),
  creado_en timestamptz not null default now()
);

create table if not exists public.aportes_proyecto (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  monto numeric(12,2) not null check (monto > 0),
  fecha date not null default current_date,
  origen text,
  creado_por uuid references public.profiles(id),
  creado_en timestamptz not null default now()
);

create or replace view public.vw_proyectos_resumen as
select
  p.id, p.nombre, p.descripcion, p.meta, p.duracion_meses, p.fecha_inicio, p.activo,
  coalesce(sum(a.monto), 0) as recaudado
from public.proyectos p
left join public.aportes_proyecto a on a.proyecto_id = p.id
group by p.id;

-- ============================================================
-- Vista consolidada para el reporte general de iglesia
-- ============================================================
create or replace view public.vw_reporte_general as
select
  rc.id as reporte_id,
  date_trunc('month', rc.fecha)::date as mes,
  z.nombre as zona,
  c.nombre as celula,
  rc.fecha,
  rc.ninos,
  rc.jovenes,
  rc.adultos,
  rc.mayores,
  rc.visitantes,
  rc.conversiones,
  rc.reconciliaciones,
  (rc.ninos + rc.jovenes + rc.adultos + rc.mayores + rc.visitantes) as total_asistentes,
  rc.ofrenda
from public.reportes_celula rc
join public.celulas c on c.id = rc.celula_id
left join public.zonas z on z.id = c.zona_id;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.zonas enable row level security;
alter table public.celulas enable row level security;
alter table public.reportes_celula enable row level security;
alter table public.fondos enable row level security;
alter table public.movimientos_financieros enable row level security;

-- Helper: rol del usuario autenticado
create or replace function public.mi_rol() returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.mi_zona() returns uuid as $$
  select zona_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- Profiles: cada quien ve su propio perfil; admin/pastor ven todos
create policy "ver propio perfil o admin" on public.profiles
  for select using (id = auth.uid() or public.mi_rol() in ('admin','pastor'));
create policy "actualizar propio perfil" on public.profiles
  for update using (id = auth.uid() or public.mi_rol() = 'admin');

-- Zonas y células: lectura abierta a usuarios autenticados
create policy "leer zonas" on public.zonas for select using (auth.uid() is not null);
create policy "leer celulas" on public.celulas for select using (auth.uid() is not null);
create policy "admin gestiona zonas" on public.zonas for all using (public.mi_rol() in ('admin','pastor'));
create policy "admin gestiona celulas" on public.celulas for all using (public.mi_rol() in ('admin','pastor','supervisor'));

-- Reportes de célula: líder crea/edita los suyos; supervisor ve su zona; admin/pastor/finanzas ven todo
create policy "ver reportes" on public.reportes_celula for select using (
  public.mi_rol() in ('admin','pastor','finanzas')
  or exists (select 1 from public.celulas c where c.id = celula_id and c.lider_id = auth.uid())
  or exists (select 1 from public.celulas c where c.id = celula_id and c.zona_id = public.mi_zona() and public.mi_rol() = 'supervisor')
);
create policy "crear reportes propios" on public.reportes_celula for insert with check (
  exists (select 1 from public.celulas c where c.id = celula_id and c.lider_id = auth.uid())
  or public.mi_rol() in ('admin','pastor','supervisor')
);
create policy "editar reportes propios" on public.reportes_celula for update using (
  exists (select 1 from public.celulas c where c.id = celula_id and c.lider_id = auth.uid())
  or public.mi_rol() in ('admin','pastor','supervisor')
);

-- Fondos: lectura abierta, escritura solo finanzas/admin
create policy "leer fondos" on public.fondos for select using (auth.uid() is not null);
create policy "gestionar fondos" on public.fondos for all using (public.mi_rol() in ('admin','finanzas'));

-- Movimientos financieros: solo admin/pastor/finanzas
create policy "ver movimientos" on public.movimientos_financieros for select using (
  public.mi_rol() in ('admin','pastor','finanzas')
);
create policy "crear movimientos" on public.movimientos_financieros for insert with check (
  public.mi_rol() in ('admin','pastor','finanzas')
);
create policy "editar movimientos" on public.movimientos_financieros for update using (
  public.mi_rol() in ('admin','pastor','finanzas')
);

-- Visitantes de célula: mismas reglas de acceso que su reporte
alter table public.visitantes_celula enable row level security;
create policy "ver visitantes" on public.visitantes_celula for select using (
  exists (
    select 1 from public.reportes_celula rc join public.celulas c on c.id = rc.celula_id
    where rc.id = reporte_id and (
      public.mi_rol() in ('admin','pastor','finanzas')
      or c.lider_id = auth.uid()
      or (c.zona_id = public.mi_zona() and public.mi_rol() = 'supervisor')
    )
  )
);
create policy "crear visitantes" on public.visitantes_celula for insert with check (
  exists (
    select 1 from public.reportes_celula rc join public.celulas c on c.id = rc.celula_id
    where rc.id = reporte_id and (c.lider_id = auth.uid() or public.mi_rol() in ('admin','pastor','supervisor'))
  )
);

-- Proyectos: visibles para admin/pastor/supervisor (no líderes); gestionados por admin/pastor/supervisor
alter table public.proyectos enable row level security;
alter table public.aportes_proyecto enable row level security;
create policy "ver proyectos" on public.proyectos for select using (
  public.mi_rol() in ('admin','pastor','supervisor','finanzas')
);
create policy "gestionar proyectos" on public.proyectos for all using (
  public.mi_rol() in ('admin','pastor')
);
create policy "ver aportes" on public.aportes_proyecto for select using (
  public.mi_rol() in ('admin','pastor','supervisor','finanzas')
);
create policy "crear aportes" on public.aportes_proyecto for insert with check (
  public.mi_rol() in ('admin','pastor','supervisor','finanzas')
);

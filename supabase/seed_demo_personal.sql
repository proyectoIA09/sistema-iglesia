-- ============================================================
-- Datos ficticios de demostración (parte 2): personal, diezmos, presupuestos
-- Ejecutar en Supabase -> SQL Editor
-- (agregar a seed_demo_cleanup.sql cuando quieran borrarlo)
-- ============================================================

-- Empleados de ejemplo
insert into public.empleados (nombre_completo, cargo, dui, telefono, monto_asignado)
select v.nombre, v.cargo, v.dui, v.telefono, v.monto
from (
  values
    ('Pastor Ricardo Ernesto Majano', 'Pastor', '01234567-8', '7000-1111', 500.00),
    ('Ana Beatriz Hernández', 'Secretaria', '02345678-9', '7000-2222', 250.00),
    ('Miguel Ángel Portillo', 'Conserje', '03456789-0', '7000-3333', 180.00)
) as v(nombre, cargo, dui, telefono, monto)
where not exists (select 1 from public.empleados e where e.nombre_completo = v.nombre);

-- Pagos de planilla de los últimos 5 meses, cada uno reflejado también en Finanzas
with meses as (
  select gs::date as fecha, row_number() over (order by gs) as n
  from generate_series(date_trunc('month', current_date) - interval '4 months', date_trunc('month', current_date), interval '1 month') as gs
),
meses_es as (
  select fecha,
    (case extract(month from fecha)
      when 1 then 'enero' when 2 then 'febrero' when 3 then 'marzo' when 4 then 'abril'
      when 5 then 'mayo' when 6 then 'junio' when 7 then 'julio' when 8 then 'agosto'
      when 9 then 'septiembre' when 10 then 'octubre' when 11 then 'noviembre' else 'diciembre'
    end) || ' ' || extract(year from fecha) as label
  from meses
),
empleados_demo as (
  select id, nombre_completo, monto_asignado from public.empleados
  where nombre_completo in ('Pastor Ricardo Ernesto Majano','Ana Beatriz Hernández','Miguel Ángel Portillo')
),
fondo_general as (select id from public.fondos where nombre = 'Fondo General'),
nuevos_movimientos as (
  insert into public.movimientos_financieros (tipo, categoria, monto, fondo_id, fecha, origen, descripcion)
  select 'gasto', 'Nómina', ed.monto_asignado, (select id from fondo_general),
    (me.fecha + interval '3 days')::date, 'otro',
    '[DATO DEMO] Pago de planilla — ' || ed.nombre_completo || ' (' || me.label || ')'
  from empleados_demo ed
  cross join meses_es me
  returning id, monto, fecha, descripcion
)
insert into public.planilla_pagos (empleado_id, monto, mes_correspondiente, fecha_pago, notas, movimiento_id)
select ed.id, nm.monto, split_part(split_part(nm.descripcion, '(', 2), ')', 1), nm.fecha, '[DATO DEMO]', nm.id
from nuevos_movimientos nm
join empleados_demo ed on nm.descripcion like '%' || ed.nombre_completo || '%';

-- Códigos de sobre de ejemplo
insert into public.codigos_sobre (codigo, nombre_real, telefono)
select v.codigo, v.nombre, v.telefono
from (
  values
    ('001', 'Familia Ramírez', '7111-0001'),
    ('002', 'Juan Carlos López', '7111-0002'),
    ('003', 'María Elena Cruz', '7111-0003'),
    ('004', 'Pedro Sic', '7111-0004')
) as v(codigo, nombre, telefono)
where not exists (select 1 from public.codigos_sobre c where c.codigo = v.codigo);

-- Diezmos ficticios de los últimos 5 meses (semanal, por código)
with fechas as (
  select gs::date as fecha
  from generate_series(date_trunc('week', current_date) - interval '20 weeks', date_trunc('week', current_date), interval '1 week') as gs
)
insert into public.diezmos (codigo_sobre, monto, fecha, notas)
select codigo, round((20 + random()*80)::numeric, 2), f.fecha, '[DATO DEMO]'
from fechas f
cross join (values ('001'), ('002'), ('003'), ('004')) as c(codigo)
where random() < 0.7;

-- Presupuestos de ejemplo
insert into public.presupuestos (categoria, tipo, monto_esperado)
values
  ('Energía eléctrica', 'gasto', 90.00),
  ('Agua', 'gasto', 30.00),
  ('Mantenimiento', 'gasto', 100.00),
  ('Nómina', 'gasto', 930.00),
  ('Ofrenda de servicio', 'ingreso', 500.00)
on conflict (categoria, tipo) do nothing;

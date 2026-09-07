-- ============================================================
-- Datos ficticios de demostración: ~6 meses de operación
-- Ejecutar en Supabase -> SQL Editor
-- (Ver supabase/seed_demo_cleanup.sql para borrar todo esto después)
-- ============================================================

-- Zonas
insert into public.zonas (nombre)
select v.nombre from (values ('Zona Norte'),('Zona Sur'),('Zona Centro')) as v(nombre)
where not exists (select 1 from public.zonas z where z.nombre = v.nombre);

-- Células
with z as (select id, nombre from public.zonas)
insert into public.celulas (nombre, zona_id, dia_semana, hora, ubicacion, activa)
select c.nombre, z.id, c.dia, c.hora::time, c.ubicacion, true
from (
  values
    ('Célula Vida Nueva', 'Zona Norte', 'Miércoles', '19:00', 'Col. Las Flores'),
    ('Célula Fuente de Agua Viva', 'Zona Norte', 'Jueves', '18:30', 'Res. San Rafael'),
    ('Célula Semilla de Fe', 'Zona Sur', 'Martes', '19:00', 'Col. El Progreso'),
    ('Célula Roca Firme', 'Zona Sur', 'Viernes', '19:30', 'Barrio San José'),
    ('Célula Manantial', 'Zona Centro', 'Miércoles', '18:00', 'Modalidad virtual'),
    ('Célula Monte Sinaí', 'Zona Centro', 'Lunes', '19:00', 'Col. Monte Verde')
) as c(nombre, zona, dia, hora, ubicacion)
join z on z.nombre = c.zona
where not exists (select 1 from public.celulas existing where existing.nombre = c.nombre);

-- Reportes semanales de célula (26 semanas ~ 6 meses, con tendencia de crecimiento)
with fechas as (
  select gs::date as fecha, row_number() over (order by gs) - 1 as semana_idx
  from generate_series(date_trunc('week', current_date) - interval '25 weeks', date_trunc('week', current_date), interval '1 week') as gs
),
celulas_demo as (
  select id from public.celulas
  where nombre in ('Célula Vida Nueva','Célula Fuente de Agua Viva','Célula Semilla de Fe','Célula Roca Firme','Célula Manantial','Célula Monte Sinaí')
)
insert into public.reportes_celula (celula_id, fecha, ninos, jovenes, adultos, mayores, visitantes, conversiones, reconciliaciones, ofrenda, estado)
select
  cd.id,
  f.fecha,
  greatest(0, round(2 + (f.semana_idx::float8/25)*3 + (random()*3-1))::int),
  greatest(0, round(3 + (f.semana_idx::float8/25)*4 + (random()*3-1))::int),
  greatest(0, round(4 + (f.semana_idx::float8/25)*5 + (random()*4-1))::int),
  greatest(0, round(1 + (f.semana_idx::float8/25)*2 + (random()*2-1))::int),
  case when random() < 0.4 then floor(random()*3)::int + 1 else 0 end,
  case when random() < 0.3 then floor(random()*2)::int + 1 else 0 end,
  case when random() < 0.12 then 1 else 0 end,
  round((60 + (f.semana_idx::float8/25)*120 + random()*90)::numeric, 2),
  'aprobado'
from celulas_demo cd
cross join fechas f
on conflict (celula_id, fecha) do nothing;

-- Visitantes ficticios (para los reportes que registraron visitantes)
with candidatos as (
  select rc.id as reporte_id,
    (array['Ana Pérez','Carlos López','María Gómez','Luis Ramírez','Sofía Cruz','Diego Morales','Valeria Us','José Ixchel','Karla Chávez','Pedro Sic'])[(floor(random()*10)+1)::int] as nombre_azar,
    (18 + floor(random()*45))::int as edad_azar
  from public.reportes_celula rc
  join public.celulas c on c.id = rc.celula_id
  where rc.visitantes > 0
    and c.nombre in ('Célula Vida Nueva','Célula Fuente de Agua Viva','Célula Semilla de Fe','Célula Roca Firme','Célula Manantial','Célula Monte Sinaí')
    and not exists (select 1 from public.visitantes_celula vc where vc.reporte_id = rc.id)
)
insert into public.visitantes_celula (reporte_id, nombre, edad, telefono)
select reporte_id, nombre_azar, edad_azar, '5' || (floor(random()*9000)+1000)::text || '-' || (floor(random()*9000)+1000)::text
from candidatos;

-- Movimientos financieros (ingresos y gastos, 6 meses)
with fechas as (
  select gs::date as fecha, row_number() over (order by gs) - 1 as semana_idx
  from generate_series(date_trunc('week', current_date) - interval '25 weeks', date_trunc('week', current_date), interval '1 week') as gs
)
insert into public.movimientos_financieros (tipo, categoria, monto, fondo_id, fecha, origen, descripcion)
select 'ingreso', 'Ofrenda de servicio', round((250 + (f.semana_idx::float8/25)*400 + random()*150)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'servicio', '[DATO DEMO]'
from fechas f
union all
select 'ingreso', 'Ofrenda de células', round((80 + (f.semana_idx::float8/25)*150 + random()*80)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'celula', '[DATO DEMO]'
from fechas f
union all
select 'gasto', 'Energía eléctrica', round((60 + random()*40)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'otro', '[DATO DEMO]'
from fechas f where f.semana_idx % 4 = 0
union all
select 'gasto', 'Agua', round((20 + random()*15)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'otro', '[DATO DEMO]'
from fechas f where f.semana_idx % 4 = 0
union all
select 'gasto', 'Mantenimiento', round((40 + random()*120)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'otro', '[DATO DEMO] Reparaciones varias'
from fechas f where f.semana_idx % 6 = 2
union all
select 'gasto', 'Material para niños', round((15 + random()*35)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo General'), f.fecha, 'otro', '[DATO DEMO]'
from fechas f where f.semana_idx % 4 = 1
union all
select 'ingreso', 'Donación especial', round((150 + random()*350)::numeric, 2),
  (select id from public.fondos where nombre = 'Fondo de Misiones'), f.fecha, 'donacion', '[DATO DEMO] Apoyo a proyecto de misiones'
from fechas f where f.semana_idx % 8 = 3;

-- Proyecto de ejemplo con aportes parciales
with nuevo_proyecto as (
  insert into public.proyectos (nombre, descripcion, meta, duracion_meses, fecha_inicio, activo)
  select 'Siembra para mi casa', 'Fondo especial para ayudar con la compra de terreno.', 2500, 5, (current_date - interval '4 months')::date, true
  where not exists (select 1 from public.proyectos where nombre = 'Siembra para mi casa')
  returning id
)
insert into public.aportes_proyecto (proyecto_id, monto, fecha, origen)
select np.id, a.monto, a.fecha, a.origen
from nuevo_proyecto np
cross join (
  values
    (250.00, 'fecha_1'), (180.00, 'fecha_2'), (300.00, 'fecha_3'), (220.00, 'fecha_4'),
    (270.00, 'fecha_5'), (190.00, 'fecha_6'), (240.00, 'fecha_7'), (150.00, 'fecha_8')
) as v(monto, marcador)
cross join lateral (
  select
    case v.marcador
      when 'fecha_1' then (current_date - interval '4 months')::date
      when 'fecha_2' then (current_date - interval '3 months' - interval '2 weeks')::date
      when 'fecha_3' then (current_date - interval '3 months')::date
      when 'fecha_4' then (current_date - interval '2 months' - interval '1 week')::date
      when 'fecha_5' then (current_date - interval '2 months')::date
      when 'fecha_6' then (current_date - interval '1 month' - interval '2 weeks')::date
      when 'fecha_7' then (current_date - interval '1 month')::date
      else (current_date - interval '2 weeks')::date
    end as fecha,
    case v.marcador
      when 'fecha_1' then 'Ofrenda especial de servicio'
      when 'fecha_2' then 'Célula Vida Nueva'
      when 'fecha_3' then 'Donación de la familia Ramírez'
      when 'fecha_4' then 'Célula Semilla de Fe'
      when 'fecha_5' then 'Ofrenda especial de servicio'
      when 'fecha_6' then 'Célula Roca Firme'
      when 'fecha_7' then 'Donación de un hermano'
      else 'Célula Manantial'
    end as origen
) a(fecha, origen);

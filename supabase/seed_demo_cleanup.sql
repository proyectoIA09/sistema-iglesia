-- ============================================================
-- Borra TODOS los datos ficticios de demostración creados por seed_demo.sql
-- No afecta usuarios, cuentas ni configuración de la iglesia.
-- Ejecutar en Supabase -> SQL Editor cuando estén listos para usar datos reales.
-- ============================================================

delete from public.aportes_proyecto
where proyecto_id in (select id from public.proyectos where nombre = 'Siembra para mi casa');

delete from public.proyectos where nombre = 'Siembra para mi casa';

delete from public.visitantes_celula
where reporte_id in (
  select rc.id from public.reportes_celula rc
  join public.celulas c on c.id = rc.celula_id
  where c.nombre in ('Célula Vida Nueva','Célula Fuente de Agua Viva','Célula Semilla de Fe','Célula Roca Firme','Célula Manantial','Célula Monte Sinaí')
);

delete from public.reportes_celula
where celula_id in (
  select id from public.celulas
  where nombre in ('Célula Vida Nueva','Célula Fuente de Agua Viva','Célula Semilla de Fe','Célula Roca Firme','Célula Manantial','Célula Monte Sinaí')
);

delete from public.celulas
where nombre in ('Célula Vida Nueva','Célula Fuente de Agua Viva','Célula Semilla de Fe','Célula Roca Firme','Célula Manantial','Célula Monte Sinaí');

delete from public.zonas
where nombre in ('Zona Norte','Zona Sur','Zona Centro')
  and not exists (select 1 from public.celulas c where c.zona_id = zonas.id);

delete from public.movimientos_financieros
where descripcion like '[DATO DEMO]%';

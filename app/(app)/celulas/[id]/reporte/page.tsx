import { createClient } from "@/lib/supabase/server";
import { crearReporteCelula } from "@/lib/actions";
import { notFound } from "next/navigation";
import VisitorRegistryField from "@/components/VisitorRegistryField";

export default async function ReporteCelulaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: celula } = await supabase
    .from("celulas")
    .select("id, nombre, zonas(nombre)")
    .eq("id", params.id)
    .single();

  if (!celula) notFound();

  const hoy = new Date().toISOString().slice(0, 10);
  const crearReporteConId = crearReporteCelula.bind(null, params.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-brand-950">{celula.nombre}</h1>
      <p className="text-brand-500 text-sm mt-1 mb-6">
        {(celula as any).zonas?.nombre ?? "Sin zona"} · Reporte semanal de célula
      </p>

      <form action={crearReporteConId} className="card space-y-5">
        <div>
          <label className="label">Fecha de la reunión</label>
          <input name="fecha" type="date" required defaultValue={hoy} className="input" />
        </div>

        <div>
          <p className="label mb-2">Asistencia por edad</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Niños</label>
              <input name="ninos" type="number" min="0" defaultValue="0" className="input" />
            </div>
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Jóvenes</label>
              <input name="jovenes" type="number" min="0" defaultValue="0" className="input" />
            </div>
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Adultos</label>
              <input name="adultos" type="number" min="0" defaultValue="0" className="input" />
            </div>
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Mayores de edad avanzada</label>
              <input name="mayores" type="number" min="0" defaultValue="0" className="input" />
            </div>
          </div>
        </div>

        <div>
          <p className="label mb-2">Decisiones espirituales (opcional)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Conversiones (nuevos en la fe)</label>
              <input name="conversiones" type="number" min="0" defaultValue="0" className="input" />
            </div>
            <div>
              <label className="text-xs text-brand-500 mb-1 block">Reconciliaciones (restaurados)</label>
              <input name="reconciliaciones" type="number" min="0" defaultValue="0" className="input" />
            </div>
          </div>
        </div>

        <VisitorRegistryField />

        <div>
          <label className="label">Ofrenda recolectada ($)</label>
          <input name="ofrenda" type="number" min="0" step="0.01" defaultValue="0" className="input" />
        </div>

        <div>
          <label className="label">Notas / testimonios (opcional)</label>
          <textarea name="notas" rows={3} className="input" placeholder="Decisiones, peticiones, observaciones..." />
        </div>

        <button type="submit" className="btn-primary w-full">
          Guardar reporte
        </button>
      </form>
    </div>
  );
}

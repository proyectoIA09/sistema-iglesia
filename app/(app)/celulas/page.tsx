import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { desactivarCelula, reactivarCelula } from "@/lib/actions";

export default async function CelulasPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const supabase = createClient();
  const estado = searchParams.estado === "inactivas" ? "inactivas" : "activas";

  const [{ count: totalActivas }, { count: totalInactivas }, { data: celulas }] = await Promise.all([
    supabase.from("celulas").select("*", { count: "exact", head: true }).eq("activa", true),
    supabase.from("celulas").select("*", { count: "exact", head: true }).eq("activa", false),
    supabase
      .from("celulas")
      .select("id, nombre, dia_semana, hora, ubicacion, motivo_inactiva, fecha_inactiva, zonas(nombre)")
      .eq("activa", estado === "activas")
      .order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Células</h1>
          <p className="text-brand-500 text-sm mt-1">
            Selecciona una célula para registrar su reporte semanal
          </p>
        </div>
        <Link href="/celulas/nueva" className="btn-primary">
          + Nueva célula
        </Link>
      </div>

      <div className="inline-flex bg-brand-100/60 rounded-xl p-1 gap-1 text-sm font-medium">
        <Link
          href="/celulas?estado=activas"
          className={`px-3.5 py-1.5 rounded-lg ${
            estado === "activas" ? "bg-white shadow-card text-brand-950" : "text-brand-500"
          }`}
        >
          Activas <span className="text-brand-400">({totalActivas ?? 0})</span>
        </Link>
        <Link
          href="/celulas?estado=inactivas"
          className={`px-3.5 py-1.5 rounded-lg ${
            estado === "inactivas" ? "bg-white shadow-card text-brand-950" : "text-brand-500"
          }`}
        >
          Inactivas <span className="text-brand-400">({totalInactivas ?? 0})</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {celulas?.length ? (
          celulas.map((c: any) =>
            estado === "activas" ? (
              <div key={c.id} className="card">
                <p className="font-semibold text-brand-950">{c.nombre}</p>
                <p className="text-sm text-brand-500 mt-1">
                  {c.zonas?.nombre ?? "Sin zona"} · {c.dia_semana ?? "Sin día"}
                  {c.hora ? ` · ${c.hora}` : ""}
                </p>
                {c.ubicacion && <p className="text-sm text-brand-400 mt-1">{c.ubicacion}</p>}
                <Link
                  href={`/celulas/${c.id}/reporte`}
                  className="btn-primary w-full mt-4 justify-center"
                >
                  📋 Registrar reporte
                </Link>
                <details className="mt-2">
                  <summary className="text-xs text-brand-400 cursor-pointer hover:text-red-600 underline underline-offset-2">
                    Desactivar célula
                  </summary>
                  <form action={desactivarCelula.bind(null, c.id)} className="mt-3 space-y-2">
                    <select name="motivo" className="input text-xs py-1.5">
                      <option>Pausa temporal</option>
                      <option>El líder se retiró</option>
                      <option>Fusionada con otra célula</option>
                      <option>Bajó la asistencia</option>
                      <option>Otro</option>
                    </select>
                    <input
                      name="fecha"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="input text-xs py-1.5"
                    />
                    <button type="submit" className="w-full text-xs py-1.5 rounded-lg bg-red-50 text-red-700 font-medium">
                      Confirmar desactivación
                    </button>
                  </form>
                </details>
              </div>
            ) : (
              <div key={c.id} className="card opacity-70">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-500">{c.nombre}</p>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Inactiva
                  </span>
                </div>
                {c.motivo_inactiva && (
                  <p className="text-xs text-brand-400 italic mt-2">
                    {c.motivo_inactiva}
                    {c.fecha_inactiva ? ` — desde ${c.fecha_inactiva}` : ""}
                  </p>
                )}
                <form action={reactivarCelula.bind(null, c.id)} className="mt-4">
                  <button type="submit" className="btn-secondary w-full justify-center">
                    ↺ Reactivar célula
                  </button>
                </form>
              </div>
            )
          )
        ) : (
          <p className="text-brand-400 col-span-full text-center py-10">
            No hay células {estado === "activas" ? "activas" : "inactivas"} todavía.
          </p>
        )}
      </div>
    </div>
  );
}

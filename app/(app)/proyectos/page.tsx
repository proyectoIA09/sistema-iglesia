import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { registrarAporte } from "@/lib/actions";
import { formatUSD } from "@/lib/format";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function mesesRestantes(fechaInicio: string, duracionMeses: number) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(inicio);
  fin.setMonth(fin.getMonth() + duracionMeses);
  const hoy = new Date();
  return (fin.getFullYear() - hoy.getFullYear()) * 12 + (fin.getMonth() - hoy.getMonth());
}

function historialPorMes(aportes: { monto: number; fecha: string }[]) {
  const porMes = new Map<string, { total: number; cantidad: number }>();

  for (const a of aportes) {
    const [anio, mes] = a.fecha.split("-");
    const key = `${anio}-${mes}`;
    const actual = porMes.get(key) ?? { total: 0, cantidad: 0 };
    actual.total += Number(a.monto);
    actual.cantidad += 1;
    porMes.set(key, actual);
  }

  const filas = Array.from(porMes.entries())
    .map(([key, v]) => {
      const [anio, mes] = key.split("-").map(Number);
      return { key, label: `${MESES[mes - 1]} ${anio}`, total: v.total, cantidad: v.cantidad };
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1)); // más reciente primero

  const mesMasActivo = filas.reduce(
    (max, f) => (f.total > (max?.total ?? -1) ? f : max),
    null as (typeof filas)[number] | null
  );

  return { filas, mesMasActivo };
}

export default async function ProyectosPage() {
  const supabase = createClient();

  const { data: proyectos } = await supabase
    .from("vw_proyectos_resumen")
    .select("*")
    .eq("activo", true)
    .order("fecha_inicio", { ascending: false });

  const { data: todosLosAportes } = await supabase
    .from("aportes_proyecto")
    .select("proyecto_id, monto, fecha, origen")
    .order("fecha", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Proyectos</h1>
          <p className="text-brand-500 text-sm mt-1">
            Fondos con una meta y un tiempo definido, fuera del presupuesto general
          </p>
        </div>
        <Link href="/proyectos/nuevo" className="btn-primary">
          + Nuevo proyecto
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {proyectos?.length ? (
          proyectos.map((p: any) => {
            const pct = Math.min(100, Math.round((Number(p.recaudado) / Number(p.meta)) * 100));
            const falta = Math.max(0, Number(p.meta) - Number(p.recaudado));
            const restantes = mesesRestantes(p.fecha_inicio, p.duracion_meses);
            const restText =
              restantes > 0 ? `${restantes} meses restantes` : restantes === 0 ? "último mes" : "plazo vencido";

            const aportesDelProyecto = todosLosAportes?.filter((a) => a.proyecto_id === p.id) ?? [];
            const { filas, mesMasActivo } = historialPorMes(aportesDelProyecto);

            return (
              <div key={p.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-950 text-lg">{p.nombre}</h2>
                    {p.descripcion && <p className="text-sm text-brand-500">{p.descripcion}</p>}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-700 shrink-0">
                    {p.duracion_meses} meses
                  </span>
                </div>

                <div className="h-3 rounded-full bg-brand-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-brand-500">
                    Recaudado <b className="text-brand-950">{formatUSD(Number(p.recaudado))}</b>
                  </span>
                  <span className="font-semibold text-gold-600">{pct}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-500">
                    Meta <b className="text-brand-950">{formatUSD(Number(p.meta))}</b>
                  </span>
                  <span className="text-brand-500">
                    Faltan <b className="text-brand-950">{formatUSD(falta)}</b>
                  </span>
                </div>
                <p className="text-xs text-brand-400">{restText}</p>

                <div className="flex gap-2 flex-wrap">
                  <details className="flex-1">
                    <summary className="btn-primary text-sm inline-flex cursor-pointer">+ Registrar aporte</summary>
                    <form action={registrarAporte.bind(null, p.id)} className="mt-3 space-y-2 max-w-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <input name="monto" type="number" min="0.01" step="0.01" required placeholder="Monto ($)" className="input text-sm" />
                        <input
                          name="fecha"
                          type="date"
                          defaultValue={new Date().toISOString().slice(0, 10)}
                          className="input text-sm"
                        />
                      </div>
                      <input name="origen" placeholder="Célula o persona (opcional)" className="input text-sm" />
                      <button type="submit" className="btn-secondary w-full justify-center text-sm">
                        Guardar aporte
                      </button>
                    </form>
                  </details>

                  {filas.length > 0 && (
                    <details className="flex-1">
                      <summary className="btn-secondary text-sm inline-flex cursor-pointer">
                        📊 Historial por mes
                      </summary>
                      <div className="mt-3 space-y-3">
                        {mesMasActivo && (
                          <p className="text-xs text-gold-600 bg-gold-500/10 rounded-lg px-3 py-2">
                            🏆 Mes más activo: <b>{mesMasActivo.label}</b> — {formatUSD(mesMasActivo.total)} en{" "}
                            {mesMasActivo.cantidad} aporte{mesMasActivo.cantidad === 1 ? "" : "s"}
                          </p>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-brand-400 border-b border-brand-100">
                                <th className="pb-1.5 font-medium">Mes</th>
                                <th className="pb-1.5 font-medium text-center">Aportes</th>
                                <th className="pb-1.5 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filas.map((f) => (
                                <tr key={f.key} className="border-b border-brand-50 last:border-0">
                                  <td className="py-1.5">
                                    {f.key === mesMasActivo?.key ? <b>{f.label}</b> : f.label}
                                  </td>
                                  <td className="py-1.5 text-center text-brand-500">{f.cantidad}</td>
                                  <td className="py-1.5 text-right font-medium">{formatUSD(f.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-brand-400 col-span-full text-center py-10">
            Aún no hay proyectos activos.
          </p>
        )}
      </div>
    </div>
  );
}

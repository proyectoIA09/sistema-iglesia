import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/format";
import { crearEmpleado, desactivarEmpleado, reactivarEmpleado, registrarPagoPlanilla } from "@/lib/actions";
import ExportarCSV from "@/components/ExportarCSV";

export default async function PlanillaPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const tab = searchParams.tab === "pagos" ? "pagos" : "empleados";

  const [{ data: empleados }, { data: empleadosActivos }, { data: pagos }] = await Promise.all([
    supabase.from("empleados").select("id, nombre_completo, cargo, dui, telefono, monto_asignado, activo").order("nombre_completo"),
    supabase.from("empleados").select("id, nombre_completo, cargo, monto_asignado").eq("activo", true).order("nombre_completo"),
    supabase
      .from("planilla_pagos")
      .select("id, numero, monto, mes_correspondiente, fecha_pago, notas, empleados(nombre_completo, cargo)")
      .order("fecha_pago", { ascending: false })
      .limit(100),
  ]);

  const hoy = new Date().toISOString().slice(0, 10);

  const porMesPago = new Map<string, { total: number; cantidad: number }>();
  for (const p of pagos ?? []) {
    const actual = porMesPago.get(p.mes_correspondiente) ?? { total: 0, cantidad: 0 };
    actual.total += Number(p.monto);
    actual.cantidad += 1;
    porMesPago.set(p.mes_correspondiente, actual);
  }
  const resumenPorMes = Array.from(porMesPago.entries()).map(([mes, v]) => ({ mes, ...v }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Planilla</h1>
        <p className="text-brand-500 text-sm mt-1">
          Ficha de empleados y boletas de pago — sin deducciones ni cálculos de impuestos.
        </p>
      </div>

      <div className="inline-flex bg-brand-100/60 rounded-xl p-1 gap-1 text-sm font-medium">
        <Link
          href="/planilla?tab=empleados"
          className={`px-3.5 py-1.5 rounded-lg ${tab === "empleados" ? "bg-white shadow-card text-brand-950" : "text-brand-500"}`}
        >
          Empleados
        </Link>
        <Link
          href="/planilla?tab=pagos"
          className={`px-3.5 py-1.5 rounded-lg ${tab === "pagos" ? "bg-white shadow-card text-brand-950" : "text-brand-500"}`}
        >
          Pagos
        </Link>
      </div>

      {tab === "empleados" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-950">Personal</h2>
              <ExportarCSV
                filas={(empleados ?? []).map((e) => ({
                  nombre: e.nombre_completo,
                  cargo: e.cargo,
                  dui: e.dui ?? "",
                  monto_asignado: Number(e.monto_asignado).toFixed(2),
                  estado: e.activo ? "Activo" : "Inactivo",
                }))}
                columnas={[
                  { key: "nombre", label: "Nombre" },
                  { key: "cargo", label: "Cargo" },
                  { key: "dui", label: "DUI" },
                  { key: "monto_asignado", label: "Monto asignado" },
                  { key: "estado", label: "Estado" },
                ]}
                nombreArchivo="planilla-empleados.csv"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-400 border-b border-brand-100">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Cargo</th>
                    <th className="pb-2 font-medium">DUI</th>
                    <th className="pb-2 font-medium text-right">Monto asignado</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {empleados?.length ? (
                    empleados.map((e) => (
                      <tr key={e.id} className="border-b border-brand-50 last:border-0">
                        <td className="py-2">{e.nombre_completo}</td>
                        <td className="py-2 text-brand-500">{e.cargo}</td>
                        <td className="py-2 text-brand-500">{e.dui ?? "—"}</td>
                        <td className="py-2 text-right font-medium">{formatUSD(Number(e.monto_asignado))}</td>
                        <td className="py-2">
                          <span
                            className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                              e.activo ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                            }`}
                          >
                            {e.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          {e.activo ? (
                            <form action={desactivarEmpleado.bind(null, e.id)}>
                              <button type="submit" className="text-xs text-red-600 underline underline-offset-2">
                                Dar de baja
                              </button>
                            </form>
                          ) : (
                            <form action={reactivarEmpleado.bind(null, e.id)}>
                              <button type="submit" className="text-xs text-emerald-600 underline underline-offset-2">
                                Reactivar
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-brand-400">
                        Aún no hay empleados registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Nuevo empleado</h2>
            <form action={crearEmpleado} className="space-y-4">
              <div>
                <label className="label">Nombre completo</label>
                <input name="nombre_completo" required className="input" />
              </div>
              <div>
                <label className="label">Cargo</label>
                <input name="cargo" required className="input" placeholder="Ej. Pastor, Secretaria, Conserje" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">DUI</label>
                  <input name="dui" className="input" placeholder="00000000-0" />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input name="telefono" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Monto asignado a recibir ($)</label>
                <input name="monto_asignado" type="number" min="0.01" step="0.01" required className="input" />
              </div>
              <button type="submit" className="btn-primary w-full">
                Guardar empleado
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "pagos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumenPorMes.length > 0 && (
            <div className="card lg:col-span-2">
              <h2 className="font-semibold text-brand-950 mb-3">Total pagado por mes</h2>
              <div className="flex flex-wrap gap-3">
                {resumenPorMes.map((r) => (
                  <div key={r.mes} className="px-3 py-2 rounded-lg bg-brand-50 text-sm">
                    <span className="text-brand-500">{r.mes}: </span>
                    <b className="text-brand-950">{formatUSD(r.total)}</b>
                    <span className="text-brand-400"> ({r.cantidad} pago{r.cantidad === 1 ? "" : "s"})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-950">Historial de pagos</h2>
              <ExportarCSV
                filas={(pagos ?? []).map((p: any) => ({
                  numero: p.numero,
                  empleado: p.empleados?.nombre_completo ?? "",
                  cargo: p.empleados?.cargo ?? "",
                  mes: p.mes_correspondiente,
                  fecha_pago: p.fecha_pago,
                  monto: Number(p.monto).toFixed(2),
                  notas: p.notas ?? "",
                }))}
                columnas={[
                  { key: "numero", label: "No. boleta" },
                  { key: "empleado", label: "Empleado" },
                  { key: "cargo", label: "Cargo" },
                  { key: "mes", label: "Mes" },
                  { key: "fecha_pago", label: "Fecha de pago" },
                  { key: "monto", label: "Monto" },
                  { key: "notas", label: "Notas" },
                ]}
                nombreArchivo="planilla-pagos.csv"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-400 border-b border-brand-100">
                    <th className="pb-2 font-medium">No.</th>
                    <th className="pb-2 font-medium">Empleado</th>
                    <th className="pb-2 font-medium">Mes</th>
                    <th className="pb-2 font-medium">Fecha de pago</th>
                    <th className="pb-2 font-medium text-right">Monto</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagos?.length ? (
                    pagos.map((p: any) => (
                      <tr key={p.id} className="border-b border-brand-50 last:border-0">
                        <td className="py-2 font-mono text-brand-500">#{p.numero}</td>
                        <td className="py-2">
                          {p.empleados?.nombre_completo}
                          <span className="text-brand-400"> — {p.empleados?.cargo}</span>
                        </td>
                        <td className="py-2 text-brand-500">{p.mes_correspondiente}</td>
                        <td className="py-2 text-brand-500">{p.fecha_pago}</td>
                        <td className="py-2 text-right font-medium">{formatUSD(Number(p.monto))}</td>
                        <td className="py-2 text-right">
                          <Link href={`/planilla/boleta/${p.id}`} className="text-xs text-brand-600 underline underline-offset-2">
                            Ver boleta
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-brand-400">
                        Aún no hay pagos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-1">Registrar pago</h2>
            <p className="text-brand-500 text-sm mb-4">
              Se suma automáticamente a Finanzas como gasto de categoría "Nómina".
            </p>
            <form action={registrarPagoPlanilla} className="space-y-4">
              <div>
                <label className="label">Empleado</label>
                <select name="empleado_id" required className="input">
                  {empleadosActivos?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre_completo} — {e.cargo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Mes correspondiente</label>
                <input name="mes_correspondiente" required className="input" placeholder="Ej. Agosto 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monto ($)</label>
                  <input name="monto" type="number" min="0.01" step="0.01" required className="input" />
                </div>
                <div>
                  <label className="label">Fecha de pago</label>
                  <input name="fecha_pago" type="date" defaultValue={hoy} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Notas (opcional)</label>
                <textarea name="notas" rows={2} className="input" />
              </div>
              <button type="submit" className="btn-primary w-full">
                Registrar pago y generar boleta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

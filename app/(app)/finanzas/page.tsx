import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/format";

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: { tipo?: string };
}) {
  const supabase = createClient();
  const filtro = searchParams.tipo === "ingreso" || searchParams.tipo === "gasto" ? searchParams.tipo : "todos";

  const { data: movimientosTotales } = await supabase
    .from("movimientos_financieros")
    .select("tipo, monto");

  const ingresos =
    movimientosTotales?.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0) ?? 0;
  const gastos =
    movimientosTotales?.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  let query = supabase
    .from("movimientos_financieros")
    .select("id, tipo, categoria, monto, fecha, origen, descripcion, fondos(nombre)")
    .order("fecha", { ascending: false })
    .limit(100);

  if (filtro !== "todos") {
    query = query.eq("tipo", filtro);
  }

  const { data: movimientos } = await query;

  const tabs = [
    { key: "todos", label: "Todos" },
    { key: "ingreso", label: "Ingresos" },
    { key: "gasto", label: "Gastos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Finanzas</h1>
          <p className="text-brand-500 text-sm mt-1">Ingresos y gastos de la iglesia</p>
        </div>
        <Link href="/finanzas/nuevo" className="btn-primary">
          + Nuevo movimiento
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-brand-500">Ingresos</p>
          <p className="text-xl font-semibold text-emerald-600">{formatUSD(ingresos)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Gastos</p>
          <p className="text-xl font-semibold text-red-600">{formatUSD(gastos)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Balance</p>
          <p className="text-xl font-semibold text-brand-950">{formatUSD(ingresos - gastos)}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-semibold text-brand-950">Movimientos</h2>
          <div className="inline-flex bg-brand-100/60 rounded-xl p-1 gap-1 text-sm font-medium">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={t.key === "todos" ? "/finanzas" : `/finanzas?tipo=${t.key}`}
                className={`px-3.5 py-1.5 rounded-lg ${
                  filtro === t.key ? "bg-white shadow-card text-brand-950" : "text-brand-500"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-400 border-b border-brand-100">
                <th className="pb-2 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium">Categoría</th>
                <th className="pb-2 font-medium">Fondo</th>
                <th className="pb-2 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos?.length ? (
                movimientos.map((m: any) => (
                  <tr key={m.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2.5 text-brand-500">{m.fecha}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.tipo === "ingreso"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {m.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className="py-2.5">{m.categoria}</td>
                    <td className="py-2.5 text-brand-500">{m.fondos?.nombre ?? "—"}</td>
                    <td className="py-2.5 text-right font-medium">
                      {m.tipo === "gasto" ? "-" : ""}
                      {formatUSD(Number(m.monto))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-brand-400">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

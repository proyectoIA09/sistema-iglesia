import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/format";
import FinanzasFilterBar from "@/components/FinanzasFilterBar";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function rangoDelMes(mesStr: string) {
  const [anio, mes] = mesStr.split("-").map(Number);
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 1);
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: { tipo?: string; mes?: string };
}) {
  const supabase = createClient();
  const filtroTipo = searchParams.tipo === "ingreso" || searchParams.tipo === "gasto" ? searchParams.tipo : "todos";
  const filtroMes = searchParams.mes ?? "todos";

  let baseQuery = supabase.from("movimientos_financieros").select("tipo, monto");
  let listaQuery = supabase
    .from("movimientos_financieros")
    .select("id, tipo, categoria, monto, fecha, origen, descripcion, fondos(nombre)")
    .order("fecha", { ascending: false })
    .limit(200);

  if (filtroMes !== "todos") {
    const { inicio, fin } = rangoDelMes(filtroMes);
    baseQuery = baseQuery.gte("fecha", inicio).lt("fecha", fin);
    listaQuery = listaQuery.gte("fecha", inicio).lt("fecha", fin);
  }

  const { data: movimientosDelMes } = await baseQuery;

  if (filtroTipo !== "todos") {
    listaQuery = listaQuery.eq("tipo", filtroTipo);
  }
  const { data: movimientos } = await listaQuery;

  const ingresos = movimientosDelMes?.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0) ?? 0;
  const gastos = movimientosDelMes?.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  const totalFiltro = movimientos?.reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  const tabs = [
    { key: "todos", label: "Todos" },
    { key: "ingreso", label: "Ingresos" },
    { key: "gasto", label: "Gastos" },
  ];

  function linkTab(tipoKey: string) {
    const params = new URLSearchParams();
    if (tipoKey !== "todos") params.set("tipo", tipoKey);
    if (filtroMes !== "todos") params.set("mes", filtroMes);
    const qs = params.toString();
    return qs ? `/finanzas?${qs}` : "/finanzas";
  }

  const [anioSel, mesSel] = filtroMes !== "todos" ? filtroMes.split("-").map(Number) : [null, null];
  const mesLabel = filtroMes === "todos" ? "todo el historial" : `${MESES[(mesSel as number) - 1]} ${anioSel}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Finanzas</h1>
          <p className="text-brand-500 text-sm mt-1">Ingresos y gastos de la iglesia</p>
        </div>
        <div className="flex items-center gap-3">
          <FinanzasFilterBar tipoActual={filtroTipo} mesActual={filtroMes} />
          <Link href="/finanzas/nuevo" className="btn-primary">
            + Nuevo movimiento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-brand-500">Ingresos — {mesLabel}</p>
          <p className="text-xl font-semibold text-emerald-600">{formatUSD(ingresos)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Gastos — {mesLabel}</p>
          <p className="text-xl font-semibold text-red-600">{formatUSD(gastos)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Balance — {mesLabel}</p>
          <p className="text-xl font-semibold text-brand-950">{formatUSD(ingresos - gastos)}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h2 className="font-semibold text-brand-950">Movimientos</h2>
          <div className="inline-flex bg-brand-100/60 rounded-xl p-1 gap-1 text-sm font-medium">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={linkTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg ${
                  filtroTipo === t.key ? "bg-white shadow-card text-brand-950" : "text-brand-500"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-xs text-brand-400 mb-4">
          {movimientos?.length ?? 0} movimiento{movimientos?.length === 1 ? "" : "s"} · Total del filtro:{" "}
          <span className="font-semibold text-brand-700">{formatUSD(totalFiltro)}</span>
        </p>
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
                    No hay movimientos en este filtro.
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

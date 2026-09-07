import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { formatUSD } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();
  const puedeVerFinanzas = ["admin", "pastor", "finanzas"].includes(profile?.role ?? "");

  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesStr = inicioMes.toISOString().slice(0, 10);

  const [{ count: totalCelulas }, { data: reportesMes }, { data: movimientosMes }, { data: ultimosReportes }, { data: celulasActivas }, { data: fechasReportes }] =
    await Promise.all([
      supabase.from("celulas").select("*", { count: "exact", head: true }).eq("activa", true),
      supabase.from("reportes_celula").select("ninos, jovenes, adultos, mayores, visitantes, ofrenda").gte("fecha", inicioMesStr),
      supabase.from("movimientos_financieros").select("tipo, monto").gte("fecha", inicioMesStr),
      supabase
        .from("reportes_celula")
        .select("fecha, ofrenda, ninos, jovenes, adultos, mayores, visitantes, celulas(nombre)")
        .order("fecha", { ascending: false })
        .limit(5),
      supabase.from("celulas").select("id, nombre").eq("activa", true),
      supabase.from("reportes_celula").select("celula_id, fecha").order("fecha", { ascending: false }),
    ]);

  const ultimaFechaPorCelula = new Map<string, string>();
  for (const r of fechasReportes ?? []) {
    if (!ultimaFechaPorCelula.has(r.celula_id)) ultimaFechaPorCelula.set(r.celula_id, r.fecha);
  }
  const hace14Dias = new Date();
  hace14Dias.setDate(hace14Dias.getDate() - 14);
  const hace14DiasStr = hace14Dias.toISOString().slice(0, 10);

  const celulasSinReportar = (celulasActivas ?? []).filter((c) => {
    const ultima = ultimaFechaPorCelula.get(c.id);
    return !ultima || ultima < hace14DiasStr;
  });

  const totalAsistentes =
    reportesMes?.reduce(
      (sum, r) => sum + r.ninos + r.jovenes + r.adultos + r.mayores + r.visitantes,
      0
    ) ?? 0;
  const ofrendaCelulas = reportesMes?.reduce((sum, r) => sum + Number(r.ofrenda), 0) ?? 0;

  const ingresosMes =
    movimientosMes?.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0) ?? 0;
  const gastosMes =
    movimientosMes?.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Panel general</h1>
        <p className="text-brand-500 text-sm mt-1">Resumen del mes en curso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Células activas" value={String(totalCelulas ?? 0)} icon="👥" />
        <StatCard label="Asistentes (mes)" value={String(totalAsistentes)} icon="🙌" />
        <StatCard label="Ofrenda de células" value={formatUSD(ofrendaCelulas)} icon="🪙" accent="gold" />
        {puedeVerFinanzas && (
          <StatCard
            label="Balance del mes"
            value={formatUSD(ingresosMes - gastosMes)}
            icon="📈"
          />
        )}
      </div>

      {celulasSinReportar.length > 0 && (
        <div className="card border-gold-500/40 bg-gold-500/5">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-brand-950">
                {celulasSinReportar.length} célula{celulasSinReportar.length === 1 ? "" : "s"} sin reportar en 2+ semanas
              </p>
              <p className="text-sm text-brand-500 mt-0.5">
                {celulasSinReportar.map((c) => c.nombre).join(" · ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-950">Últimos reportes de célula</h2>
            <Link href="/celulas" className="text-sm text-brand-600 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Célula</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Asistentes</th>
                  <th className="pb-2 font-medium text-right">Ofrenda</th>
                </tr>
              </thead>
              <tbody>
                {ultimosReportes?.length ? (
                  ultimosReportes.map((r: any, i: number) => (
                    <tr key={i} className="border-b border-brand-50 last:border-0">
                      <td className="py-2.5">{r.celulas?.nombre ?? "—"}</td>
                      <td className="py-2.5 text-brand-500">{r.fecha}</td>
                      <td className="py-2.5">
                        {r.ninos + r.jovenes + r.adultos + r.mayores + r.visitantes}
                      </td>
                      <td className="py-2.5 text-right font-medium">{formatUSD(Number(r.ofrenda))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-brand-400">
                      Aún no hay reportes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-brand-950 mb-4">Accesos rápidos</h2>
          <div className="space-y-2">
            <Link href="/celulas" className="btn-secondary w-full justify-start">
              📋 Registrar reporte de célula
            </Link>
            {puedeVerFinanzas && (
              <Link href="/finanzas" className="btn-secondary w-full justify-start">
                💵 Registrar movimiento financiero
              </Link>
            )}
            <Link href="/proyectos" className="btn-secondary w-full justify-start">
              🎯 Ver proyectos
            </Link>
            <Link href="/reportes" className="btn-secondary w-full justify-start">
              📊 Ver reporte general de iglesia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

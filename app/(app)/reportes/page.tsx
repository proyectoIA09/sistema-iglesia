import { createClient } from "@/lib/supabase/server";
import {
  AsistenciaPorZonaChart,
  EdadesPieChart,
  OfrendaPorZonaChart,
} from "@/components/ReportesCharts";
import ReportesFilterBar from "@/components/ReportesFilterBar";
import { formatUSD } from "@/lib/format";

function rangoDelMes(mesStr: string) {
  const [anio, mes] = mesStr.split("-").map(Number);
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 1);
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

async function totalesDelMes(supabase: any, mesStr: string) {
  const { inicio, fin } = rangoDelMes(mesStr);
  const { data: filas } = await supabase
    .from("vw_reporte_general")
    .select("*")
    .gte("fecha", inicio)
    .lt("fecha", fin);

  const porZona = new Map<string, { total: number; ofrenda: number }>();
  let ninos = 0, jovenes = 0, adultos = 0, mayores = 0, visitantes = 0;
  let conversiones = 0, reconciliaciones = 0, ofrendaTotal = 0;

  for (const f of filas ?? []) {
    const zona = f.zona ?? "Sin zona";
    const actual = porZona.get(zona) ?? { total: 0, ofrenda: 0 };
    actual.total += f.total_asistentes;
    actual.ofrenda += Number(f.ofrenda);
    porZona.set(zona, actual);

    ninos += f.ninos;
    jovenes += f.jovenes;
    adultos += f.adultos;
    mayores += f.mayores;
    visitantes += f.visitantes;
    conversiones += f.conversiones ?? 0;
    reconciliaciones += f.reconciliaciones ?? 0;
    ofrendaTotal += Number(f.ofrenda);
  }

  const totalAsistentes = ninos + jovenes + adultos + mayores + visitantes;
  const celulasReportando = new Set((filas ?? []).map((f: any) => f.celula)).size;

  return {
    filas: filas ?? [],
    porZona,
    ninos, jovenes, adultos, mayores, visitantes,
    conversiones, reconciliaciones, ofrendaTotal, totalAsistentes, celulasReportando,
  };
}

function delta(actual: number, anterior: number) {
  if (!anterior) return null;
  return ((actual - anterior) / anterior) * 100;
}

function Delta({ actual, anterior, mesLabel }: { actual: number; anterior: number; mesLabel: string }) {
  const d = delta(actual, anterior);
  if (d === null) return null;
  const color = d > 0.5 ? "text-emerald-600" : d < -0.5 ? "text-red-600" : "text-brand-400";
  return (
    <p className={`text-xs font-semibold mt-1 ${color}`}>
      {d >= 0 ? "+" : ""}
      {d.toFixed(1)}% vs. {mesLabel}
    </p>
  );
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { mes?: string; comparar?: string };
}) {
  const supabase = createClient();

  const hoy = new Date();
  const mesActual = searchParams.mes ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const compararActual = searchParams.comparar ?? "";

  const d = await totalesDelMes(supabase, mesActual);
  const c = compararActual ? await totalesDelMes(supabase, compararActual) : null;

  const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [anioSel, mesSel] = mesActual.split("-").map(Number);
  const mesLabel = `${MESES[mesSel - 1]} ${anioSel}`;
  let compararLabel = "";
  if (compararActual) {
    const [anioC, mesC] = compararActual.split("-").map(Number);
    compararLabel = `${MESES[mesC - 1]} ${anioC}`;
  }

  const dataZona = Array.from(d.porZona.entries()).map(([zona, v]) => ({ zona, total: v.total }));
  const dataOfrendaZona = Array.from(d.porZona.entries()).map(([zona, v]) => ({ zona, ofrenda: v.ofrenda }));
  const dataEdades = [
    { name: "Niños", value: d.ninos },
    { name: "Jóvenes", value: d.jovenes },
    { name: "Adultos", value: d.adultos },
    { name: "Mayores", value: d.mayores },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Reporte general de iglesia</h1>
        <p className="text-brand-500 text-sm mt-1">Datos de todas las células, filtrados por mes</p>
      </div>

      <ReportesFilterBar mesActual={mesActual} compararActual={compararActual} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-brand-500">Total asistentes</p>
          <p className="text-xl font-semibold text-brand-950">{d.totalAsistentes}</p>
          {c && <Delta actual={d.totalAsistentes} anterior={c.totalAsistentes} mesLabel={compararLabel} />}
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Visitantes nuevos</p>
          <p className="text-xl font-semibold text-brand-950">{d.visitantes}</p>
          {c && <Delta actual={d.visitantes} anterior={c.visitantes} mesLabel={compararLabel} />}
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Ofrenda de células</p>
          <p className="text-xl font-semibold text-gold-600">{formatUSD(d.ofrendaTotal)}</p>
          {c && <Delta actual={d.ofrendaTotal} anterior={c.ofrendaTotal} mesLabel={compararLabel} />}
        </div>
        <div className="card">
          <p className="text-sm text-brand-500">Células reportando</p>
          <p className="text-xl font-semibold text-brand-950">{d.celulasReportando}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-500 mb-4">
          Decisiones espirituales — {mesLabel}
        </h2>
        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-sm text-brand-500">Conversiones (nuevos en la fe)</p>
            <p className="text-xl font-semibold text-gold-600">{d.conversiones}</p>
            {c && <Delta actual={d.conversiones} anterior={c.conversiones} mesLabel={compararLabel} />}
          </div>
          <div>
            <p className="text-sm text-brand-500">Reconciliaciones (restaurados)</p>
            <p className="text-xl font-semibold text-brand-950">{d.reconciliaciones}</p>
            {c && <Delta actual={d.reconciliaciones} anterior={c.reconciliaciones} mesLabel={compararLabel} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-brand-950 mb-2">Asistencia por zona</h2>
          <AsistenciaPorZonaChart data={dataZona} />
        </div>
        <div className="card">
          <h2 className="font-semibold text-brand-950 mb-2">Distribución por edad</h2>
          <EdadesPieChart data={dataEdades} />
        </div>
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-brand-950 mb-2">Ofrenda recolectada por zona</h2>
          <OfrendaPorZonaChart data={dataOfrendaZona} />
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-brand-950 mb-4">Detalle por célula — {mesLabel}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-400 border-b border-brand-100">
                <th className="pb-2 font-medium">Célula</th>
                <th className="pb-2 font-medium">Zona</th>
                <th className="pb-2 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Niños</th>
                <th className="pb-2 font-medium">Jóvenes</th>
                <th className="pb-2 font-medium">Adultos</th>
                <th className="pb-2 font-medium">Mayores</th>
                <th className="pb-2 font-medium text-right">Ofrenda</th>
              </tr>
            </thead>
            <tbody>
              {d.filas.length ? (
                d.filas.map((f: any, i: number) => (
                  <tr key={i} className="border-b border-brand-50 last:border-0">
                    <td className="py-2.5">{f.celula}</td>
                    <td className="py-2.5 text-brand-500">{f.zona ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">{f.fecha}</td>
                    <td className="py-2.5">{f.ninos}</td>
                    <td className="py-2.5">{f.jovenes}</td>
                    <td className="py-2.5">{f.adultos}</td>
                    <td className="py-2.5">{f.mayores}</td>
                    <td className="py-2.5 text-right font-medium">{formatUSD(Number(f.ofrenda))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-brand-400">
                    No hay datos en el periodo seleccionado.
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

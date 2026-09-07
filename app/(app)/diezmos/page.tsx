import { createClient } from "@/lib/supabase/server";
import { crearDiezmo } from "@/lib/actions";
import { formatUSD } from "@/lib/format";
import ExportarCSV from "@/components/ExportarCSV";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function DiezmosPage() {
  const supabase = createClient();

  const { data: diezmos } = await supabase
    .from("diezmos")
    .select("id, codigo_sobre, monto, fecha, notas")
    .order("fecha", { ascending: false })
    .limit(500);

  const hoy = new Date().toISOString().slice(0, 10);
  const totalMostrado = diezmos?.reduce((s, d) => s + Number(d.monto), 0) ?? 0;

  // Historial por mes
  const porMes = new Map<string, { total: number; cantidad: number }>();
  for (const d of diezmos ?? []) {
    const [anio, mes] = d.fecha.split("-");
    const key = `${anio}-${mes}`;
    const actual = porMes.get(key) ?? { total: 0, cantidad: 0 };
    actual.total += Number(d.monto);
    actual.cantidad += 1;
    porMes.set(key, actual);
  }
  const historialMensual = Array.from(porMes.entries())
    .map(([key, v]) => {
      const [anio, mes] = key.split("-").map(Number);
      return { key, label: `${MESES[mes - 1]} ${anio}`, total: v.total, cantidad: v.cantidad };
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1));
  const mesMasActivo = historialMensual.reduce(
    (max, f) => (f.total > (max?.total ?? -1) ? f : max),
    null as (typeof historialMensual)[number] | null
  );

  // Total por código de sobre (útil para preparar constancias anuales)
  const porCodigo = new Map<string, { total: number; cantidad: number }>();
  for (const d of diezmos ?? []) {
    const actual = porCodigo.get(d.codigo_sobre) ?? { total: 0, cantidad: 0 };
    actual.total += Number(d.monto);
    actual.cantidad += 1;
    porCodigo.set(d.codigo_sobre, actual);
  }
  const historialPorCodigo = Array.from(porCodigo.entries())
    .map(([codigo, v]) => ({ codigo, ...v }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Diezmos</h1>
          <p className="text-brand-500 text-sm mt-1">
            Se registra solo por código de sobre — por privacidad, el nombre no se guarda aquí.
          </p>
        </div>
        <ExportarCSV
          filas={(diezmos ?? []).map((d) => ({
            fecha: d.fecha,
            codigo: d.codigo_sobre,
            monto: Number(d.monto).toFixed(2),
            notas: d.notas ?? "",
          }))}
          columnas={[
            { key: "fecha", label: "Fecha" },
            { key: "codigo", label: "Código de sobre" },
            { key: "monto", label: "Monto" },
            { key: "notas", label: "Notas" },
          ]}
          nombreArchivo="diezmos.csv"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-brand-950 mb-4">Registrar diezmo</h2>
          <form action={crearDiezmo} className="space-y-4">
            <div>
              <label className="label">Código de sobre</label>
              <input name="codigo_sobre" required className="input" placeholder="Ej. 014" />
            </div>
            <div>
              <label className="label">Monto ($)</label>
              <input name="monto" type="number" min="0.01" step="0.01" required className="input" />
            </div>
            <div>
              <label className="label">Fecha</label>
              <input name="fecha" type="date" defaultValue={hoy} className="input" />
            </div>
            <div>
              <label className="label">Notas (opcional)</label>
              <textarea name="notas" rows={2} className="input" />
            </div>
            <button type="submit" className="btn-primary w-full">
              Guardar diezmo
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-950">Últimos registros</h2>
            <p className="text-sm text-brand-500">
              Total mostrado: <b className="text-brand-950">{formatUSD(totalMostrado)}</b>
            </p>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Código</th>
                  <th className="pb-2 font-medium text-right">Monto</th>
                  <th className="pb-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {diezmos?.length ? (
                  diezmos.map((d) => (
                    <tr key={d.id} className="border-b border-brand-50 last:border-0">
                      <td className="py-2.5 text-brand-500">{d.fecha}</td>
                      <td className="py-2.5 font-mono">{d.codigo_sobre}</td>
                      <td className="py-2.5 text-right font-medium">{formatUSD(Number(d.monto))}</td>
                      <td className="py-2.5 text-brand-500">{d.notas ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-brand-400">
                      Aún no hay diezmos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {historialMensual.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Historial por mes</h2>
            {mesMasActivo && (
              <p className="text-xs text-gold-600 bg-gold-500/10 rounded-lg px-3 py-2 mb-3">
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
                  {historialMensual.map((f) => (
                    <tr key={f.key} className="border-b border-brand-50 last:border-0">
                      <td className="py-1.5">{f.key === mesMasActivo?.key ? <b>{f.label}</b> : f.label}</td>
                      <td className="py-1.5 text-center text-brand-500">{f.cantidad}</td>
                      <td className="py-1.5 text-right font-medium">{formatUSD(f.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-1">Total por código</h2>
            <p className="text-brand-500 text-sm mb-4">
              Para preparar constancias anuales — el nombre se busca en Administración → Códigos de sobre.
            </p>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-400 border-b border-brand-100">
                    <th className="pb-1.5 font-medium">Código</th>
                    <th className="pb-1.5 font-medium text-center">Aportes</th>
                    <th className="pb-1.5 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {historialPorCodigo.map((c) => (
                    <tr key={c.codigo} className="border-b border-brand-50 last:border-0">
                      <td className="py-1.5 font-mono">{c.codigo}</td>
                      <td className="py-1.5 text-center text-brand-500">{c.cantidad}</td>
                      <td className="py-1.5 text-right font-medium">{formatUSD(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-brand-400">
        Para saber a quién pertenece un código (por ejemplo, al emitir una constancia anual de donación), un
        administrador puede consultarlo en Administración → Códigos de sobre.
      </p>
    </div>
  );
}

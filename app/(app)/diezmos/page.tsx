import { createClient } from "@/lib/supabase/server";
import { crearDiezmo } from "@/lib/actions";
import { formatUSD } from "@/lib/format";

export default async function DiezmosPage() {
  const supabase = createClient();

  const { data: diezmos } = await supabase
    .from("diezmos")
    .select("id, codigo_sobre, monto, fecha, notas")
    .order("fecha", { ascending: false })
    .limit(100);

  const hoy = new Date().toISOString().slice(0, 10);
  const totalMostrado = diezmos?.reduce((s, d) => s + Number(d.monto), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Diezmos</h1>
        <p className="text-brand-500 text-sm mt-1">
          Se registra solo por código de sobre — por privacidad, el nombre no se guarda aquí.
        </p>
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
          <div className="overflow-x-auto">
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

      <p className="text-xs text-brand-400">
        Para saber a quién pertenece un código (por ejemplo, al emitir una constancia anual de donación), un
        administrador puede consultarlo en Administración → Códigos de sobre.
      </p>
    </div>
  );
}

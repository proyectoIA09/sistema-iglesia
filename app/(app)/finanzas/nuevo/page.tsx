import { createClient } from "@/lib/supabase/server";
import { crearMovimiento } from "@/lib/actions";
import MovimientoTipoCategoria from "@/components/MovimientoTipoCategoria";

export default async function NuevoMovimientoPage() {
  const supabase = createClient();
  const { data: fondos } = await supabase.from("fondos").select("id, nombre").order("nombre");
  const { data: categorias } = await supabase
    .from("categorias_financieras")
    .select("id, nombre, tipo")
    .eq("activa", true)
    .order("nombre");
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-brand-950 mb-6">Nuevo movimiento financiero</h1>

      <form action={crearMovimiento} className="card space-y-4">
        <MovimientoTipoCategoria categorias={categorias ?? []} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Monto ($)</label>
            <input name="monto" type="number" min="0.01" step="0.01" required className="input" />
          </div>
          <div>
            <label className="label">Fecha</label>
            <input name="fecha" type="date" required defaultValue={hoy} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Fondo</label>
          <select name="fondo_id" className="input">
            {fondos?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Origen</label>
          <select name="origen" className="input">
            <option value="servicio">Servicio general</option>
            <option value="celula">Célula</option>
            <option value="donacion">Donación</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea name="descripcion" rows={2} className="input" />
        </div>

        <button type="submit" className="btn-primary w-full">
          Guardar movimiento
        </button>
      </form>
    </div>
  );
}

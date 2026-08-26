import { createClient } from "@/lib/supabase/server";
import { crearCelula } from "@/lib/actions";

export default async function NuevaCelulaPage() {
  const supabase = createClient();
  const { data: zonas } = await supabase.from("zonas").select("id, nombre").order("nombre");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-brand-950 mb-6">Nueva célula</h1>

      <form action={crearCelula} className="card space-y-4">
        <div>
          <label className="label">Nombre de la célula</label>
          <input name="nombre" required className="input" placeholder="Célula Vida Nueva" />
        </div>

        <div>
          <label className="label">Zona</label>
          <select name="zona_id" className="input">
            <option value="">Sin asignar</option>
            {zonas?.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Día de reunión</label>
            <select name="dia_semana" className="input">
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
          <div>
            <label className="label">Hora</label>
            <input name="hora" type="time" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Ubicación</label>
          <input name="ubicacion" className="input" placeholder="Dirección o modalidad (virtual)" />
        </div>

        <button type="submit" className="btn-primary w-full">
          Guardar célula
        </button>
      </form>
    </div>
  );
}

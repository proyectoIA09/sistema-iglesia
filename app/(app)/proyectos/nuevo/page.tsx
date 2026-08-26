import { crearProyecto } from "@/lib/actions";

export default function NuevoProyectoPage() {
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-brand-950 mb-1">Nuevo proyecto</h1>
      <p className="text-brand-500 text-sm mb-6">
        Un fondo con meta y tiempo definido, separado del presupuesto general.
      </p>

      <form action={crearProyecto} className="card space-y-4">
        <div>
          <label className="label">Nombre del proyecto</label>
          <input name="nombre" required className="input" placeholder="Ej. Siembra para mi casa" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Meta ($)</label>
            <input name="meta" type="number" min="1" step="0.01" required className="input" placeholder="2500" />
          </div>
          <div>
            <label className="label">Duración (meses)</label>
            <input name="duracion_meses" type="number" min="1" required className="input" placeholder="5" />
          </div>
        </div>

        <div>
          <label className="label">Fecha de inicio</label>
          <input name="fecha_inicio" type="date" defaultValue={hoy} className="input" />
        </div>

        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea name="descripcion" rows={2} className="input" placeholder="Para quién es y por qué" />
        </div>

        <button type="submit" className="btn-primary w-full">
          Crear proyecto
        </button>
      </form>
    </div>
  );
}

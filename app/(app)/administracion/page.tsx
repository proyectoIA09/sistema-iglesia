import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actualizarPersona, actualizarCelula, crearZona, actualizarConfiguracion, crearUsuarioConRol, desactivarPersona, reactivarPersona, crearCategoriaFinanciera } from "@/lib/actions";
import { getConfiguracion } from "@/lib/config";

export default async function AdministracionPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const validTabs = ["lideres", "supervisores", "celulas", "zonas", "categorias", "configuracion"];
  const tab = validTabs.includes(searchParams.tab ?? "") ? (searchParams.tab as string) : "lideres";

  const [{ data: lideres }, { data: supervisores }, { data: celulas }, { data: zonas }, { data: categoriasFin }, config] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nombre_completo, telefono, activo, celulas(nombre, zonas(nombre))")
      .eq("role", "lider")
      .order("nombre_completo"),
    supabase
      .from("profiles")
      .select("id, nombre_completo, telefono, activo, zonas(nombre)")
      .eq("role", "supervisor")
      .order("nombre_completo"),
    supabase
      .from("celulas")
      .select("id, nombre, dia_semana, hora, ubicacion, zona_id, lider_id, zonas(nombre), profiles(nombre_completo)")
      .order("nombre"),
    supabase.from("zonas").select("id, nombre, supervisor_id").order("nombre"),
    supabase.from("categorias_financieras").select("id, nombre, tipo, activa").order("tipo").order("nombre"),
    getConfiguracion(supabase),
  ]);

  const tabs = [
    { key: "lideres", label: "Líderes" },
    { key: "supervisores", label: "Supervisores" },
    { key: "celulas", label: "Células" },
    { key: "zonas", label: "Zonas" },
    { key: "categorias", label: "Categorías" },
    { key: "configuracion", label: "Configuración" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Administración</h1>
        <p className="text-brand-500 text-sm mt-1">
          Edita la información de líderes, supervisores y células
        </p>
      </div>

      <div className="inline-flex bg-brand-100/60 rounded-xl p-1 gap-1 text-sm font-medium">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/administracion?tab=${t.key}`}
            className={`px-3.5 py-1.5 rounded-lg ${
              tab === t.key ? "bg-white shadow-card text-brand-950" : "text-brand-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "lideres" && (
        <div className="card">
          <details className="mb-4">
            <summary className="btn-primary inline-flex cursor-pointer text-sm">+ Nuevo líder</summary>
            <form action={crearUsuarioConRol} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <input type="hidden" name="role" value="lider" />
              <input name="nombre_completo" required placeholder="Nombre completo" className="input" />
              <input name="telefono" placeholder="Teléfono (opcional)" className="input" />
              <input name="correo" type="email" required placeholder="Correo" className="input sm:col-span-2" />
              <input name="password" type="text" required placeholder="Contraseña temporal" className="input sm:col-span-2" />
              <button type="submit" className="btn-primary sm:col-span-2">
                Crear líder
              </button>
            </form>
          </details>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Célula</th>
                  <th className="pb-2 font-medium">Zona</th>
                  <th className="pb-2 font-medium">Teléfono</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {lideres?.map((p: any) => (
                  <tr key={p.id} className="border-b border-brand-50 last:border-0 align-top">
                    <td className="py-2.5">{p.nombre_completo}</td>
                    <td className="py-2.5 text-brand-500">{p.celulas?.[0]?.nombre ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">{p.celulas?.[0]?.zonas?.nombre ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">{p.telefono ?? "—"}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                          p.activo ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <details>
                        <summary className="text-brand-600 text-xs cursor-pointer underline underline-offset-2">
                          Editar
                        </summary>
                        <div className="mt-2 space-y-2 w-56">
                          <form action={actualizarPersona.bind(null, p.id)} className="space-y-2">
                            <input name="nombre_completo" defaultValue={p.nombre_completo} className="input text-xs py-1.5" />
                            <input name="telefono" defaultValue={p.telefono ?? ""} placeholder="Teléfono" className="input text-xs py-1.5" />
                            <button type="submit" className="btn-primary w-full text-xs py-1.5">
                              Guardar
                            </button>
                          </form>
                          {p.activo ? (
                            <form action={desactivarPersona.bind(null, p.id)}>
                              <button type="submit" className="w-full text-xs py-1.5 rounded-lg bg-red-50 text-red-700 font-medium">
                                Desactivar acceso
                              </button>
                            </form>
                          ) : (
                            <form action={reactivarPersona.bind(null, p.id)}>
                              <button type="submit" className="w-full text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
                                Reactivar acceso
                              </button>
                            </form>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "supervisores" && (
        <div className="card">
          <details className="mb-4">
            <summary className="btn-primary inline-flex cursor-pointer text-sm">+ Nuevo supervisor</summary>
            <form action={crearUsuarioConRol} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <input type="hidden" name="role" value="supervisor" />
              <input name="nombre_completo" required placeholder="Nombre completo" className="input" />
              <input name="telefono" placeholder="Teléfono (opcional)" className="input" />
              <select name="zona_id" className="input sm:col-span-2">
                <option value="">Sin zona asignada</option>
                {zonas?.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
              <input name="correo" type="email" required placeholder="Correo" className="input sm:col-span-2" />
              <input name="password" type="text" required placeholder="Contraseña temporal" className="input sm:col-span-2" />
              <button type="submit" className="btn-primary sm:col-span-2">
                Crear supervisor
              </button>
            </form>
          </details>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Zona a cargo</th>
                  <th className="pb-2 font-medium">Teléfono</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {supervisores?.map((p: any) => (
                  <tr key={p.id} className="border-b border-brand-50 last:border-0 align-top">
                    <td className="py-2.5">{p.nombre_completo}</td>
                    <td className="py-2.5 text-brand-500">{p.zonas?.nombre ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">{p.telefono ?? "—"}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                          p.activo ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <details>
                        <summary className="text-brand-600 text-xs cursor-pointer underline underline-offset-2">
                          Editar
                        </summary>
                        <div className="mt-2 space-y-2 w-56">
                          <form action={actualizarPersona.bind(null, p.id)} className="space-y-2">
                            <input name="nombre_completo" defaultValue={p.nombre_completo} className="input text-xs py-1.5" />
                            <input name="telefono" defaultValue={p.telefono ?? ""} placeholder="Teléfono" className="input text-xs py-1.5" />
                            <button type="submit" className="btn-primary w-full text-xs py-1.5">
                              Guardar
                            </button>
                          </form>
                          {p.activo ? (
                            <form action={desactivarPersona.bind(null, p.id)}>
                              <button type="submit" className="w-full text-xs py-1.5 rounded-lg bg-red-50 text-red-700 font-medium">
                                Desactivar acceso
                              </button>
                            </form>
                          ) : (
                            <form action={reactivarPersona.bind(null, p.id)}>
                              <button type="submit" className="w-full text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
                                Reactivar acceso
                              </button>
                            </form>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "celulas" && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Célula</th>
                  <th className="pb-2 font-medium">Zona</th>
                  <th className="pb-2 font-medium">Líder</th>
                  <th className="pb-2 font-medium">Día / hora</th>
                  <th className="pb-2 font-medium">Ubicación</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {celulas?.map((c: any) => (
                  <tr key={c.id} className="border-b border-brand-50 last:border-0 align-top">
                    <td className="py-2.5">{c.nombre}</td>
                    <td className="py-2.5 text-brand-500">{c.zonas?.nombre ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">{c.profiles?.nombre_completo ?? "—"}</td>
                    <td className="py-2.5 text-brand-500">
                      {c.dia_semana ?? "—"} {c.hora ?? ""}
                    </td>
                    <td className="py-2.5 text-brand-500">{c.ubicacion ?? "—"}</td>
                    <td className="py-2.5">
                      <details>
                        <summary className="text-brand-600 text-xs cursor-pointer underline underline-offset-2">
                          Editar
                        </summary>
                        <form action={actualizarCelula.bind(null, c.id)} className="mt-2 space-y-2 w-56">
                          <input name="nombre" defaultValue={c.nombre} className="input text-xs py-1.5" />
                          <select name="zona_id" defaultValue={c.zona_id ?? ""} className="input text-xs py-1.5">
                            <option value="">Sin zona</option>
                            {zonas?.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.nombre}
                              </option>
                            ))}
                          </select>
                          <select name="lider_id" defaultValue={c.lider_id ?? ""} className="input text-xs py-1.5">
                            <option value="">Sin líder</option>
                            {lideres?.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre_completo}
                              </option>
                            ))}
                          </select>
                          <input name="dia_semana" defaultValue={c.dia_semana ?? ""} placeholder="Día" className="input text-xs py-1.5" />
                          <input name="hora" type="time" defaultValue={c.hora ?? ""} className="input text-xs py-1.5" />
                          <input name="ubicacion" defaultValue={c.ubicacion ?? ""} placeholder="Ubicación" className="input text-xs py-1.5" />
                          <button type="submit" className="btn-primary w-full text-xs py-1.5">
                            Guardar
                          </button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "zonas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Zonas existentes</h2>
            <div className="space-y-2">
              {zonas?.length ? (
                zonas.map((z) => (
                  <div key={z.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-brand-50">
                    <span className="text-sm text-brand-950">{z.nombre}</span>
                  </div>
                ))
              ) : (
                <p className="text-brand-400 text-sm text-center py-6">Aún no hay zonas creadas.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Nueva zona</h2>
            <form action={crearZona} className="space-y-4">
              <div>
                <label className="label">Nombre de la zona</label>
                <input name="nombre" required className="input" placeholder="Ej. Zona Norte" />
              </div>
              <button type="submit" className="btn-primary w-full">
                Crear zona
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "categorias" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Categorías de Finanzas</h2>
            <p className="text-brand-500 text-sm mb-4">
              Son las opciones que verá quien registre un ingreso o gasto — evita que cada quien escriba lo que sea.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-2">Ingresos</p>
                <div className="flex flex-wrap gap-2">
                  {categoriasFin?.filter((c) => c.tipo === "ingreso").map((c) => (
                    <span key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                      {c.nombre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-600 mb-2">Gastos</p>
                <div className="flex flex-wrap gap-2">
                  {categoriasFin?.filter((c) => c.tipo === "gasto").map((c) => (
                    <span key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                      {c.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-brand-950 mb-4">Nueva categoría</h2>
            <p className="text-brand-500 text-sm mb-4">
              Para cuando surja un ingreso o gasto que no encaje en las existentes.
            </p>
            <form action={crearCategoriaFinanciera} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input name="nombre" required className="input" placeholder="Ej. Reparación de vehículo" />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select name="tipo" required className="input">
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Crear categoría
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "configuracion" && (
        <div className="card max-w-lg">
          <h2 className="font-semibold text-brand-950 mb-1">Nombre y logo de la iglesia</h2>
          <p className="text-brand-500 text-sm mb-5">
            Esto se muestra en la pantalla de inicio de sesión y en el menú lateral.
          </p>
          <form action={actualizarConfiguracion} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="label">Nombre de la iglesia</label>
              <input
                name="nombre_iglesia"
                required
                defaultValue={config.nombre_iglesia}
                className="input"
                placeholder="Ej. Iglesia Generación de Jesús"
              />
            </div>
            <div>
              <label className="label">Logo</label>
              {config.logo_url && (
                <div className="mb-2 w-16 h-16 rounded-xl overflow-hidden border border-brand-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.logo_url} alt="Logo actual" className="w-full h-full object-cover" />
                </div>
              )}
              <input name="logo" type="file" accept="image/*" className="input" />
              <p className="field-hint">Formato cuadrado recomendado (PNG o JPG).</p>
            </div>
            <button type="submit" className="btn-primary w-full">
              Guardar cambios
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

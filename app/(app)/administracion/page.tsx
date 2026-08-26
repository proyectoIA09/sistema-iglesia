import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actualizarPersona, actualizarCelula } from "@/lib/actions";

export default async function AdministracionPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const tab = searchParams.tab === "supervisores" ? "supervisores" : searchParams.tab === "celulas" ? "celulas" : "lideres";

  const [{ data: lideres }, { data: supervisores }, { data: celulas }, { data: zonas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nombre_completo, telefono, celulas(nombre, zonas(nombre))")
      .eq("role", "lider")
      .order("nombre_completo"),
    supabase
      .from("profiles")
      .select("id, nombre_completo, telefono, zonas(nombre)")
      .eq("role", "supervisor")
      .order("nombre_completo"),
    supabase
      .from("celulas")
      .select("id, nombre, dia_semana, hora, ubicacion, zona_id, lider_id, zonas(nombre), profiles(nombre_completo)")
      .order("nombre"),
    supabase.from("zonas").select("id, nombre").order("nombre"),
  ]);

  const tabs = [
    { key: "lideres", label: "Líderes" },
    { key: "supervisores", label: "Supervisores" },
    { key: "celulas", label: "Células" },
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Célula</th>
                  <th className="pb-2 font-medium">Zona</th>
                  <th className="pb-2 font-medium">Teléfono</th>
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
                      <details>
                        <summary className="text-brand-600 text-xs cursor-pointer underline underline-offset-2">
                          Editar
                        </summary>
                        <form action={actualizarPersona.bind(null, p.id)} className="mt-2 space-y-2 w-56">
                          <input name="nombre_completo" defaultValue={p.nombre_completo} className="input text-xs py-1.5" />
                          <input name="telefono" defaultValue={p.telefono ?? ""} placeholder="Teléfono" className="input text-xs py-1.5" />
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

      {tab === "supervisores" && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-400 border-b border-brand-100">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Zona a cargo</th>
                  <th className="pb-2 font-medium">Teléfono</th>
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
                      <details>
                        <summary className="text-brand-600 text-xs cursor-pointer underline underline-offset-2">
                          Editar
                        </summary>
                        <form action={actualizarPersona.bind(null, p.id)} className="mt-2 space-y-2 w-56">
                          <input name="nombre_completo" defaultValue={p.nombre_completo} className="input text-xs py-1.5" />
                          <input name="telefono" defaultValue={p.telefono ?? ""} placeholder="Teléfono" className="input text-xs py-1.5" />
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
    </div>
  );
}

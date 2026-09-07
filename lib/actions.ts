"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearCelula(formData: FormData) {
  const supabase = createClient();

  const nombre = formData.get("nombre") as string;
  const zona_id = (formData.get("zona_id") as string) || null;
  const dia_semana = formData.get("dia_semana") as string;
  const hora = (formData.get("hora") as string) || null;
  const ubicacion = formData.get("ubicacion") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("celulas").insert({
    nombre,
    zona_id,
    dia_semana,
    hora,
    ubicacion,
    lider_id: user?.id,
  });

  revalidatePath("/celulas");
  redirect("/celulas");
}

export async function crearReporteCelula(celulaId: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nombres = formData.getAll("visitante_nombre[]") as string[];
  const edades = formData.getAll("visitante_edad[]") as string[];
  const telefonos = formData.getAll("visitante_telefono[]") as string[];

  const visitantesRegistrados = nombres
    .map((nombre, i) => ({
      nombre: nombre.trim(),
      edad: edades[i] ? Number(edades[i]) : null,
      telefono: telefonos[i]?.trim() || null,
    }))
    .filter((v) => v.nombre.length > 0);

  const payload = {
    celula_id: celulaId,
    fecha: formData.get("fecha") as string,
    ninos: Number(formData.get("ninos") || 0),
    jovenes: Number(formData.get("jovenes") || 0),
    adultos: Number(formData.get("adultos") || 0),
    mayores: Number(formData.get("mayores") || 0),
    visitantes: visitantesRegistrados.length,
    conversiones: Number(formData.get("conversiones") || 0),
    reconciliaciones: Number(formData.get("reconciliaciones") || 0),
    ofrenda: Number(formData.get("ofrenda") || 0),
    notas: (formData.get("notas") as string) || null,
    creado_por: user?.id,
  };

  const { data: reporte } = await supabase
    .from("reportes_celula")
    .upsert(payload, { onConflict: "celula_id,fecha" })
    .select("id")
    .single();

  if (reporte && visitantesRegistrados.length > 0) {
    await supabase.from("visitantes_celula").delete().eq("reporte_id", reporte.id);
    await supabase.from("visitantes_celula").insert(
      visitantesRegistrados.map((v) => ({ ...v, reporte_id: reporte.id }))
    );
  }

  revalidatePath("/celulas");
  revalidatePath("/reportes");
  redirect("/celulas");
}

export async function desactivarCelula(celulaId: string, formData: FormData) {
  const supabase = createClient();

  await supabase
    .from("celulas")
    .update({
      activa: false,
      motivo_inactiva: formData.get("motivo") as string,
      fecha_inactiva: (formData.get("fecha") as string) || new Date().toISOString().slice(0, 10),
    })
    .eq("id", celulaId);

  revalidatePath("/celulas");
}

export async function reactivarCelula(celulaId: string) {
  const supabase = createClient();

  await supabase
    .from("celulas")
    .update({ activa: true, motivo_inactiva: null, fecha_inactiva: null })
    .eq("id", celulaId);

  revalidatePath("/celulas");
}

export async function crearProyecto(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("proyectos").insert({
    nombre: formData.get("nombre") as string,
    meta: Number(formData.get("meta")),
    duracion_meses: Number(formData.get("duracion_meses")),
    fecha_inicio: (formData.get("fecha_inicio") as string) || new Date().toISOString().slice(0, 10),
    descripcion: (formData.get("descripcion") as string) || null,
    creado_por: user?.id,
  });

  revalidatePath("/proyectos");
  redirect("/proyectos");
}

export async function registrarAporte(proyectoId: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("aportes_proyecto").insert({
    proyecto_id: proyectoId,
    monto: Number(formData.get("monto")),
    fecha: (formData.get("fecha") as string) || new Date().toISOString().slice(0, 10),
    origen: (formData.get("origen") as string) || null,
    creado_por: user?.id,
  });

  revalidatePath("/proyectos");
}

export async function crearUsuarioConRol(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: miPerfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (!miPerfil || !["admin", "pastor"].includes(miPerfil.role)) {
    return;
  }

  const nombre_completo = formData.get("nombre_completo") as string;
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const telefono = (formData.get("telefono") as string) || null;
  const zona_id = (formData.get("zona_id") as string) || null;

  const admin = createAdminClient();

  const { data: nuevoUsuario, error } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  });

  if (error || !nuevoUsuario.user) {
    return;
  }

  await admin.from("profiles").insert({
    id: nuevoUsuario.user.id,
    nombre_completo,
    role,
    telefono,
    zona_id,
  });

  revalidatePath("/administracion");
}

async function esAdminActual() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: miPerfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();
  return !!miPerfil && ["admin", "pastor"].includes(miPerfil.role);
}

export async function desactivarPersona(personaId: string) {
  if (!(await esAdminActual())) return;

  const supabase = createClient();
  const admin = createAdminClient();

  await admin.auth.admin.updateUserById(personaId, { ban_duration: "876000h" });
  await supabase.from("profiles").update({ activo: false }).eq("id", personaId);

  revalidatePath("/administracion");
}

export async function reactivarPersona(personaId: string) {
  if (!(await esAdminActual())) return;

  const supabase = createClient();
  const admin = createAdminClient();

  await admin.auth.admin.updateUserById(personaId, { ban_duration: "none" });
  await supabase.from("profiles").update({ activo: true }).eq("id", personaId);

  revalidatePath("/administracion");
}

export async function actualizarPersona(personaId: string, formData: FormData) {
  const supabase = createClient();

  await supabase
    .from("profiles")
    .update({
      nombre_completo: formData.get("nombre_completo") as string,
      telefono: (formData.get("telefono") as string) || null,
    })
    .eq("id", personaId);

  revalidatePath("/administracion");
}

export async function actualizarCelula(celulaId: string, formData: FormData) {
  const supabase = createClient();

  await supabase
    .from("celulas")
    .update({
      nombre: formData.get("nombre") as string,
      dia_semana: formData.get("dia_semana") as string,
      hora: (formData.get("hora") as string) || null,
      ubicacion: (formData.get("ubicacion") as string) || null,
      zona_id: (formData.get("zona_id") as string) || null,
      lider_id: (formData.get("lider_id") as string) || null,
    })
    .eq("id", celulaId);

  revalidatePath("/administracion");
  revalidatePath("/celulas");
}

export async function crearZona(formData: FormData) {
  const supabase = createClient();

  const nombre = formData.get("nombre") as string;

  await supabase.from("zonas").insert({ nombre });

  revalidatePath("/administracion");
  revalidatePath("/celulas");
}

export async function actualizarConfiguracion(formData: FormData) {
  const supabase = createClient();

  const nombre_iglesia = formData.get("nombre_iglesia") as string;
  const logo = formData.get("logo") as File | null;

  const update: { nombre_iglesia: string; logo_url?: string } = { nombre_iglesia };

  if (logo && logo.size > 0) {
    const extension = logo.name.split(".").pop() || "png";
    const path = `logo-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, logo, { upsert: true, contentType: logo.type });

    if (!uploadError) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      update.logo_url = data.publicUrl;
    }
  }

  await supabase.from("configuracion").update(update).eq("id", 1);

  revalidatePath("/", "layout");
}

export async function crearCategoriaFinanciera(formData: FormData) {
  const supabase = createClient();

  const nombre = formData.get("nombre") as string;
  const tipo = formData.get("tipo") as string;

  await supabase.from("categorias_financieras").insert({ nombre, tipo });

  revalidatePath("/administracion");
  revalidatePath("/finanzas/nuevo");
}

export async function crearMovimiento(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const comprobante = formData.get("comprobante") as File | null;
  let comprobante_url: string | null = null;

  if (comprobante && comprobante.size > 0) {
    const extension = comprobante.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(path, comprobante, { contentType: comprobante.type });

    if (!uploadError) {
      const { data } = supabase.storage.from("comprobantes").getPublicUrl(path);
      comprobante_url = data.publicUrl;
    }
  }

  await supabase.from("movimientos_financieros").insert({
    tipo: formData.get("tipo") as string,
    categoria: formData.get("categoria") as string,
    monto: Number(formData.get("monto")),
    fondo_id: (formData.get("fondo_id") as string) || null,
    fecha: formData.get("fecha") as string,
    origen: (formData.get("origen") as string) || "otro",
    descripcion: (formData.get("descripcion") as string) || null,
    comprobante_url,
    creado_por: user?.id,
  });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  redirect("/finanzas");
}

export async function crearPresupuesto(formData: FormData) {
  const supabase = createClient();

  const categoria = formData.get("categoria") as string;
  const tipo = formData.get("tipo") as string;
  const monto_esperado = Number(formData.get("monto_esperado"));

  await supabase
    .from("presupuestos")
    .upsert({ categoria, tipo, monto_esperado }, { onConflict: "categoria,tipo" });

  revalidatePath("/finanzas");
  revalidatePath("/administracion");
}

export async function eliminarPresupuesto(presupuestoId: string) {
  const supabase = createClient();
  await supabase.from("presupuestos").delete().eq("id", presupuestoId);
  revalidatePath("/finanzas");
  revalidatePath("/administracion");
}

export async function crearDiezmo(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("diezmos").insert({
    codigo_sobre: (formData.get("codigo_sobre") as string).trim(),
    monto: Number(formData.get("monto")),
    fecha: (formData.get("fecha") as string) || new Date().toISOString().slice(0, 10),
    notas: (formData.get("notas") as string) || null,
    creado_por: user?.id,
  });

  revalidatePath("/diezmos");
}

export async function crearCodigoSobre(formData: FormData) {
  const supabase = createClient();

  await supabase.from("codigos_sobre").insert({
    codigo: (formData.get("codigo") as string).trim(),
    nombre_real: formData.get("nombre_real") as string,
    telefono: (formData.get("telefono") as string) || null,
  });

  revalidatePath("/administracion");
}

export async function desactivarCodigoSobre(codigo: string) {
  const supabase = createClient();
  await supabase.from("codigos_sobre").update({ activo: false }).eq("codigo", codigo);
  revalidatePath("/administracion");
}

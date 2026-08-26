import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre_completo, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "lider";
  let miCelulaId: string | null = null;

  if (role === "lider") {
    const { data: miCelula } = await supabase
      .from("celulas")
      .select("id")
      .eq("lider_id", user.id)
      .limit(1)
      .maybeSingle();
    miCelulaId = miCelula?.id ?? null;
  }

  const config = await getConfiguracion(supabase);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        nombre={profile?.nombre_completo ?? user.email ?? "Usuario"}
        role={role}
        miCelulaId={miCelulaId}
        nombreIglesia={config.nombre_iglesia}
        logoUrl={config.logo_url}
      />
      <main className="flex-1 bg-brand-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

import { SupabaseClient } from "@supabase/supabase-js";

export type ConfiguracionIglesia = {
  nombre_iglesia: string;
  logo_url: string | null;
};

const DEFAULT_CONFIG: ConfiguracionIglesia = {
  nombre_iglesia: "Sistema de Iglesia",
  logo_url: null,
};

export async function getConfiguracion(supabase: SupabaseClient): Promise<ConfiguracionIglesia> {
  const { data } = await supabase
    .from("configuracion")
    .select("nombre_iglesia, logo_url")
    .eq("id", 1)
    .maybeSingle();

  return data ?? DEFAULT_CONFIG;
}

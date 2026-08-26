import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const supabase = createClient();
  const config = await getConfiguracion(supabase);

  return <LoginForm nombreIglesia={config.nombre_iglesia} logoUrl={config.logo_url} />;
}

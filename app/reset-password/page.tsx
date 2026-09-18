"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    async function prepararSesion() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError("Este enlace ya expiró o no es válido. Solicita uno nuevo desde el login.");
          setReady(true);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Este enlace ya expiró o no es válido. Solicita uno nuevo desde el login.");
      }
      setReady(true);
    }

    prepararSesion();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
      return;
    }

    setListo(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-900 to-brand-700 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-semibold text-white">Nueva contraseña</h1>
          <p className="text-brand-200 text-sm mt-1">Define tu nueva contraseña de acceso</p>
        </div>

        <div className="card space-y-4 animate-fade-in-up-delayed">
          {!ready ? (
            <p className="text-sm text-brand-500 text-center py-4">Verificando enlace...</p>
          ) : listo ? (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 animate-fade-in-down">
              Contraseña actualizada. Entrando...
            </p>
          ) : error && !password ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fade-in-down">
              {error}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fade-in-down">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

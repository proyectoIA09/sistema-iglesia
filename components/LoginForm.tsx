"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  nombreIglesia,
  logoUrl,
}: {
  nombreIglesia: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recuperarEnviado, setRecuperarEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo enviar el correo. Verifica el correo e intenta de nuevo.");
      return;
    }

    setRecuperarEnviado(true);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-brand-900 to-brand-700 px-4 overflow-hidden">
      {logoUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${logoUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 to-brand-700/90" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center shadow-lg mb-4 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={nombreIglesia} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">⛪</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white">{nombreIglesia}</h1>
          <p className="text-brand-200 text-sm mt-1">Ingresa con tu cuenta</p>
        </div>

        {modoRecuperar ? (
          <form onSubmit={handleRecuperar} className="card space-y-4 animate-fade-in-up-delayed">
            {recuperarEnviado ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 animate-fade-in-down">
                Si ese correo tiene una cuenta, te llegará un enlace para crear una nueva contraseña.
              </p>
            ) : (
              <>
                <div>
                  <label className="label">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="lider@iglesia.org"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fade-in-down">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setModoRecuperar(false);
                setRecuperarEnviado(false);
                setError(null);
              }}
              className="text-sm text-brand-600 hover:underline w-full text-center"
            >
              ← Volver a iniciar sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in-up-delayed">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="lider@iglesia.org"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setModoRecuperar(true);
                setError(null);
              }}
              className="text-sm text-brand-600 hover:underline w-full text-center"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        <p className="text-center text-brand-200 text-xs mt-6">
          ¿No tienes cuenta? Pídele a tu administrador que te la cree.
        </p>
        <p className="text-center text-brand-300/60 text-[11px] mt-3">
          Elaborado por Lic. Hugo Acosta (IA)
        </p>
      </div>
    </div>
  );
}

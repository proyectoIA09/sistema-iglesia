"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function linksForRole(role: string, miCelulaId: string | null) {
  if (role === "lider") {
    return [{ href: miCelulaId ? `/celulas/${miCelulaId}/reporte` : "/celulas", label: "Mi célula", icon: "📋" }];
  }
  if (role === "supervisor") {
    return [
      { href: "/dashboard", label: "Inicio", icon: "🏠" },
      { href: "/celulas", label: "Células de mi zona", icon: "👥" },
      { href: "/proyectos", label: "Proyectos", icon: "🎯" },
      { href: "/reportes", label: "Reportes", icon: "📊" },
    ];
  }
  // admin, pastor, finanzas
  return [
    { href: "/dashboard", label: "Inicio", icon: "🏠" },
    { href: "/celulas", label: "Células", icon: "👥" },
    { href: "/finanzas", label: "Finanzas", icon: "💰" },
    { href: "/proyectos", label: "Proyectos", icon: "🎯" },
    { href: "/reportes", label: "Reportes", icon: "📊" },
    { href: "/administracion", label: "Administración", icon: "⚙️" },
  ];
}

export default function Sidebar({
  nombre,
  role,
  miCelulaId,
}: {
  nombre: string;
  role: string;
  miCelulaId?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const links = linksForRole(role, miCelulaId ?? null);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    pastor: "Pastor",
    supervisor: "Supervisor de Zona",
    lider: "Líder de Célula",
    finanzas: "Finanzas",
  };

  return (
    <aside className="w-64 shrink-0 bg-brand-950 text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center text-lg">
          ⛪
        </div>
        <div>
          <p className="font-semibold leading-tight">Sistema de Iglesia</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href.split("?")[0]);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-brand-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-sm font-medium text-white truncate">{nombre}</p>
        <p className="text-xs text-brand-300 mb-3">{roleLabels[role] ?? role}</p>
        <button onClick={handleLogout} className="btn-secondary w-full bg-transparent border-white/20 text-white hover:bg-white/10">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

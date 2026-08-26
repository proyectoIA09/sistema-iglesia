"use client";

import { useRouter } from "next/navigation";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function ultimosMeses(cantidad: number) {
  const opciones: { value: string; label: string }[] = [];
  const hoy = new Date();
  for (let i = 0; i < cantidad; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    opciones.push({ value, label: `${MESES[d.getMonth()]} ${d.getFullYear()}` });
  }
  return opciones;
}

export default function ReportesFilterBar({
  mesActual,
  compararActual,
}: {
  mesActual: string;
  compararActual: string;
}) {
  const router = useRouter();
  const opciones = ultimosMeses(6);

  function actualizar(param: string, valor: string) {
    const params = new URLSearchParams({ mes: mesActual, comparar: compararActual });
    if (valor) params.set(param, valor);
    else params.delete(param);
    router.push(`/reportes?${params.toString()}`);
  }

  return (
    <div className="card flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[180px]">
        <label className="label">Mes</label>
        <select
          className="input"
          value={mesActual}
          onChange={(e) => actualizar("mes", e.target.value)}
        >
          {opciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="label">Comparar con</label>
        <select
          className="input"
          value={compararActual}
          onChange={(e) => actualizar("comparar", e.target.value)}
        >
          <option value="">Sin comparar</option>
          {opciones
            .filter((o) => o.value !== mesActual)
            .map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}

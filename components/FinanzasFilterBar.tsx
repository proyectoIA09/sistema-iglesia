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

export default function FinanzasFilterBar({
  tipoActual,
  mesActual,
}: {
  tipoActual: string;
  mesActual: string;
}) {
  const router = useRouter();
  const opciones = ultimosMeses(9);

  function actualizar(mes: string) {
    const params = new URLSearchParams();
    if (tipoActual !== "todos") params.set("tipo", tipoActual);
    if (mes !== "todos") params.set("mes", mes);
    const qs = params.toString();
    router.push(qs ? `/finanzas?${qs}` : "/finanzas");
  }

  return (
    <select
      className="input text-sm !w-auto"
      value={mesActual}
      onChange={(e) => actualizar(e.target.value)}
    >
      <option value="todos">Todos los meses</option>
      {opciones.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

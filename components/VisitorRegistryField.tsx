"use client";

import { useState } from "react";

type Visitante = { nombre: string; edad: string; telefono: string };

export default function VisitorRegistryField() {
  const [visitantes, setVisitantes] = useState<Visitante[]>([
    { nombre: "", edad: "", telefono: "" },
  ]);

  function actualizar(i: number, campo: keyof Visitante, valor: string) {
    setVisitantes((prev) => prev.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v)));
  }

  function agregar() {
    setVisitantes((prev) => [...prev, { nombre: "", edad: "", telefono: "" }]);
  }

  function quitar(i: number) {
    setVisitantes((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="border-t border-dashed border-brand-200 pt-4">
      <div className="flex items-center justify-between mb-1">
        <p className="label mb-0">
          Registro de visitantes{" "}
          <span className="text-brand-400 font-normal normal-case tracking-normal">
            ({visitantes.length})
          </span>
        </p>
        <button type="button" onClick={agregar} className="btn-secondary text-xs px-3 py-1.5">
          + Agregar visitante
        </button>
      </div>
      <p className="text-xs text-brand-400 mb-2">Para poder darles seguimiento después de la célula.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-400 text-xs">
              <th className="pb-1.5 font-medium">Nombre</th>
              <th className="pb-1.5 font-medium w-20">Edad</th>
              <th className="pb-1.5 font-medium w-36">Teléfono</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {visitantes.map((v, i) => (
              <tr key={i}>
                <td className="pb-2 pr-2">
                  <input
                    name="visitante_nombre[]"
                    value={v.nombre}
                    onChange={(e) => actualizar(i, "nombre", e.target.value)}
                    className="input"
                    placeholder="Nombre completo"
                  />
                </td>
                <td className="pb-2 pr-2">
                  <input
                    name="visitante_edad[]"
                    type="number"
                    min={0}
                    value={v.edad}
                    onChange={(e) => actualizar(i, "edad", e.target.value)}
                    className="input"
                  />
                </td>
                <td className="pb-2 pr-2">
                  <input
                    name="visitante_telefono[]"
                    type="tel"
                    value={v.telefono}
                    onChange={(e) => actualizar(i, "telefono", e.target.value)}
                    className="input"
                    placeholder="0000-0000"
                  />
                </td>
                <td className="pb-2">
                  <button
                    type="button"
                    onClick={() => quitar(i)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-600 text-sm"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

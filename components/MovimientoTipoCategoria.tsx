"use client";

import { useState } from "react";

type Categoria = { id: string; nombre: string; tipo: string };

export default function MovimientoTipoCategoria({ categorias }: { categorias: Categoria[] }) {
  const [tipo, setTipo] = useState("ingreso");
  const filtradas = categorias.filter((c) => c.tipo === tipo);

  return (
    <>
      <div>
        <label className="label">Tipo</label>
        <select
          name="tipo"
          required
          className="input"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>

      <div>
        <label className="label">Categoría</label>
        <select name="categoria" required className="input">
          {filtradas.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

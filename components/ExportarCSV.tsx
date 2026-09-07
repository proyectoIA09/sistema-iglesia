"use client";

function celda(valor: unknown) {
  const texto = String(valor ?? "");
  return `"${texto.replace(/"/g, '""')}"`;
}

export default function ExportarCSV({
  filas,
  columnas,
  nombreArchivo,
}: {
  filas: Record<string, unknown>[];
  columnas: { key: string; label: string }[];
  nombreArchivo: string;
}) {
  function exportar() {
    const encabezado = columnas.map((c) => celda(c.label)).join(",");
    const cuerpo = filas.map((f) => columnas.map((c) => celda(f[c.key])).join(","));
    const csv = "﻿" + [encabezado, ...cuerpo].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={exportar} className="btn-secondary text-sm">
      ⬇️ Exportar CSV
    </button>
  );
}

"use client";

export default function ImprimirBoton() {
  return (
    <button onClick={() => window.print()} className="btn-primary no-print">
      🖨️ Imprimir / Guardar como PDF
    </button>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config";
import { formatUSD } from "@/lib/format";
import ImprimirBoton from "@/components/ImprimirBoton";

export default async function BoletaPagoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: pago }, config] = await Promise.all([
    supabase
      .from("planilla_pagos")
      .select("id, numero, monto, mes_correspondiente, fecha_pago, notas, empleados(nombre_completo, cargo, dui)")
      .eq("id", params.id)
      .single(),
    getConfiguracion(supabase),
  ]);

  if (!pago) notFound();

  const empleado = (pago as any).empleados;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link href="/planilla?tab=pagos" className="text-sm text-brand-600 hover:underline">
          ← Volver a pagos
        </Link>
        <ImprimirBoton />
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-brand-100">
          <div className="w-11 h-11 rounded-xl bg-gold-500 flex items-center justify-center overflow-hidden shrink-0">
            {config.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">⛪</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-brand-950">{config.nombre_iglesia}</p>
            <p className="text-xs text-brand-500">Boleta de pago de planilla</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-brand-950">Boleta No. {pago.numero}</h1>
          <span className="text-sm text-brand-500">{pago.fecha_pago}</span>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-brand-500">Empleado</dt>
            <dd className="font-medium text-brand-950">{empleado?.nombre_completo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-500">Cargo</dt>
            <dd className="text-brand-950">{empleado?.cargo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-500">DUI</dt>
            <dd className="text-brand-950">{empleado?.dui ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-500">Mes correspondiente</dt>
            <dd className="text-brand-950">{pago.mes_correspondiente}</dd>
          </div>
          {pago.notas && (
            <div className="flex justify-between">
              <dt className="text-brand-500">Notas</dt>
              <dd className="text-brand-950 text-right max-w-[60%]">{pago.notas}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 pt-6 border-t border-brand-100 flex justify-between items-center">
          <span className="text-brand-500 text-sm">Monto pagado</span>
          <span className="text-2xl font-semibold text-brand-950">{formatUSD(Number(pago.monto))}</span>
        </div>

        <div className="mt-10 pt-8 grid grid-cols-2 gap-8 text-center text-xs text-brand-400">
          <div className="border-t border-brand-200 pt-2">Firma del empleado</div>
          <div className="border-t border-brand-200 pt-2">Firma de tesorería</div>
        </div>
      </div>
    </div>
  );
}

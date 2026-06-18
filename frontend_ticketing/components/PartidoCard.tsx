"use client";

import type { MasVendidoRow } from "@/lib/api";

type Props = {
  partido: MasVendidoRow;
};

export default function PartidoCard({ partido }: Props) {
  const fecha = new Date(partido.fecha_hora);
  const dia = fecha.toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = fecha.toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const ingreso =
    typeof partido.ingreso_total === "number"
      ? partido.ingreso_total
      : Number.parseFloat(partido.ingreso_total);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-night-soft p-5 shadow-lg">
      <div className="flex items-center justify-between gap-2 text-center">
        <span className="text-lg font-bold text-white">
          {partido.equipo_pais_local}
        </span>
        <span className="text-gold text-sm font-black tracking-wide">VS</span>
        <span className="text-lg font-bold text-white">
          {partido.equipo_pais_visitante}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-sm text-white/60">
        <span>
          {dia} — {hora}
        </span>
        <span>{partido.estadio}</span>
      </div>

      <hr className="border-white/10" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">
          {partido.total_entradas_vendidas.toLocaleString("es-UY")} entradas
        </span>
        <span className="font-semibold text-gold">
          ${ingreso.toLocaleString("es-UY")}
        </span>
      </div>
    </div>
  );
}

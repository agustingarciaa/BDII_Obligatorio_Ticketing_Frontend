"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import {
  getMisEntradas,
  getPartidos,
  type Entrada,
  type Partido,
} from "@/lib/api";

export default function MisEntradasCarrusel() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError("No hay sesión activa.");
      return;
    }
    Promise.all([getMisEntradas(token), getPartidos(token)])
      .then(([e, p]) => {
        setEntradas(e);
        setPartidos(p);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const partidoById = Object.fromEntries(partidos.map((p) => [p.id, p]));

  const ahora = Date.now();
  function esJugado(e: Entrada): boolean {
    const p = partidoById[e.sectorpartido_id_evento];
    return p ? new Date(p.fecha_hora).getTime() <= ahora : false;
  }

  const proximas = entradas.filter((e) => !esJugado(e));

  useEffect(() => {
    setIdx(0);
  }, [proximas.length]);

  const visible = 3;
  const max = Math.max(0, proximas.length - visible);

  if (loading)
    return <p className="text-sm text-white/50">Cargando tus entradas…</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (proximas.length === 0) return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-white">Mis entradas</h2>
      <p className="text-sm text-white/50">No tenés entradas para próximos partidos.</p>
    </section>
  );

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-white">Mis entradas</h2>

      <div className="relative">
        <button
          onClick={() => setIdx((p) => Math.max(p - 1, 0))}
          disabled={idx === 0}
          className="absolute -left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30"
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${idx * (100 / visible)}%)` }}
          >
            {proximas.map((e) => {
              const p = partidoById[e.sectorpartido_id_evento];
              const equipos = p
                ? `${p.equipo_pais_local} vs ${p.equipo_pais_visitante}`
                : `Partido #${e.sectorpartido_id_evento}`;
              const fecha = p
                ? new Date(p.fecha_hora).toLocaleString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={e.id_boleto}
                  className="min-w-0 shrink-0 px-2"
                  style={{ width: `${100 / visible}%` }}
                >
                  <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-night-soft p-4 shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {equipos}
                        </p>
                        <p className="mt-0.5 text-xs text-white/60">
                          Sector:{" "}
                          <span className="text-white/80">
                            {e.sectorpartido_nombre_sector}
                          </span>
                        </p>
                        {fecha && (
                          <p className="text-xs text-white/50">{fecha}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                        {e.estado}
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Link
                        href="/dashboard_usuario/mis-entradas"
                        className="flex-1 rounded-lg bg-gold py-2 text-center text-xs font-bold text-night transition hover:bg-gold-deep"
                      >
                        Ver QR
                      </Link>
                      <Link
                        href="/dashboard_usuario/mis-entradas"
                        className="flex-1 rounded-lg border border-white/20 py-2 text-center text-xs font-bold text-white/80 transition hover:border-white/40"
                      >
                        Transferir
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setIdx((p) => Math.min(p + 1, max))}
          disabled={idx === max}
          className="absolute -right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </section>
  );
}

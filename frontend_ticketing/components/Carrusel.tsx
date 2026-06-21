"use client";

import { useEffect, useState } from "react";
import { fetchPartidosMasVendidos, type MasVendidoRow } from "@/lib/api";
import PartidoCard from "./PartidoCard";

export default function Carrusel() {
  const [partidos, setPartidos] = useState<MasVendidoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetchPartidosMasVendidos()
      .then(setPartidos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = 5;
  const max = Math.max(0, partidos.length - visible);

  if (loading)
    return (
      <p className="text-sm text-white/50">Cargando partidos populares…</p>
    );
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (partidos.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-white">
        Partidos más populares
      </h2>

      <div className="relative">
        <button
          onClick={() => setIdx((p) => Math.max(p - 1, 0))}
          disabled={idx === 0}
          className="absolute left-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30 pb-5"
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${idx * (100 / visible)}%)` }}
          >
            {partidos.map((p) => (
              <div
                key={p.id}
                className="min-w-0 shrink-0 px-2"
                style={{ width: `${100 / visible}%` }}
              >
                <PartidoCard partido={p} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIdx((p) => Math.min(p + 1, max))}
          disabled={idx === max}
          className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </section>
  );
}

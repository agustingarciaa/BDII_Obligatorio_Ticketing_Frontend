"use client";

import { useState } from "react";
import Link from "next/link";
import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

const SECTIONS = [
  {
    label: "Partidos",
    href: "/dashboard_admin/partidos",
    desc: "Administrá los partidos del Mundial",
  },
  {
    label: "Estadios",
    href: "/dashboard_admin/estadios",
    desc: "Gestioná estadios y sectores",
  },
  {
    label: "Selecciones",
    href: "/dashboard_admin/selecciones",
    desc: "Administrá las selecciones",
  },
  {
    label: "Operaciones",
    href: "/dashboard_admin/operaciones",
    desc: "Compras y transferencias",
  },
  {
    label: "Dispositivos",
    href: "/dashboard_admin/dispositivos",
    desc: "Dispositivos de validación",
  },
  {
    label: "Asignaciones",
    href: "/dashboard_admin/asignaciones",
    desc: "Asignar funcionarios a sectores",
  },
  {
    label: "Estadísticas",
    href: "/dashboard_admin/estadisticas",
    desc: "Estadísticas del sistema",
  },
];

export default function DashboardAdmin() {
  const [idx, setIdx] = useState(0);

  const visible = 3;
  const max = Math.max(0, SECTIONS.length - visible);

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-screen flex-1 flex-col">
        <NavbarGeneral links={ADMIN_NAV_LINKS} />

        <main className="flex flex-1 flex-col items-center justify-center gap-12 p-10">
          <section className="text-center">
            <h1 className="text-4xl font-bold text-white">
              Panel de administración
            </h1>
            <p className="mt-2 text-lg text-white/60">
              Copa del Mundo 2026
            </p>
          </section>

          <section className="relative w-full max-w-4xl">
            <button
              onClick={() => setIdx((p) => Math.max(p - 1, 0))}
              disabled={idx === 0}
              className="absolute -left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-xl font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30"
              aria-label="Anterior"
            >
              ‹
            </button>

            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${idx * (100 / visible)}%)` }}
              >
                {SECTIONS.map((s) => (
                  <div
                    key={s.href}
                    className="min-w-0 shrink-0 px-3"
                    style={{ width: `${100 / visible}%` }}
                  >
                    <Link
                      href={s.href}
                      className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur transition hover:border-gold/50 hover:bg-white/10"
                    >
                      <span className="h-1 w-16 rounded-full bg-gold/60" />
                      <span className="text-xl font-bold text-white">
                        {s.label}
                      </span>
                      <span className="text-sm text-white/50">{s.desc}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIdx((p) => Math.min(p + 1, max))}
              disabled={idx === max}
              className="absolute -right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-xl font-bold text-night shadow-lg transition hover:bg-gold-deep disabled:opacity-30"
              aria-label="Siguiente"
            >
              ›
            </button>
          </section>
        </main>
      </div>
    </RequireRole>
  );
}

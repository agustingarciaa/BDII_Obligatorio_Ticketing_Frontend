"use client";

import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

export default function DashboardAdmin() {
  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero  min-h-full flex flex-1 flex-col">
        <NavbarGeneral links={ADMIN_NAV_LINKS} />

        <main className="flex flex-1 flex-col gap-8 p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Panel de administración
            </h1>

            <p className="mt-2 max-w-xl text-white/70">
              Gestioná estadios, partidos, sectores, equipos, funcionarios y
              dispositivos de tu jurisdicción para el Mundial 2026.
            </p>
          </section>
        </main>
      </div>
    </RequireRole>
  );
}

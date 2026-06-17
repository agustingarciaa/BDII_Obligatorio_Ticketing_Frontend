'use client';

import RequireRole from '@/components/RequireRole';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';

export default function DashboardAdmin() {
  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral rol="Administrador por sede" />
        <main className="flex flex-1 flex-col gap-6 p-10">
          <h1 className="text-3xl font-bold text-white">
            Panel de administración
          </h1>
          <p className="max-w-xl text-white/70">
            Gestioná estadios, partidos, sectores, equipos, funcionarios y
            dispositivos de tu jurisdicción para el Mundial 2026.
          </p>
        </main>
      </div>
    </RequireRole>
  );
}

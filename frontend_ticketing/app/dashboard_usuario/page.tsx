'use client';

import RequireRole from '@/components/RequireRole';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';

export default function DashboardUsuario() {
  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral rol="Hincha" />
        <main className="flex flex-1 flex-col gap-6 p-10">
          <h1 className="text-3xl font-bold text-white">Mi cuenta</h1>
          <p className="max-w-xl text-white/70">
            Comprá entradas para los partidos del Mundial 2026, mirá tus
            compras y transferencias, y generá el QR dinámico para ingresar al
            estadio.
          </p>
        </main>
      </div>
    </RequireRole>
  );
}

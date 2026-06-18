'use client';

import RequireRole from '@/components/RequireRole';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import DashboardHero from '@/components/DashboardHero';

export default function DashboardUsuario() {
  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral rol="Hincha" />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-10">
          <DashboardHero />
          <main className="flex max-w-xl flex-col gap-4 text-center">
            <p className="text-white/70">
              Comprá entradas para los partidos del Mundial 2026, mirá tus
              compras y transferencias, y generá el QR dinámico para ingresar al
              estadio.
            </p>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}

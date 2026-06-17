'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

// Barra superior temática del Mundial 2026, con etiqueta de rol y logout.
export default function NavbarGeneral({ rol }: { rol: string }) {
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace('/');
  }

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-night px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          ⚽
        </span>
        <span className="text-lg font-black tracking-tight text-white">
          MUNDIAL <span className="text-gold">2026</span>
        </span>
        <span className="ml-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
          {rol}
        </span>
      </div>
      <button
        onClick={logout}
        className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        Cerrar sesión
      </button>
    </header>
  );
}

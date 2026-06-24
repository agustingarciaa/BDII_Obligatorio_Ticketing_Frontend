'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { getPartidos, type Partido } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PartidoCard({ partido }: { partido: Partido }) {
  return (
    <Link href={`/dashboard_usuario/partidos/${partido.id}`} className="partido-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ background: 'rgba(255,204,41,0.18)', color: '#ffcc29', borderRadius: '999px', padding: '2px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
          Partido #{partido.id}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500 }}>
          Estadio #{partido.id_estadio}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.75rem 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
          <span style={{ fontSize: '2rem' }}>🏳️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
            {partido.equipo_pais_local}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 500 }}>Local</span>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 900, fontSize: '1rem' }}>VS</span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
          <span style={{ fontSize: '2rem' }}>🏳️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
            {partido.equipo_pais_visitante}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 500 }}>Visitante</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
          {formatFecha(partido.fecha_hora)}
        </span>
        <span className="partido-card__arrow">Ver sectores →</span>
      </div>
    </Link>
  );
}

function CartBadge() {
  const { totalCantidad } = useCart();
  if (!totalCantidad) return null;
  return (
    <Link
      href="/dashboard_usuario/carrito"
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50,
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#ffcc29', color: '#081226', fontWeight: 700,
        borderRadius: '999px', padding: '12px 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        textDecoration: 'none',
      }}
    >
      🛒 Carrito
      <span style={{ background: '#081226', color: '#ffcc29', borderRadius: '999px', padding: '2px 10px', fontSize: '0.875rem', fontWeight: 900 }}>
        {totalCantidad}
      </span>
    </Link>
  );
}

export default function PartidosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getPartidos(token)
      .then((data) => setPartidos(data.filter((p) => new Date(p.fecha_hora) > new Date())))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Partidos 2026
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Seleccioná un partido para ver los sectores disponibles y comprar entradas.
          </p>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#ffcc29', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.75rem', padding: '1rem', color: '#fca5a5', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {!loading && !error && partidos.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '5rem 0', fontSize: '1rem' }}>
              No hay partidos próximos disponibles.
            </p>
          )}

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {partidos.map((p) => <PartidoCard key={p.id} partido={p} />)}
          </div>
        </main>
        <CartBadge />
      </div>
    </RequireRole>
  );
}

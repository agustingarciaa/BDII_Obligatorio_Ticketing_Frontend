'use client';

import { useEffect, useState } from 'react';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { getMisCompras, type Compra } from '@/lib/api';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

const ESTADO_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  realizada:  { color: '#4ade80', bg: 'rgba(10,138,67,0.15)',  border: 'rgba(10,138,67,0.4)'  },
  paga:       { color: '#4ade80', bg: 'rgba(10,138,67,0.15)',  border: 'rgba(10,138,67,0.4)'  },
  confirmada: { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  pendiente:  { color: '#ffcc29', bg: 'rgba(255,204,41,0.1)',  border: 'rgba(255,204,41,0.3)' },
  cancelada:  { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'  },
};

function CompraCard({ compra }: { compra: Compra }) {
  const estilo = ESTADO_STYLE[compra.estado] ?? { color: '#fff', bg: 'transparent', border: 'rgba(255,255,255,0.2)' };
  // MySQL devuelve DECIMAL como string ('525.00', '0.0500') → coercer a número antes de operar
  const montoTotal = Number(compra.monto_total);
  const tasa = Number(compra.tasa_comision);
  const subtotal = Math.round((montoTotal / (1 + tasa)) * 100) / 100;
  const comision = Math.round((montoTotal - subtotal) * 100) / 100;

  return (
    <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Orden <span style={{ color: '#ffcc29' }}>#{compra.id_venta}</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            {new Date(compra.fecha).toLocaleString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span style={{ background: estilo.bg, border: `1px solid ${estilo.border}`, color: estilo.color, borderRadius: '999px', padding: '2px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
          {compra.estado}
        </span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
            {compra.cantidad} entrada{compra.cantidad !== 1 ? 's' : ''}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            Subtotal ${subtotal.toLocaleString('es-AR')} + comisión ({(tasa * 100).toFixed(0)}%) ${comision.toLocaleString('es-AR')}
          </span>
        </div>
        <span style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.375rem' }}>
          ${montoTotal.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  );
}

export default function MisComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMisCompras(token)
      .then(setCompras)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero wc-stripes" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Historial de compras
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            Todas tus transacciones realizadas en la plataforma.
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

          {!loading && !error && compras.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 0', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🧾</span>
              <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Todavía no realizaste ninguna compra.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {compras.map((c) => <CompraCard key={c.id_venta} compra={c} />)}
          </div>
        </main>
      </div>
    </RequireRole>
  );
}

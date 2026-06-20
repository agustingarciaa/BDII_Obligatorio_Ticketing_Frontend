'use client';

import { useEffect, useState, useCallback } from 'react';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { getMisTransferencias, aceptarTransferencia, rechazarTransferencia, type Transferencia } from '@/lib/api';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

const ESTADO_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pendiente: { label: 'Pendiente',  color: '#ffcc29', bg: 'rgba(255,204,41,0.1)',  border: 'rgba(255,204,41,0.3)' },
  aceptada:  { label: 'Aceptada',   color: '#4ade80', bg: 'rgba(10,138,67,0.15)', border: 'rgba(10,138,67,0.4)'  },
  rechazada: { label: 'Rechazada',  color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)'  },
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = ESTADO_LABEL[estado] ?? { label: estado, color: '#fff', bg: 'transparent', border: 'rgba(255,255,255,0.2)' };
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: '999px', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
      {s.label}
    </span>
  );
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Solicitudes pendientes recibidas ───────────────────────────────────────

function SolicitudCard({ t, onAccion }: { t: Transferencia; onAccion: () => void }) {
  const [loading, setLoading] = useState<'aceptar' | 'rechazar' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccion(accion: 'aceptar' | 'rechazar') {
    setLoading(accion);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Sin sesión.');
      if (accion === 'aceptar') await aceptarTransferencia(token, t.id_transferencia);
      else await rechazarTransferencia(token, t.id_transferencia);
      onAccion();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'rgba(255,204,41,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>
            Entrada <span style={{ color: '#ffcc29' }}>#{t.entrada_id_boleto}</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            De usuario <strong style={{ color: 'rgba(255,255,255,0.8)' }}>#{t.origen_id_usuario}</strong> · {formatFecha(t.fecha)}
          </p>
        </div>
        <EstadoBadge estado={t.estado} />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.625rem', padding: '8px 12px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn-gold"
          style={{ flex: 1 }}
          disabled={loading !== null}
          onClick={() => handleAccion('aceptar')}
        >
          {loading === 'aceptar' ? 'Aceptando...' : 'Aceptar'}
        </button>
        <button
          style={{
            flex: 1, padding: '10px', borderRadius: '0.75rem',
            background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          }}
          disabled={loading !== null}
          onClick={() => handleAccion('rechazar')}
        >
          {loading === 'rechazar' ? 'Rechazando...' : 'Rechazar'}
        </button>
      </div>
    </div>
  );
}

// ── Item del historial ─────────────────────────────────────────────────────

function HistorialItem({ t, tipo }: { t: Transferencia; tipo: 'enviada' | 'recibida' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderRadius: '0.75rem', background: '#0f1f3d', border: '1px solid rgba(255,255,255,0.08)', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem' }}>{tipo === 'enviada' ? '↑' : '↓'}</span>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
            Entrada <span style={{ color: '#ffcc29' }}>#{t.entrada_id_boleto}</span>
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>
          {tipo === 'enviada'
            ? `→ Usuario #${t.destino_id_usuario}`
            : `← Usuario #${t.origen_id_usuario}`}
          {' · '}{formatFecha(t.fecha)}
        </p>
      </div>
      <EstadoBadge estado={t.estado} />
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function MisTransferenciasPage() {
  const [data, setData] = useState<{ enviadas: Transferencia[]; recibidas: Transferencia[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    getMisTransferencias(token)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const pendientes = data?.recibidas.filter((t) => t.estado === 'pendiente') ?? [];
  const historial = [
    ...(data?.enviadas ?? []).map((t) => ({ t, tipo: 'enviada' as const })),
    ...(data?.recibidas.filter((t) => t.estado !== 'pendiente') ?? []).map((t) => ({ t, tipo: 'recibida' as const })),
  ].sort((a, b) => new Date(b.t.fecha).getTime() - new Date(a.t.fecha).getTime());

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero wc-stripes" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '2rem' }}>
            Mis transferencias
          </h1>

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

          {!loading && !error && data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              {/* Solicitudes pendientes */}
              <section>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Solicitudes pendientes
                  {pendientes.length > 0 && (
                    <span style={{ background: '#ffcc29', color: '#081226', borderRadius: '999px', padding: '1px 9px', fontSize: '0.75rem', fontWeight: 900 }}>
                      {pendientes.length}
                    </span>
                  )}
                </h2>
                {pendientes.length === 0 ? (
                  <p style={{ color: '#081226', fontSize: '0.9rem' }}>No tenés solicitudes pendientes.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendientes.map((t) => (
                      <SolicitudCard key={t.id_transferencia} t={t} onAccion={cargar} />
                    ))}
                  </div>
                )}
              </section>

              {/* Historial */}
              <section>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
                  Historial
                </h2>
                {historial.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Sin historial de transferencias.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {historial.map(({ t, tipo }) => (
                      <HistorialItem key={`${tipo}-${t.id_transferencia}`} t={t} tipo={tipo} />
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}
        </main>
      </div>
    </RequireRole>
  );
}

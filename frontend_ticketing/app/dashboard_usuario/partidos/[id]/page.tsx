'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { getSectoresPartido, getPartidos, type SectorPartido, type Partido } from '@/lib/api';
import { useCart, MAX_ENTRADAS } from '@/lib/cart-context';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

function SectorCard({ sector, partido }: { sector: SectorPartido; partido: Partido }) {
  const { agregar, items, totalCantidad } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const enCarrito = items.find(
    (i) => i.id_evento === partido.id && i.nombre_sector === sector.sector_nombre_sector,
  )?.cantidad ?? 0;

  const restante = MAX_ENTRADAS - totalCantidad;

  function mostrarToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function handleAgregar() {
    const err = agregar(
      {
        id_evento: partido.id,
        nombre_sector: sector.sector_nombre_sector,
        id_estadio: sector.sector_id_estadio,
        costo_entrada: sector.costo_entrada,
        equipos: `${partido.equipo_pais_local} vs ${partido.equipo_pais_visitante}`,
      },
      cantidad,
    );
    mostrarToast(
      err ?? `${cantidad} entrada${cantidad > 1 ? 's' : ''} agregada${cantidad > 1 ? 's' : ''} al carrito`,
      !err,
    );
  }

  return (
    <div className="sector-card">
      {toast && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', borderRadius: '999px', padding: '6px 16px',
          fontSize: '0.8125rem', fontWeight: 700, zIndex: 10,
          background: toast.ok ? '#0a8a43' : '#ef4444', color: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>
            {sector.sector_nombre_sector}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem', marginTop: '4px' }}>
            Capacidad: {sector.capacidad_max.toLocaleString('es-AR')} personas
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>
            ${sector.costo_entrada.toLocaleString('es-AR')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>por entrada</p>
        </div>
      </div>

      {enCarrito > 0 && (
        <div style={{ background: 'rgba(255,204,41,0.12)', border: '1px solid rgba(255,204,41,0.3)', borderRadius: '0.5rem', padding: '8px 12px', color: '#ffcc29', fontSize: '0.8125rem', fontWeight: 600 }}>
          ✓ Ya tenés {enCarrito} en el carrito
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className="qty-ctrl">
          <button className="qty-ctrl__btn" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
          <span className="qty-ctrl__val">{cantidad}</span>
          <button className="qty-ctrl__btn" onClick={() => setCantidad((c) => Math.min(Math.max(restante, 1), c + 1))}>+</button>
        </div>
        <button
          className="btn-gold"
          onClick={handleAgregar}
          disabled={restante <= 0}
          style={{ flex: 1 }}
        >
          {restante <= 0 ? 'Límite alcanzado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

export default function PartidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { totalCantidad } = useCart();

  const [partido, setPartido] = useState<Partido | null>(null);
  const [sectores, setSectores] = useState<SectorPartido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const idNum = Number(id);
    Promise.all([getPartidos(token), getSectoresPartido(idNum)])
      .then(([todos, sects]) => {
        setPartido(todos.find((p) => p.id === idNum) ?? null);
        setSectores(sects);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
          <Link href="/dashboard_usuario/partidos" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1.5rem' }}>
            ← Volver a partidos
          </Link>

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

          {partido && (
            <>
              {/* Header partido */}
              <div className="panel-dark" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🏳️</span>
                    <span style={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>{partido.equipo_pais_local}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>Local</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '1.5rem' }}>VS</span>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '8px', fontWeight: 500 }}>
                      {new Date(partido.fecha_hora).toLocaleString('es-AR', {
                        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: '2px' }}>
                      Estadio #{partido.id_estadio}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🏳️</span>
                    <span style={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>{partido.equipo_pais_visitante}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>Visitante</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Sectores disponibles</h2>
                <span style={{ background: 'rgba(255,204,41,0.12)', border: '1px solid rgba(255,204,41,0.3)', borderRadius: '999px', padding: '4px 12px', color: '#ffcc29', fontSize: '0.75rem', fontWeight: 600 }}>
                  Máx. {MAX_ENTRADAS} · quedan {Math.max(0, MAX_ENTRADAS - totalCantidad)}
                </span>
              </div>

              {sectores.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '3rem 0' }}>
                  No hay sectores habilitados para este partido.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sectores.map((s) => (
                    <SectorCard key={s.sector_nombre_sector} sector={s} partido={partido} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {totalCantidad > 0 && (
          <Link
            href="/dashboard_usuario/carrito"
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50,
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#ffcc29', color: '#081226', fontWeight: 700,
              borderRadius: '999px', padding: '12px 20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)', textDecoration: 'none',
            }}
          >
            🛒 Carrito
            <span style={{ background: '#081226', color: '#ffcc29', borderRadius: '999px', padding: '2px 10px', fontSize: '0.875rem', fontWeight: 900 }}>
              {totalCantidad}
            </span>
          </Link>
        )}
      </div>
    </RequireRole>
  );
}

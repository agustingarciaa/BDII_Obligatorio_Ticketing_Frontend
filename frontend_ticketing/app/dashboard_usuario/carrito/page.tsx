'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { comprarEntradas } from '@/lib/api';
import { useCart, MAX_ENTRADAS, TASA_COMISION } from '@/lib/cart-context';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

// ── Tarjeta visual ─────────────────────────────────────────────────────────

function CreditCardPreview({ numero, nombre, expiry }: { numero: string; nombre: string; expiry: string }) {
  const masked = numero.replace(/\D/g, '').padEnd(16, '·');
  const groups = [masked.slice(0, 4), masked.slice(4, 8), masked.slice(8, 12), masked.slice(12, 16)];

  return (
    <div style={{
      position: 'relative', height: '192px', width: '100%', maxWidth: '380px', margin: '0 auto',
      borderRadius: '1rem', padding: '1.5rem',
      background: 'linear-gradient(135deg, #0f1f3d 0%, #162848 50%, #0a1e3c 100%)',
      border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', userSelect: 'none',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', width: '10rem', height: '10rem', borderRadius: '50%', background: 'rgba(255,204,41,0.06)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mundial 2026</span>
          <span style={{ fontSize: '1.5rem' }}>💳</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)' }}>
          {groups.join(' ')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Titular</p>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nombre || 'TU NOMBRE'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Vence</p>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{expiry || 'MM/AA'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

type CardData = { nombre: string; numero: string; expiry: string; cvv: string };

function formatNumero(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function InputField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function CarritoPage() {
  const { items, subtotal, total, totalCantidad, quitar, cambiarCantidad, vaciar } = useCart();
  const [card, setCard] = useState<CardData>({ nombre: '', numero: '', expiry: '', cvv: '' });
  const [errores, setErrores] = useState<Partial<CardData>>({});
  const [validacionMsg, setValidacionMsg] = useState<string | null>(null);
  const [comprando, setComprando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);

  function validar(): boolean {
    const e: Partial<CardData> = {};
    if (!card.nombre.trim()) e.nombre = 'Requerido';
    if (card.numero.replace(/\D/g, '').length !== 16) e.numero = 'Ingresá 16 dígitos';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Formato MM/AA';
    if (card.cvv.replace(/\D/g, '').length < 3) e.cvv = 'Mínimo 3 dígitos';
    setErrores(e);
    if (Object.keys(e).length > 0) {
      setValidacionMsg('Completá todos los datos de la tarjeta para continuar.');
      return false;
    }
    setValidacionMsg(null);
    return true;
  }

  async function handleComprar() {
    if (!validar()) return;
    setComprando(true);
    setErrorCompra(null);
    try {
      const token = getToken();
      if (!token) throw new Error('No hay sesión activa. Recargá la página.');
      await comprarEntradas(
        token,
        items.map((i) => ({
          sectorpartido_nombre_sector: i.nombre_sector,
          sectorpartido_id_estadio: i.id_estadio,
          sectorpartido_id_evento: i.id_evento,
          cantidad: i.cantidad,
        })),
      );
      vaciar();
      setExito(true);
    } catch (e) {
      setErrorCompra(e instanceof Error ? e.message : 'Error inesperado al procesar la compra.');
    } finally {
      setComprando(false);
    }
  }

  // ── Pantalla éxito ────────────────────────────────────────────────────────
  if (exito) {
    return (
      <RequireRole role="CLIENTE">
        <div className="wc-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <NavbarGeneral links={USUARIO_NAV_LINKS} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', margin: '0 0 1.5rem', lineHeight: 1.1 }}>
              Gracias por<br />tu compra
            </h1>
            <Link href="/dashboard_usuario" style={{ borderRadius: '999px', background: '#ffcc29', padding: '14px 32px', color: '#081226', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
          <Link href="/dashboard_usuario/partidos" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1.5rem' }}>
            ← Seguir comprando
          </Link>

          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '2rem' }}>
            Tu carrito
          </h1>

          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 0', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', margin: 0 }}>El carrito está vacío.</p>
              <Link href="/dashboard_usuario/partidos" style={{ borderRadius: '999px', background: '#ffcc29', padding: '10px 24px', color: '#081226', fontWeight: 700, textDecoration: 'none' }}>
                Ver partidos
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0,1fr) 400px', alignItems: 'start' }}>

              {/* ── Lista de items ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Aviso máx entradas */}
                <div style={{ background: 'rgba(255,204,41,0.1)', border: '1px solid rgba(255,204,41,0.3)', borderRadius: '0.75rem', padding: '10px 16px', color: '#ffcc29', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ Máximo {MAX_ENTRADAS} entradas por transacción — llevás {totalCantidad}/{MAX_ENTRADAS}
                </div>

                {items.map((item) => (
                  <div key={`${item.id_evento}-${item.nombre_sector}`} className="carrito-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{item.equipos}</p>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
                          Sector: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{item.nombre_sector}</strong>
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem', margin: '2px 0 0' }}>
                          ${item.costo_entrada.toLocaleString('es-AR')} c/u
                        </p>
                      </div>
                      <button
                        onClick={() => quitar(item.id_evento, item.nombre_sector)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, padding: '4px', lineHeight: 1 }}
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="qty-ctrl">
                        <button
                          className="qty-ctrl__btn"
                          onClick={() => cambiarCantidad(item.id_evento, item.nombre_sector, item.cantidad - 1)}
                        >−</button>
                        <span className="qty-ctrl__val">{item.cantidad}</span>
                        <button
                          className="qty-ctrl__btn"
                          onClick={() => {
                            const err = cambiarCantidad(item.id_evento, item.nombre_sector, item.cantidad + 1);
                            if (err) setErrorCompra(err);
                          }}
                        >+</button>
                      </div>
                      <span style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.125rem' }}>
                        ${(item.costo_entrada * item.cantidad).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Resumen de precios */}
                <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Subtotal</span>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Comisión ({(TASA_COMISION * 100).toFixed(0)}%)</span>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>${(Math.round((total - subtotal) * 100) / 100).toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Total</span>
                    <span style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.5rem' }}>${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* ── Checkout ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <CreditCardPreview
                  numero={card.numero}
                  nombre={card.nombre.toUpperCase()}
                  expiry={card.expiry}
                />

                <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Datos de pago</h2>

                  {validacionMsg && (
                    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.625rem', padding: '10px 14px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {validacionMsg}
                    </div>
                  )}

                  <InputField label="Titular de la tarjeta" error={errores.nombre}>
                    <input
                      className="input-card"
                      placeholder="Nombre completo"
                      value={card.nombre}
                      onChange={(e) => setCard((c) => ({ ...c, nombre: e.target.value }))}
                    />
                  </InputField>

                  <InputField label="Número de tarjeta" error={errores.numero}>
                    <input
                      className="input-card"
                      placeholder="0000 0000 0000 0000"
                      value={card.numero}
                      maxLength={19}
                      onChange={(e) => setCard((c) => ({ ...c, numero: formatNumero(e.target.value) }))}
                    />
                  </InputField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <InputField label="Vencimiento" error={errores.expiry}>
                      <input
                        className="input-card"
                        placeholder="MM/AA"
                        value={card.expiry}
                        maxLength={5}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      />
                    </InputField>
                    <InputField label="CVV" error={errores.cvv}>
                      <input
                        className="input-card"
                        placeholder="•••"
                        type="password"
                        value={card.cvv}
                        maxLength={4}
                        onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      />
                    </InputField>
                  </div>

                  {errorCompra && (
                    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.625rem', padding: '10px 14px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {errorCompra}
                    </div>
                  )}

                  <button
                    className="btn-gold"
                    onClick={handleComprar}
                    disabled={comprando}
                  >
                    {comprando ? 'Procesando...' : `Comprar · $${total.toLocaleString('es-AR')}`}
                  </button>

                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', margin: 0 }}>
                    🔒 Transacción segura · Datos de tarjeta de prueba
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RequireRole>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import {
  getMisEntradas, getPartidos, transferirEntrada, buscarUsuarioPorMail, generarQR,
  type Entrada, type Partido, type UsuarioBusqueda,
} from '@/lib/api';
import { USUARIO_NAV_LINKS } from '@/lib/nav-links';

// ── Modal QR ───────────────────────────────────────────────────────────────

function ModalQR({ entrada, onClose }: { entrada: Entrada; onClose: () => void }) {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQR = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Sin sesión.');
      const data = await generarQR(token, entrada.id_boleto);
      setQrToken(data.qr_token);
      setSegundos(data.vigencia_segundos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar el QR.');
    } finally {
      setCargando(false);
    }
  }, [entrada.id_boleto]);

  useEffect(() => {
    fetchQR();
  }, [fetchQR]);

  // Cuenta regresiva — al llegar a 0 regenera
  useEffect(() => {
    if (!qrToken) return;
    timerRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          fetchQR();
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [qrToken, fetchQR]);

  const pct = (segundos / 30) * 100;
  const colorBarra = segundos > 15 ? '#4ade80' : segundos > 7 ? '#ffcc29' : '#f87171';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="panel-dark" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Entrada #{entrada.id_boleto}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '2px 0 0' }}>{entrada.sectorpartido_nombre_sector}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* QR */}
        {cargando && !qrToken && (
          <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#ffcc29', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>Generando QR...</p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.625rem', padding: '10px 14px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: 600, width: '100%' }}>
            {error}
          </div>
        )}

        {qrToken && (
          <>
            {/* Fondo blanco para el QR */}
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', position: 'relative' }}>
              {cargando && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#081226', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
              <QRCodeSVG value={qrToken} size={220} />
            </div>

            {/* Barra de tiempo */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Expira en</span>
                <span style={{ color: colorBarra, fontWeight: 700, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>{segundos}s</span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: colorBarra, borderRadius: '999px', transition: 'width 1s linear, background 0.3s' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textAlign: 'center', marginTop: '8px' }}>
                El código se regenera automáticamente cada 30 segundos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal de transferencia ─────────────────────────────────────────────────

function ModalTransferir({
  entrada,
  onClose,
  onSuccess,
}: {
  entrada: Entrada;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<UsuarioBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<UsuarioBusqueda | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (q: string) => {
    if (q.length < 3) { setResultados([]); return; }
    setBuscando(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await buscarUsuarioPorMail(token, q);
      setResultados(res);
    } catch { setResultados([]); }
    finally { setBuscando(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => buscar(query), 350);
    return () => clearTimeout(t);
  }, [query, buscar]);

  async function handleTransferir() {
    if (!seleccionado) return;
    setEnviando(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Sin sesión.');
      await transferirEntrada(token, entrada.id_boleto, seleccionado.id_usuario);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="panel-dark" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
            Transferir entrada <span style={{ color: '#ffcc29' }}>#{entrada.id_boleto}</span>
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
            Buscar destinatario por mail
          </label>
          <input
            className="input-card"
            placeholder="ejemplo@mail.com"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSeleccionado(null); }}
            autoFocus
          />
        </div>

        {/* Resultados */}
        {buscando && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', margin: 0 }}>Buscando...</p>
        )}
        {!buscando && query.length >= 3 && resultados.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', margin: 0 }}>Sin resultados.</p>
        )}
        {resultados.length > 0 && !seleccionado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resultados.map((u) => (
              <button
                key={u.id_usuario}
                onClick={() => { setSeleccionado(u); setQuery(u.mail); setResultados([]); }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.625rem', padding: '10px 14px', color: '#fff',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                {u.mail}
              </button>
            ))}
          </div>
        )}

        {/* Destinatario seleccionado */}
        {seleccionado && (
          <div style={{ background: 'rgba(255,204,41,0.1)', border: '1px solid rgba(255,204,41,0.3)', borderRadius: '0.75rem', padding: '10px 14px', color: '#ffcc29', fontSize: '0.875rem', fontWeight: 600 }}>
            ✓ Destinatario: {seleccionado.mail}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.625rem', padding: '10px 14px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            className="btn-gold"
            onClick={handleTransferir}
            disabled={!seleccionado || enviando}
            style={{ flex: 1 }}
          >
            {enviando ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de entrada ────────────────────────────────────────────────────────

function EntradaCard({
  entrada,
  partido,
  jugado,
  onTransferir,
  onVerQR,
}: {
  entrada: Entrada;
  partido: Partido | undefined;
  jugado: boolean;
  onTransferir: (e: Entrada) => void;
  onVerQR: (e: Entrada) => void;
}) {
  const equipos = partido
    ? `${partido.equipo_pais_local} vs ${partido.equipo_pais_visitante}`
    : `Partido #${entrada.sectorpartido_id_evento}`;

  const fecha = partido
    ? new Date(partido.fecha_hora).toLocaleString('es-AR', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: jugado ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{equipos}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            Sector: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{entrada.sectorpartido_nombre_sector}</strong>
          </p>
          {fecha && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '2px 0 0' }}>{fecha}</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <span style={{
            background: 'rgba(10,138,67,0.2)', border: '1px solid rgba(10,138,67,0.4)',
            color: '#4ade80', borderRadius: '999px', padding: '2px 10px',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          }}>
            {entrada.estado}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>#{entrada.id_boleto}</span>
        </div>
      </div>

      {jugado ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', textAlign: 'center', margin: 0, padding: '6px 0' }}>
          Partido finalizado · no disponible para QR ni transferencia
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            style={{
              flex: 1, padding: '10px', borderRadius: '0.75rem',
              background: '#ffcc29', color: '#081226', fontWeight: 700,
              fontSize: '0.875rem', border: 'none', cursor: 'pointer',
            }}
            onClick={() => onVerQR(entrada)}
          >
            Ver QR
          </button>
          <button
            style={{
              flex: 1, padding: '10px', borderRadius: '0.75rem',
              background: 'transparent', color: 'rgba(255,255,255,0.8)', fontWeight: 700,
              fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            }}
            onClick={() => onTransferir(entrada)}
          >
            Transferir
          </button>
        </div>
      )}
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function MisEntradasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalEntrada, setModalEntrada] = useState<Entrada | null>(null);
  const [modalQR, setModalQR] = useState<Entrada | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  function cargar() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    Promise.all([getMisEntradas(token), getPartidos(token)])
      .then(([e, p]) => { setEntradas(e); setPartidos(p); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  const partidoById = Object.fromEntries(partidos.map((p) => [p.id, p]));

  const ahora = Date.now();
  function esJugado(e: Entrada): boolean {
    const p = partidoById[e.sectorpartido_id_evento];
    return p ? new Date(p.fecha_hora).getTime() <= ahora : false;
  }
  const proximas = entradas.filter((e) => !esJugado(e));
  const jugadas = entradas.filter((e) => esJugado(e));

  function handleSuccess() {
    setModalEntrada(null);
    setExito('Transferencia enviada. El destinatario deberá aceptarla.');
    setTimeout(() => setExito(null), 5000);
    cargar();
  }

  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero wc-stripes" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Mis entradas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            Tus boletos activos para los próximos partidos.
          </p>

          {exito && (
            <div style={{ background: 'rgba(10,138,67,0.15)', border: '1px solid rgba(10,138,67,0.4)', borderRadius: '0.75rem', padding: '12px 16px', color: '#4ade80', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              ✓ {exito}
            </div>
          )}

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

          {!loading && !error && entradas.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 0', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🎟️</span>
              <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>No tenés entradas activas.</p>
            </div>
          )}

          {!loading && !error && entradas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* Próximos */}
              <section>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
                  Próximos partidos
                </h2>
                {proximas.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>No tenés entradas para próximos partidos.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {proximas.map((e) => (
                      <EntradaCard
                        key={e.id_boleto}
                        entrada={e}
                        partido={partidoById[e.sectorpartido_id_evento]}
                        jugado={false}
                        onTransferir={setModalEntrada}
                        onVerQR={setModalQR}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Ya jugados */}
              {jugadas.length > 0 && (
                <section>
                  <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
                    Partidos finalizados
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {jugadas.map((e) => (
                      <EntradaCard
                        key={e.id_boleto}
                        entrada={e}
                        partido={partidoById[e.sectorpartido_id_evento]}
                        jugado={true}
                        onTransferir={setModalEntrada}
                        onVerQR={setModalQR}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {modalQR && (
        <ModalQR entrada={modalQR} onClose={() => setModalQR(null)} />
      )}

      {modalEntrada && (
        <ModalTransferir
          entrada={modalEntrada}
          onClose={() => setModalEntrada(null)}
          onSuccess={handleSuccess}
        />
      )}
    </RequireRole>
  );
}

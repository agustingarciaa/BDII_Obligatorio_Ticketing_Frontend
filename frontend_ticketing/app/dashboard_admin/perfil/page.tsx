'use client';

import { useEffect, useState } from 'react';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import RequireRole from '@/components/RequireRole';
import { getToken } from '@/lib/auth';
import { getMiPerfil, modificarPerfil, type PerfilUsuario } from '@/lib/api';
import { ADMIN_NAV_LINKS } from '@/lib/nav-links';

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '10px 14px', color: readOnly ? 'rgba(255,255,255,0.4)' : '#fff', fontSize: '0.9375rem' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        className="input-card"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function PerfilAdminPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  // Campos editables
  const [dirPais, setDirPais] = useState('');
  const [dirLocalidad, setDirLocalidad] = useState('');
  const [dirCalle, setDirCalle] = useState('');
  const [dirNumero, setDirNumero] = useState('');
  const [dirCP, setDirCP] = useState('');
  const [telefonos, setTelefonos] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMiPerfil(token)
      .then((p) => {
        setPerfil(p);
        setDirPais(p.dir_pais ?? '');
        setDirLocalidad(p.dir_localidad ?? '');
        setDirCalle(p.dir_calle ?? '');
        setDirNumero(String(p.dir_numero ?? ''));
        setDirCP(p.dir_codigo_postal ?? '');
        setTelefonos(p.telefonos.join(', '));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleGuardar() {
    if (nuevaPass && nuevaPass !== confirmarPass) {
      setErrorGuardar('Las contraseñas no coinciden.');
      return;
    }
    setGuardando(true);
    setErrorGuardar(null);
    setExito(false);
    try {
      const token = getToken();
      if (!token) throw new Error('Sin sesión.');
      const payload: Parameters<typeof modificarPerfil>[1] = {};
      if (dirPais) payload.dir_pais = dirPais;
      if (dirLocalidad) payload.dir_localidad = dirLocalidad;
      if (dirCalle) payload.dir_calle = dirCalle;
      if (dirNumero) payload.dir_numero = Number(dirNumero);
      if (dirCP) payload.dir_codigo_postal = dirCP;
      if (telefonos.trim()) payload.telefonos = telefonos.split(',').map((t) => t.trim()).filter(Boolean);
      if (nuevaPass) payload.contrasena = nuevaPass;
      await modificarPerfil(token, payload);
      setExito(true);
      setNuevaPass('');
      setConfirmarPass('');
      setTimeout(() => setExito(false), 4000);
    } catch (e) {
      setErrorGuardar(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero" style={{ minHeight: '100vh' }}>
        <NavbarGeneral links={ADMIN_NAV_LINKS} />
        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ color: '#ffcc29', fontWeight: 900, fontSize: '1.875rem', marginBottom: '2rem' }}>
            Mi perfil
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

          {perfil && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Datos de solo lectura */}
              <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Datos de cuenta</h2>
                <Field label="Mail" value={perfil.mail} readOnly />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Field label="País doc." value={perfil.doc_pais} readOnly />
                  <Field label="Tipo doc." value={perfil.doc_tipo} readOnly />
                  <Field label="Número doc." value={perfil.doc_numero} readOnly />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', margin: 0 }}>
                  Estos datos no pueden modificarse.
                </p>
              </div>

              {/* Dirección */}
              <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Dirección</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <InputField label="País" value={dirPais} onChange={setDirPais} placeholder="Uruguay" />
                  <InputField label="Localidad" value={dirLocalidad} onChange={setDirLocalidad} placeholder="Montevideo" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                  <InputField label="Calle" value={dirCalle} onChange={setDirCalle} placeholder="18 de Julio" />
                  <InputField label="Número" value={dirNumero} onChange={setDirNumero} type="number" placeholder="1234" />
                  <InputField label="Código postal" value={dirCP} onChange={setDirCP} placeholder="11000" />
                </div>
              </div>

              {/* Teléfonos */}
              <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Teléfonos</h2>
                <InputField
                  label="Teléfonos (separados por coma)"
                  value={telefonos}
                  onChange={setTelefonos}
                  placeholder="099123456, 29001234"
                />
              </div>

              {/* Contraseña */}
              <div className="panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: '#ffcc29', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Cambiar contraseña</h2>
                <InputField label="Nueva contraseña" value={nuevaPass} onChange={setNuevaPass} type="password" placeholder="Mínimo 8 caracteres, may., min. y números" />
                <InputField label="Confirmar contraseña" value={confirmarPass} onChange={setConfirmarPass} type="password" placeholder="Repetí la contraseña" />
              </div>

              {exito && (
                <div style={{ background: 'rgba(10,138,67,0.15)', border: '1px solid rgba(10,138,67,0.4)', borderRadius: '0.75rem', padding: '12px 16px', color: '#4ade80', fontWeight: 600, fontSize: '0.875rem' }}>
                  ✓ Perfil actualizado correctamente.
                </div>
              )}

              {errorGuardar && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.75rem', padding: '12px 16px', color: '#fca5a5', fontWeight: 600, fontSize: '0.875rem' }}>
                  {errorGuardar}
                </div>
              )}

              <button className="btn-gold" onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>

            </div>
          )}
        </main>
      </div>
    </RequireRole>
  );
}

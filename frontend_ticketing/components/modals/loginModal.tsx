'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { decodeToken, saveToken, clearToken, type Role } from '@/lib/auth';

// A dónde va cada rol permitido en la web
const DESTINO_WEB: Partial<Record<Role, string>> = {
  ADMIN: '/dashboard_admin',
  CLIENTE: '/dashboard_usuario',
};

export default function LoginModal() {
  const router = useRouter();
  const [mail, setMail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await login(mail, contrasena);
      const payload = decodeToken(token);

      if (!payload) {
        setError('Respuesta de autenticación inválida.');
        return;
      }

      // El funcionario de validación solo entra por la app móvil
      if (payload.role === 'FUNCIONARIO') {
        clearToken();
        setError(
          'Los funcionarios de validación ingresan desde la app móvil.',
        );
        return;
      }

      const destino = DESTINO_WEB[payload.role];
      if (!destino) {
        clearToken();
        setError('Tu rol no tiene acceso a la versión web.');
        return;
      }

      saveToken(token);
      router.push(destino);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md"
    >
      <h2 className="text-2xl font-semibold text-white">Iniciar sesión</h2>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Mail
        <input
          type="email"
          required
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none transition-colors focus:border-gold"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Contraseña
        <input
          type="password"
          required
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none transition-colors focus:border-gold"
        />
      </label>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-gold px-5 py-2.5 font-semibold text-night transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-xs text-white/50">¿No tenés cuenta?</span>
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <Link
        href="/registro"
        className="rounded-full border border-gold/60 px-5 py-2.5 text-center font-semibold text-gold transition-colors hover:bg-gold/10"
      >
        Registrarme para comprar entradas
      </Link>
    </form>
  );
}

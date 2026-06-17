import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { login as apiLogin } from '@/lib/api';
import {
  clearToken,
  decodeToken,
  getTokenAsync,
  getRole,
  saveToken,
  type Role,
} from '@/lib/auth';

type AuthState = {
  role: Role | null;
  token: string | null;
  loading: boolean;
  signIn: (mail: string, contrasena: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRole(), getTokenAsync()])
      .then(([r, t]) => {
        setRole(r);
        setToken(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (mail: string, contrasena: string) => {
    const t = await apiLogin(mail, contrasena);
    const payload = decodeToken(t);

    if (!payload) {
      throw new Error('Respuesta de autenticación inválida.');
    }

    if (payload.role !== 'FUNCIONARIO') {
      throw new Error(
        'Solo los funcionarios de validación pueden usar esta app. Usá la versión web.',
      );
    }

    await saveToken(t);
    setToken(t);
    setRole(payload.role);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ role, token, loading, signIn, signOut }),
    [role, token, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

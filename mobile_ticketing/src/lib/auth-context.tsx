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
  getRole,
  saveToken,
  type Role,
} from '@/lib/auth';

type AuthState = {
  role: Role | null;
  loading: boolean;
  signIn: (mail: string, contrasena: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar la sesión guardada al arrancar
  useEffect(() => {
    getRole()
      .then(setRole)
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (mail: string, contrasena: string) => {
    const token = await apiLogin(mail, contrasena);
    const payload = decodeToken(token);

    if (!payload) {
      throw new Error('Respuesta de autenticación inválida.');
    }

    if (payload.role !== 'FUNCIONARIO') {
      throw new Error(
        'Solo los funcionarios de validación pueden usar esta app. Usá la versión web.',
      );
    }

    await saveToken(token);
    setRole(payload.role);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ role, loading, signIn, signOut }),
    [role, loading, signIn, signOut],
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

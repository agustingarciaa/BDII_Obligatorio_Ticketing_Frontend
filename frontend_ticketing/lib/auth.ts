'use client';

// Roles tal como los emite el backend en el JWT (auth/roles.enum.ts)
export type Role = 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';

const TOKEN_KEY = 'ticketing_token';

type JwtPayload = { sub: number; role: Role; exp?: number };

export function decodeToken(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRole(): Role | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  // Token expirado → sesión inválida
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearToken();
    return null;
  }

  return payload.role;
}

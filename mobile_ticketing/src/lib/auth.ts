import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Roles 
export type Role = 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';

const TOKEN_KEY = 'ticketing_token';

type JwtPayload = { sub: number; role: Role; exp?: number };

//SecureStore en nativas, localStorage en web
async function setTokenStorage(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

function getTokenStorage(): string | null {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
  return null;
}

async function deleteTokenStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

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

export async function saveToken(token: string): Promise<void> {
  await setTokenStorage(token);
}

export function getToken(): string | null {
  return getTokenStorage();
}

export async function clearToken(): Promise<void> {
  await deleteTokenStorage();
}

export async function getRole(): Promise<Role | null> {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    await clearToken();
    return null;
  }

  return payload.role;
}

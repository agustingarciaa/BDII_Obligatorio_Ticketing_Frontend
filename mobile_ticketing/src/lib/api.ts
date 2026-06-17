// En dispositivo físico, apuntá EXPO_PUBLIC_API_URL a la IP de tu máquina
// (p. ej. http://192.168.1.50:3000); en simulador, localhost suele alcanzar.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function login(
  mail: string,
  contrasena: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, contrasena }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Credenciales inválidas');
    }
    throw new Error('No se pudo iniciar sesión. Intentá de nuevo.');
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

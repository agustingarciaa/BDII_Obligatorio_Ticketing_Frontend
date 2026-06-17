export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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

export type RegisterInput = {
  doc_pais: string;
  doc_tipo: string;
  doc_numero: string;
  mail: string;
  contrasena: string;
  dir_pais: string;
  dir_localidad: string;
  dir_calle: string;
  dir_numero: number;
  dir_codigo_postal: string;
  telefonos?: string[];
};

// Auto-registro del usuario general (POST /auth/register).
// El backend devuelve el token ya logueado como CLIENTE.
export async function register(input: RegisterInput): Promise<string> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const msg = Array.isArray(data?.message) ? data?.message[0] : data?.message;
    if (res.status === 409) {
      throw new Error(msg ?? 'El usuario ya está registrado.');
    }
    throw new Error(msg ?? 'No se pudo completar el registro.');
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

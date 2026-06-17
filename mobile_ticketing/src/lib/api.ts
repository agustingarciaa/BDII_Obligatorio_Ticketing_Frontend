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

export type SectorAsignado = {
  nombre_sector: string;
  id_estadio: number;
  id_evento: number;
  capacidad_max: number;
  activo: boolean;
};

export async function getMisSectores(token: string): Promise<SectorAsignado[]> {
  const res = await fetch(`${API_URL}/sectores/mis-sectores`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('No se pudieron cargar los sectores asignados.');
  }

  return res.json() as Promise<SectorAsignado[]>;
}

export type ResultadoEscaneo = {
  mensaje?: string;
  message?: string;
  valido?: boolean;
};

export async function escanearQR(
  token: string,
  qr_token: string,
): Promise<ResultadoEscaneo> {
  const res = await fetch(`${API_URL}/validacion/escanear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qr_token }),
  });

  const data = (await res.json()) as ResultadoEscaneo;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string; mensaje?: string }).message ||
        (data as { message?: string; mensaje?: string }).mensaje ||
        'QR inválido o entrada ya consumida.',
    );
  }

  return data;
}

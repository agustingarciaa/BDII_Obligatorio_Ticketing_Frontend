import { getToken } from './auth';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(data: ApiErrorResponse | null, fallback: string) {
  const message = data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return message ?? fallback;
}

function authHeaders() {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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
export type MasVendidoRow = {
  id: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: Date | string;
  estadio: string;
  total_entradas_vendidas: number;
  ingreso_total: string | number;
};

  export type Sector = {
  nombre_sector: string;
  id_estadio: number;
  capacidad_max: number;
  activo: boolean;
};

export async function fetchPartidosMasVendidos(): Promise<MasVendidoRow[]> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('ticketing_token')
      : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/estadisticas/partidos/mas-vendidos`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los partidos más vendidos.');
  }

  return res.json() as Promise<MasVendidoRow[]>;
}

export async function register(input: RegisterInput): Promise<string> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

    if (res.status === 409) {
      throw new Error(getErrorMessage(data, 'El usuario ya está registrado.'));
    }

    throw new Error(getErrorMessage(data, 'No se pudo completar el registro.'));
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type Partido = {
  id: number;
  id_estadio: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: string;
  activo: boolean;
};

export type CreatePartidoInput = {
  id_estadio: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: string;
};

export type UpdatePartidoInput = Partial<CreatePartidoInput>;

export async function getPartidos(): Promise<Partido[]> {
  const res = await fetch(`${API_URL}/partidos`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los partidos.');
  }

  return (await res.json()) as Partido[];
}

export async function getPartido(id: number): Promise<Partido> {
  const res = await fetch(`${API_URL}/partidos/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el partido.');
  }

  return (await res.json()) as Partido;
}

export async function crearPartido(
  input: CreatePartidoInput,
): Promise<Partido> {
  const res = await fetch(`${API_URL}/partidos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | Partido
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null, 'No se pudo crear el partido.'),
    );
  }

  return data as Partido;
}

export async function editarPartido(
  id: number,
  input: UpdatePartidoInput,
): Promise<Partido> {
  const res = await fetch(`${API_URL}/partidos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | Partido
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null, 'No se pudo editar el partido.'),
    );
  }

  return data as Partido;
}

export async function eliminarPartido(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/partidos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(data, 'No se pudo eliminar el partido.'));
  }
}

export type SectorPartido = {
  sector_nombre_sector: string;
  sector_id_estadio: number;
  costo_entrada: number;
  capacidad_max: number;
};

export type HabilitarSectorPartidoInput = {
  sector_nombre_sector: string;
  sector_id_estadio: number;
  costo_entrada: number;
};

export async function getSectoresPartido(
  id: number,
): Promise<SectorPartido[]> {
  const res = await fetch(`${API_URL}/partidos/${id}/sectores`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los sectores.');
  }

  return (await res.json()) as SectorPartido[];
}
export async function habilitarSectorPartido(
  id: number,
  input: HabilitarSectorPartidoInput,
): Promise<void> {
  const res = await fetch(`${API_URL}/partidos/${id}/sectores`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(data, 'No se pudo habilitar el sector.'));
  }
}

export async function getSectores(): Promise<Sector[]> {
  const res = await fetch(`${API_URL}/sectores`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los sectores.');
  }

  return (await res.json()) as Sector[];
  }

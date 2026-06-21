import { getToken } from './auth';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Tipos: Partidos / Sectores ───────────────────────────────────────────────

export type Partido = {
  id: number;
  id_estadio: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: string;
  activo: boolean;
};

export type SectorPartido = {
  sector_nombre_sector: string;
  sector_id_estadio: number;
  costo_entrada: number;
  capacidad_max: number;
};
export type Equipo = {
  pais: string;
  activo: boolean;
};

export type CreateEquipoInput = {
  pais: string;
};

export type UpdateEquipoInput = {
  pais: string;
};

export type ItemCompra = {
  sectorpartido_nombre_sector: string;
  sectorpartido_id_estadio: number;
  sectorpartido_id_evento: number;
  cantidad: number;
};

export type CreatePartidoInput = {
  id_estadio: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: string;
};

export type UpdatePartidoInput = Partial<CreatePartidoInput>;

export type HabilitarSectorPartidoInput = {
  sector_nombre_sector: string;
  sector_id_estadio: number;
  costo_entrada: number;
};

export type Sector = {
  nombre_sector: string;
  id_estadio: number;
  capacidad_max: number;
  activo: boolean;
};

export type MasVendidoRow = {
  id: number;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: Date | string;
  estadio: string;
  total_entradas_vendidas: number;
  ingreso_total: string | number;
};
export type CompraAdmin = {
  id_venta: number;
  fecha: string;
  estado: string;
  monto_total: string;
  tasa_comision: string;
  id_usuario: number;
  mail: string;
  cantidad_entradas: number;
};

export type TransferenciaAdmin = {
  id_transferencia: number;
  fecha: string;
  estado: string;
  entrada_id_boleto: number;
  origen_id_usuario: number;
  origen_mail: string;
  destino_id_usuario: number;
  destino_mail: string;
};

export async function getAdminCompras(): Promise<CompraAdmin[]> {
  const res = await fetch(`${API_URL}/entradas/admin/compras`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener las compras.');
  }

  return (await res.json()) as CompraAdmin[];
}

export async function getAdminTransferencias(): Promise<TransferenciaAdmin[]> {
  const res = await fetch(`${API_URL}/entradas/admin/transferencias`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener las transferencias.');
  }

  return (await res.json()) as TransferenciaAdmin[];
}

// ── Partidos (lectura) ───────────────────────────────────────────────────────
// token es opcional: si no se pasa, se usa el token guardado (authHeaders()).

export async function getPartidos(token?: string): Promise<Partido[]> {
  const res = await fetch(`${API_URL}/partidos`, {
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
  });
  if (!res.ok) throw new Error('No se pudieron obtener los partidos.');
  return (await res.json()) as Partido[];
}

export async function getPartido(id: number): Promise<Partido> {
  const res = await fetch(`${API_URL}/partidos/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('No se pudo obtener el partido.');
  return (await res.json()) as Partido;
}

export async function getSectoresPartido(id: number): Promise<SectorPartido[]> {
  const res = await fetch(`${API_URL}/partidos/${id}/sectores`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('No se pudieron obtener los sectores.');
  return (await res.json()) as SectorPartido[];
}

// ── Partidos (admin) ─────────────────────────────────────────────────────────

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

export async function getEquipos(): Promise<Equipo[]> {
  const res = await fetch(`${API_URL}/equipos`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener las selecciones.');
  }

  return (await res.json()) as Equipo[];
}

export async function crearEquipo(
  input: CreateEquipoInput,
): Promise<Equipo> {
  const res = await fetch(`${API_URL}/equipos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | Equipo
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null,
      'No se pudo crear la selección.'),
    );
  }

  return data as Equipo;
}

export async function editarEquipo(
  pais: string,
  input: UpdateEquipoInput,
): Promise<Equipo> {
  const res = await fetch(`${API_URL}/equipos/${pais}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | Equipo
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null,
      'No se pudo editar la selección.'),
    );
  }

  return data as Equipo;
}

export async function eliminarEquipo(
  pais: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/equipos/${pais}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data =
      (await res.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(
      getErrorMessage(data, 'No se pudo eliminar la selección.'),
    );
  }
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
  if (!res.ok) throw new Error('No se pudieron obtener los sectores.');
  return (await res.json()) as Sector[];
}

// ── Estadísticas ─────────────────────────────────────────────────────────────

export async function fetchPartidosMasVendidos(): Promise<MasVendidoRow[]> {
  const res = await fetch(`${API_URL}/estadisticas/partidos/mas-vendidos`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error('No se pudieron obtener los partidos más vendidos.');
  }
  return res.json() as Promise<MasVendidoRow[]>;
}

// ── Tipos: Entradas / Transferencias / Perfil ────────────────────────────────

export type Entrada = {
  id_boleto: number;
  estado: 'activo' | 'vencida' | 'utilizada';
  sectorpartido_nombre_sector: string;
  sectorpartido_id_estadio: number;
  sectorpartido_id_evento: number;
  qr_token_actual: string | null;
  qr_token_expira_en: string | null;
  venta_id_venta: number;
  propietario_id_usuario: number;
};

export type Transferencia = {
  id_transferencia: number;
  entrada_id_boleto: number;
  origen_id_usuario: number;
  destino_id_usuario: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha: string;
};

export type UsuarioBusqueda = { id_usuario: number; mail: string };

export type PerfilUsuario = {
  mail: string;
  doc_pais: string;
  doc_tipo: string;
  doc_numero: string;
  dir_pais: string;
  dir_localidad: string;
  dir_calle: string;
  dir_numero: number;
  dir_codigo_postal: string;
  telefonos: string[];
};

export type ModificarPerfilInput = {
  contrasena?: string;
  dir_pais?: string;
  dir_localidad?: string;
  dir_calle?: string;
  dir_numero?: number;
  dir_codigo_postal?: string;
  telefonos?: string[];
};

export type Compra = {
  id_venta: number;
  fecha: string;
  estado: string;
  monto_total: number;
  tasa_comision: number;
  cantidad: number;
};

// ── Entradas ─────────────────────────────────────────────────────────────────

export async function getMisEntradas(token: string): Promise<Entrada[]> {
  const res = await fetch(`${API_URL}/entradas/mis-entradas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudieron cargar las entradas.');
  return res.json() as Promise<Entrada[]>;
}

export async function comprarEntradas(
  token: string,
  items: ItemCompra[],
): Promise<unknown> {
  const res = await fetch(`${API_URL}/entradas/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  const data = (await res.json()) as { message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message;
    throw new Error(msg ?? 'Error al procesar la compra.');
  }
  return data;
}

export async function getMisCompras(token: string): Promise<Compra[]> {
  const res = await fetch(`${API_URL}/entradas/mis-compras`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudieron cargar las compras.');
  return res.json() as Promise<Compra[]>;
}

export async function generarQR(token: string, id_boleto: number): Promise<{ qr_token: string; vigencia_segundos: number }> {
  const res = await fetch(`${API_URL}/validacion/qr/${id_boleto}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { qr_token?: string; vigencia_segundos?: number; message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg ?? 'Error al generar el QR.');
  }
  return data as { qr_token: string; vigencia_segundos: number };
}

// ── Transferencias ───────────────────────────────────────────────────────────

export async function getMisTransferencias(token: string): Promise<{ enviadas: Transferencia[]; recibidas: Transferencia[] }> {
  const res = await fetch(`${API_URL}/entradas/mis-transferencias`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudieron cargar las transferencias.');
  return res.json() as Promise<{ enviadas: Transferencia[]; recibidas: Transferencia[] }>;
}

export async function transferirEntrada(token: string, id_boleto: number, destino_id_usuario: number): Promise<unknown> {
  const res = await fetch(`${API_URL}/entradas/transferir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id_boleto, destino_id_usuario }),
  });
  const data = (await res.json()) as { message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg ?? 'Error al transferir la entrada.');
  }
  return data;
}

export async function aceptarTransferencia(token: string, id: number): Promise<unknown> {
  const res = await fetch(`${API_URL}/entradas/transferencias/${id}/aceptar`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg ?? 'Error al aceptar la transferencia.');
  }
  return data;
}

export async function rechazarTransferencia(token: string, id: number): Promise<unknown> {
  const res = await fetch(`${API_URL}/entradas/transferencias/${id}/rechazar`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg ?? 'Error al rechazar la transferencia.');
  }
  return data;
}

// ── Perfil ───────────────────────────────────────────────────────────────────

export async function getMiPerfil(token: string): Promise<PerfilUsuario> {
  const res = await fetch(`${API_URL}/usuarios/info`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo cargar el perfil.');
  return res.json() as Promise<PerfilUsuario>;
}

export async function modificarPerfil(token: string, data: ModificarPerfilInput): Promise<void> {
  const res = await fetch(`${API_URL}/usuarios/info/modificar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  if (!res.ok) {
    const msg = Array.isArray(body?.message) ? body!.message![0] : body?.message;
    throw new Error(msg ?? 'Error al guardar los cambios.');
  }
}

export async function buscarUsuarioPorMail(token: string, mail: string): Promise<UsuarioBusqueda[]> {
  const res = await fetch(`${API_URL}/usuarios/buscar?mail=${encodeURIComponent(mail)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al buscar usuario.');
  return res.json() as Promise<UsuarioBusqueda[]>;
}

// ── Estadios ─────────────────────────────────────────────────────────────────────

export type Estadio = {
  id_estadio: number;
  nombre: string;
  pais: string;
  ciudad: string;
  activo: boolean;
};

export type CreateEstadioInput = {
  nombre: string;
  pais: string;
  ciudad: string;
};

export type UpdateEstadioInput = Partial<CreateEstadioInput>;

export async function getEstadios(): Promise<Estadio[]> {
  const res = await fetch(`${API_URL}/estadios`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los estadios.');
  }

  return (await res.json()) as Estadio[];
}

export async function crearEstadio(
  input: CreateEstadioInput,
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/estadios`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | { message: string }
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null, 'No se pudo crear el estadio.'),
    );
  }

  return data as { message: string };
}

export async function editarEstadio(
  id: number,
  input: UpdateEstadioInput,
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/estadios/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => null)) as
    | ApiErrorResponse
    | { message: string }
    | null;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data as ApiErrorResponse | null, 'No se pudo editar el estadio.'),
    );
  }

  return data as { message: string };
}

export async function eliminarEstadio(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/estadios/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(getErrorMessage(data, 'No se pudo eliminar el estadio.'));
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

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

// Auto-registro del usuario general (POST /auth/register).
// El backend devuelve el token ya logueado como CLIENTE.
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

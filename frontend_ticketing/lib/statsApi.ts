import { authHeaders } from "./api";
import { API_URL } from "./api";
import { type MasVendidoRow } from "./api";

export type SectorPopularRow = {
  nombre_sector: string;
  id_estadio: number;
  estadio_nombre: string;
  total_vendidas: number;
  capacidad_max: number;
};
export type MayorCompradorRow = {
  mail: string;
  dir_pais: string;
  dir_localidad: string;
  cant_compras: number;
};

export type EquipoPopularRow = {
  pais: string;
  partidos_jugados: number;
  capacidad_total: number;
  entradas_vendidas: number;
  porcentaje_venta: number;
};

export async function fetchpartidosMenosVendidos(): Promise<MasVendidoRow[]> {
  const res = await fetch(`${API_URL}/estadisticas/partidos/menos-vendidos`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("No se pudieron obtener partidos menos vendidos");
  }
  return res.json() as Promise<MasVendidoRow[]>;
}

export async function fetchSectoresMasPopulares(): Promise<SectorPopularRow[]> {
  const res = await fetch(`${API_URL}/estadisticas/sectores/mas-populares`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los sectores mas populares");
  }
  return res.json() as Promise<SectorPopularRow[]>;
}

export async function fetchMayoresCompradores(): Promise<MayorCompradorRow[]> {
  const res = await fetch(
    `${API_URL}/estadisticas/usuarios/mayores-compradores`,
    {
      headers: authHeaders(),
    },
  );
  if (!res.ok) {
    throw new Error("No se pudieron obtener los mayores compradores");
  }
  return res.json() as Promise<MayorCompradorRow[]>;
}

export async function fetchEquiposPopulares(): Promise<EquipoPopularRow[]> {
  const res = await fetch(`${API_URL}/estadisticas/equipos/populares`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los equipos populares");
  }
  return res.json() as Promise<EquipoPopularRow[]>;
}

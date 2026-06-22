"use client";

import { useEffect, useState } from "react";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import StatBlock from "@/components/StatBlock";
import {
  fetchpartidosMenosVendidos,
  fetchSectoresMasPopulares,
  fetchMayoresCompradores,
  fetchEquiposPopulares,
  type SectorPopularRow,
  type MayorCompradorRow,
  type EquipoPopularRow,
} from "@/lib/statsApi";
import { fetchPartidosMasVendidos, type MasVendidoRow } from "@/lib/api";

export default function EstadisticasPage() {
  const [menosVendidos, setMenosVendidos] = useState<MasVendidoRow[]>([]);
  const [masVendidos, setMasVendidos] = useState<MasVendidoRow[]>([]);
  const [sectores, setSectores] = useState<SectorPopularRow[]>([]);
  const [compradores, setCompradores] = useState<MayorCompradorRow[]>([]);
  const [equipos, setEquipos] = useState<EquipoPopularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let resolved = 0;
    const TOTAL = 5;
    function done() {
      resolved++;
      if (resolved === TOTAL) setLoading(false);
    }

    function fetchOne<T>(
      key: string,
      fn: () => Promise<T>,
      setter: (v: T) => void,
    ) {
      fn()
        .then((v) => {
          setter(v);
          done();
        })
        .catch((e: Error) => {
          setErrors((prev) => ({ ...prev, [key]: e.message }));
          done();
        });
    }

    fetchOne("menosVendidos", fetchpartidosMenosVendidos, setMenosVendidos);
    fetchOne("masVendidos", fetchPartidosMasVendidos, setMasVendidos);
    fetchOne("sectores", fetchSectoresMasPopulares, setSectores);
    fetchOne("compradores", fetchMayoresCompradores, setCompradores);
    fetchOne("equipos", fetchEquiposPopulares, setEquipos);
  }, []);

  const links = [
    { label: "Partidos", href: "/dashboard_admin/partidos" },
    { label: "Estadios", href: "/dashboard_admin/estadios" },
    { label: "Selecciones", href: "/dashboard_admin/selecciones" },
    { label: "Dispositivos", href: "/dashboard_admin/dispositivos" },
    { label: "Estadisticas", href: "/dashboard_admin/estadisticas" },
  ];

  return (
    <div className="wc-hero min-h-screen p-10">
      <NavbarGeneral links={links} />
      <h1 className="mb-8 mt-6 text-2xl font-bold text-white">Estadísticas</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatBlock
          title="Partidos más vendidos"
          data={masVendidos}
          loading={loading}
          error={errors.masVendidos ?? null}
          renderRow={(item: MasVendidoRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">
                {item.equipo_pais_local} vs {item.equipo_pais_visitante}
              </p>
              <p className="mt-0.5 text-white/50">
                {item.total_entradas_vendidas} entradas
              </p>
            </div>
          )}
        />

        <StatBlock
          title="Partidos menos vendidos"
          data={menosVendidos}
          loading={loading}
          error={errors.menosVendidos ?? null}
          renderRow={(item: MasVendidoRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">
                {item.equipo_pais_local} vs {item.equipo_pais_visitante}
              </p>
              <p className="mt-0.5 text-white/50">
                {item.total_entradas_vendidas} entradas
              </p>
            </div>
          )}
        />

        <StatBlock
          title="Sectores más populares"
          data={sectores}
          loading={loading}
          error={errors.sectores ?? null}
          renderRow={(item: SectorPopularRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">{item.nombre_sector}</p>
              <p className="mt-0.5 text-white/50">
                {item.estadio_nombre} · {item.total_vendidas}/
                {item.capacidad_max}
              </p>
            </div>
          )}
        />

        <StatBlock
          title="Mayores compradores"
          data={compradores}
          loading={loading}
          error={errors.compradores ?? null}
          renderRow={(item: MayorCompradorRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">{item.mail}</p>
              <p className="mt-0.5 text-white/50">
                {item.dir_pais} · {item.cant_compras} compras
              </p>
            </div>
          )}
        />

        <StatBlock
          title="Equipos populares"
          data={equipos}
          loading={loading}
          error={errors.equipos ?? null}
          renderRow={(item: EquipoPopularRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">{item.pais}</p>
              <p className="mt-0.5 text-white/50">
                {item.entradas_vendidas} entradas · {item.partidos_jugados}{" "}
                partidos
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
}

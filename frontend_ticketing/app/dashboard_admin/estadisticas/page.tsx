"use client";

import { useCallback, useEffect, useState } from "react";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import StatBlock from "@/components/StatBlock";
import StatDetailModal from "@/components/StatDetailModal";
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
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

type ModalKey =
  | "masVendidos"
  | "menosVendidos"
  | "sectores"
  | "compradores"
  | "equipos"
  | null;

const f = new Intl.NumberFormat("es-UY");

function sum<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((a, b) => a + fn(b), 0);
}

export default function EstadisticasPage() {
  const [menosVendidos, setMenosVendidos] = useState<MasVendidoRow[]>([]);
  const [masVendidos, setMasVendidos] = useState<MasVendidoRow[]>([]);
  const [sectores, setSectores] = useState<SectorPopularRow[]>([]);
  const [compradores, setCompradores] = useState<MayorCompradorRow[]>([]);
  const [equipos, setEquipos] = useState<EquipoPopularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalKey>(null);

  const closeModal = useCallback(() => setModal(null), []);

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

  return (
    <div className="wc-hero min-h-screen p-10">
      <NavbarGeneral links={ADMIN_NAV_LINKS} />
      <h1 className="mb-8 mt-6 text-2xl font-bold text-white">Estadísticas</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatBlock
          title="Partidos más vendidos"
          data={masVendidos}
          loading={loading}
          error={errors.masVendidos ?? null}
          onViewAll={() => setModal("masVendidos")}
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
          onViewAll={() => setModal("menosVendidos")}
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
          onViewAll={() => setModal("sectores")}
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
          onViewAll={() => setModal("compradores")}
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
          onViewAll={() => setModal("equipos")}
          renderRow={(item: EquipoPopularRow) => (
            <div className="text-xs text-white/80">
              <p className="font-semibold text-white">{item.pais}</p>
              <p className="mt-0.5 text-white/50">
                {item.entradas_vendidas} entradas · {item.partidos_jugados}{" "}
                partidos {Number(item.porcentaje_ventas).toFixed(2)}%
              </p>
            </div>
          )}
        />
      </div>

      {modal === "masVendidos" && (
        <StatDetailModal
          title="Partidos más vendidos"
          data={masVendidos}
          totals={[
            {
              label: "Total entradas",
              value: f.format(
                sum(masVendidos, (i) => i.total_entradas_vendidas),
              ),
            },
            {
              label: "Ingreso total",
              value: `$ ${f.format(sum(masVendidos, (i) => Number(i.ingreso_total)))}`,
            },
            { label: "Partidos", value: f.format(masVendidos.length) },
          ]}
          renderRow={(item: MasVendidoRow) => (
            <div className="flex items-center justify-between text-sm text-white/80">
              <div>
                <p className="font-semibold text-white">
                  {item.equipo_pais_local} vs {item.equipo_pais_visitante}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{item.estadio}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {f.format(item.total_entradas_vendidas)}
                </p>
                <p className="text-xs text-white/40">
                  $ {f.format(Number(item.ingreso_total))}
                </p>
              </div>
            </div>
          )}
          onClose={closeModal}
        />
      )}

      {modal === "menosVendidos" && (
        <StatDetailModal
          title="Partidos menos vendidos"
          data={menosVendidos}
          totals={[
            {
              label: "Total entradas",
              value: f.format(
                sum(menosVendidos, (i) => i.total_entradas_vendidas),
              ),
            },
            {
              label: "Ingreso total",
              value: `$ ${f.format(sum(menosVendidos, (i) => Number(i.ingreso_total)))}`,
            },
            { label: "Partidos", value: f.format(menosVendidos.length) },
          ]}
          renderRow={(item: MasVendidoRow) => (
            <div className="flex items-center justify-between text-sm text-white/80">
              <div>
                <p className="font-semibold text-white">
                  {item.equipo_pais_local} vs {item.equipo_pais_visitante}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{item.estadio}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {f.format(item.total_entradas_vendidas)}
                </p>
                <p className="text-xs text-white/40">
                  $ {f.format(Number(item.ingreso_total))}
                </p>
              </div>
            </div>
          )}
          onClose={closeModal}
        />
      )}

      {modal === "sectores" && (
        <StatDetailModal
          title="Sectores más populares"
          data={sectores}
          totals={[
            {
              label: "Total vendidas",
              value: f.format(sum(sectores, (i) => i.total_vendidas)),
            },
            {
              label: "Capacidad total",
              value: f.format(sum(sectores, (i) => i.capacidad_max)),
            },
            { label: "Sectores", value: f.format(sectores.length) },
          ]}
          renderRow={(item: SectorPopularRow) => (
            <div className="flex items-center justify-between text-sm text-white/80">
              <div>
                <p className="font-semibold text-white">{item.nombre_sector}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  {item.estadio_nombre}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {f.format(item.total_vendidas)} /{" "}
                  {f.format(item.capacidad_max)}
                </p>
              </div>
            </div>
          )}
          onClose={closeModal}
        />
      )}

      {modal === "compradores" && (
        <StatDetailModal
          title="Mayores compradores"
          data={compradores}
          totals={[
            {
              label: "Total compras",
              value: f.format(sum(compradores, (i) => i.cant_compras)),
            },
            { label: "Compradores", value: f.format(compradores.length) },
          ]}
          renderRow={(item: MayorCompradorRow) => (
            <div className="flex items-center justify-between text-sm text-white/80">
              <div>
                <p className="font-semibold text-white">{item.mail}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  {item.dir_pais} · {item.dir_localidad}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {f.format(item.cant_compras)} compras
                </p>
              </div>
            </div>
          )}
          onClose={closeModal}
        />
      )}

      {modal === "equipos" && (
        <StatDetailModal
          title="Equipos populares"
          data={equipos}
          totals={[
            {
              label: "Total entradas",
              value: f.format(sum(equipos, (i) => i.entradas_vendidas)),
            },
            {
              label: "Capacidad total",
              value: f.format(sum(equipos, (i) => i.capacidad_total)),
            },
            { label: "Equipos", value: f.format(equipos.length) },
          ]}
          renderRow={(item: EquipoPopularRow) => (
            <div className="flex items-center justify-between text-sm text-white/80">
              <div>
                <p className="font-semibold text-white">{item.pais}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  {item.partidos_jugados} partidos
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {f.format(item.entradas_vendidas)}
                </p>
                <p className="text-xs text-white/40">
                  {Number(item.porcentaje_ventas).toFixed(2)}%
                </p>
              </div>
            </div>
          )}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

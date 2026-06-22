"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import {
  getAsignaciones,
  crearAsignacion,
  eliminarAsignacion,
  getFuncionariosDispositivo,
  getPartidos,
  getPartido,
  getSectoresPartido,
  type Asignacion,
  type CrearAsignacionInput,
  type FuncionarioDispositivo,
  type Partido,
  type SectorPartido,
} from "@/lib/api";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioDispositivo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectores, setSectores] = useState<SectorPartido[]>([]);

  const [funId, setFunId] = useState("");
  const [partidoId, setPartidoId] = useState("");
  const [sectorNombre, setSectorNombre] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sectoresLoading, setSectoresLoading] = useState(false);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  async function cargar() {
    try {
      setError(null);
      setLoading(true);
      const [asigs, funcs, parts] = await Promise.all([
        getAsignaciones(),
        getFuncionariosDispositivo(),
        getPartidos(),
      ]);
      setAsignaciones(asigs);
      setFuncionarios(funcs);
      setPartidos(parts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  // Cargar sectores al seleccionar partido
  useEffect(() => {
    if (!partidoId) {
      setSectores([]);
      setSectorNombre("");
      return;
    }
    setSectoresLoading(true);
    setSectorNombre("");
    getSectoresPartido(Number(partidoId))
      .then(setSectores)
      .catch(() => setSectores([]))
      .finally(() => setSectoresLoading(false));
  }, [partidoId]);

  const partidosConSectores = useMemo(
    () => partidos.filter((p) => p.activo),
    [partidos],
  );

  const sectoresDisponibles = useMemo(() => {
    const alreadyAssigned = asignaciones
      .filter((a) => a.sectorpartido_id_evento === Number(partidoId))
      .map((a) => a.sectorpartido_nombre_sector);
    return sectores.filter(
      (s) => !alreadyAssigned.includes(s.sector_nombre_sector),
    );
  }, [sectores, asignaciones, partidoId]);

  function limpiarFormulario() {
    setFunId("");
    setPartidoId("");
    setSectorNombre("");
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!funId || !partidoId || !sectorNombre) {
      setError("Completá todos los campos.");
      return;
    }

    const partido = partidos.find((p) => p.id === Number(partidoId));
    const sector = sectores.find(
      (s) => s.sector_nombre_sector === sectorNombre,
    );
    if (!partido || !sector) {
      setError("Datos inválidos.");
      return;
    }

    const input: CrearAsignacionInput = {
      fun_id_usuario: Number(funId),
      sectorpartido_nombre_sector: sectorNombre,
      sectorpartido_id_estadio: sector.sector_id_estadio,
      sectorpartido_id_evento: Number(partidoId),
    };

    try {
      setSaving(true);
      setError(null);
      await crearAsignacion(input);
      flashSuccess("Asignación creada correctamente.");
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la asignación.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function borrar(a: Asignacion) {
    const ok = window.confirm(
      `¿Eliminar la asignación del funcionario ${a.funcionario_mail} al sector ${a.sectorpartido_nombre_sector}?`,
    );
    if (!ok) return;
    try {
      setError(null);
      await eliminarAsignacion(a.id_asignacion);
      flashSuccess("Asignación eliminada.");
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la asignación.",
      );
    }
  }

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral links={ADMIN_NAV_LINKS} />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Asignación de funcionarios
            </h1>
            <p className="mt-2 max-w-xl text-white/70">
              Asigná funcionarios de validación a sectores de cada partido para
              garantizar la cobertura operativa de los eventos.
            </p>
          </section>

          {success && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Asignaciones activas</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {asignaciones.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Funcionarios con dispositivo</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {funcionarios.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Partidos activos</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {partidosConSectores.length}
              </p>
            </div>
          </section>

          {/* Formulario */}
          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white">
              Nueva asignación
            </h2>

            <form
              onSubmit={(e) => void guardar(e)}
              className="mt-4 grid gap-4 md:grid-cols-4"
            >
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Funcionario
                </span>
                <select
                  required
                  value={funId}
                  onChange={(e) => setFunId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="" className="text-black">
                    Elegir…
                  </option>
                  {funcionarios.map((f) => (
                    <option key={f.id_usuario} value={f.id_usuario} className="text-black">
                      Legajo {f.numero_legajo} — {f.mail}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Partido
                </span>
                <select
                  required
                  value={partidoId}
                  onChange={(e) => setPartidoId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="" className="text-black">
                    Elegir…
                  </option>
                  {partidosConSectores.map((p) => (
                    <option key={p.id} value={p.id} className="text-black">
                      {p.equipo_pais_local} vs {p.equipo_pais_visitante}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Sector
                </span>
                <select
                  required
                  value={sectorNombre}
                  disabled={!partidoId || sectoresLoading}
                  onChange={(e) => setSectorNombre(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" className="text-black">
                    {sectoresLoading
                      ? "Cargando…"
                      : !partidoId
                        ? "Primero elegí un partido"
                        : sectoresDisponibles.length === 0
                          ? "Sin sectores disponibles"
                          : "Elegir…"}
                  </option>
                  {sectoresDisponibles.map((s) => (
                    <option
                      key={`${s.sector_id_estadio}-${s.sector_nombre_sector}`}
                      value={s.sector_nombre_sector}
                      className="text-black"
                    >
                      {s.sector_nombre_sector} — ${s.costo_entrada}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={saving || !funId || !partidoId || !sectorNombre}
                  className="w-full rounded-full bg-gold px-5 py-2 font-semibold text-night transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Asignando…" : "Asignar"}
                </button>
              </div>
            </form>
          </section>

          {/* Tabla */}
          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Asignaciones registradas
                </h2>
                <p className="text-sm text-white/60">
                  {asignaciones.length} asignación
                  {asignaciones.length === 1 ? "" : "es"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cargar()}
                className="rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                Actualizar
              </button>
            </div>

            {loading && <p className="text-white/70">Cargando asignaciones…</p>}

            {!loading && asignaciones.length === 0 && !error && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <span className="text-4xl">📋</span>
                <p className="text-white/60">
                  Todavía no hay asignaciones registradas.
                </p>
              </div>
            )}

            {!loading && asignaciones.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Funcionario</th>
                      <th className="py-3 pr-4">Partido</th>
                      <th className="py-3 pr-4">Sector</th>
                      <th className="py-3 pr-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map((a) => (
                      <tr
                        key={a.id_asignacion}
                        className="border-b border-white/5 text-white transition-colors hover:bg-white/5"
                      >
                        <td className="py-3 pr-4 font-mono text-white/80">
                          #{a.id_asignacion}
                        </td>
                        <td className="py-3 pr-4">
                          <div>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                              Legajo {a.funcionario_legajo}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/50">
                            {a.funcionario_mail}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          Partido #{a.sectorpartido_id_evento}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs">
                            {a.sectorpartido_nombre_sector}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void borrar(a)}
                              className="rounded-full border border-red-300/60 px-3 py-1 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/10"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </RequireRole>
  );
}

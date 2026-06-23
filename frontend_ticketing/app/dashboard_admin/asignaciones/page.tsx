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
  registrarFuncionario,
  type Asignacion,
  type CrearAsignacionInput,
  type FuncionarioDispositivo,
  type Partido,
  type SectorPartido,
} from "@/lib/api";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

const inputFunClass =
  "rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-gold/60";

type FormFuncionario = {
  doc_pais: string;
  doc_tipo: string;
  doc_numero: string;
  numero_legajo: string;
  mail: string;
  contrasena: string;
  dir_pais: string;
  dir_localidad: string;
  dir_calle: string;
  dir_numero: string;
  dir_codigo_postal: string;
  telefonos: string;
};

const initialFuncForm: FormFuncionario = {
  doc_pais: "",
  doc_tipo: "CI",
  doc_numero: "",
  numero_legajo: "",
  mail: "",
  contrasena: "",
  dir_pais: "",
  dir_localidad: "",
  dir_calle: "",
  dir_numero: "",
  dir_codigo_postal: "",
  telefonos: "",
};

function CampoFun({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
        {label}
      </span>
      {children}
      {hint && <span className="text-[0.7rem] text-white/40">{hint}</span>}
    </label>
  );
}

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

  // Registro de funcionario
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [funForm, setFunForm] = useState<FormFuncionario>(initialFuncForm);
  const [registrando, setRegistrando] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  function setFun(field: keyof FormFuncionario, value: string) {
    setFunForm((f) => ({ ...f, [field]: value }));
  }

  async function registrarFun(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegError(null);
    if (!funForm.numero_legajo || Number(funForm.numero_legajo) < 1) {
      setRegError("Ingresá un número de legajo válido.");
      return;
    }
    try {
      setRegistrando(true);
      await registrarFuncionario({
        doc_pais: funForm.doc_pais.trim(),
        doc_tipo: funForm.doc_tipo.trim(),
        doc_numero: funForm.doc_numero.trim(),
        numero_legajo: Number(funForm.numero_legajo),
        mail: funForm.mail.trim(),
        contrasena: funForm.contrasena,
        dir_pais: funForm.dir_pais.trim(),
        dir_localidad: funForm.dir_localidad.trim(),
        dir_calle: funForm.dir_calle.trim(),
        dir_numero: Number(funForm.dir_numero),
        dir_codigo_postal: funForm.dir_codigo_postal.trim(),
        telefonos: funForm.telefonos.trim()
          ? funForm.telefonos.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      });
      flashSuccess(
        `Funcionario registrado (legajo ${funForm.numero_legajo}). Ya podés asignarlo a un sector.`,
      );
      setFunForm(initialFuncForm);
      setMostrarRegistro(false);
      await cargar();
    } catch (err) {
      setRegError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el funcionario.",
      );
    } finally {
      setRegistrando(false);
    }
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

  const asignacionesActivas = useMemo(
    () => asignaciones.filter((a) => a.sectorpartido_nombre_sector !== null),
    [asignaciones],
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
      funcionario_id_usuario: Number(funId),
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
    if (
      a.sectorpartido_nombre_sector === null ||
      a.sectorpartido_id_estadio === null ||
      a.sectorpartido_id_evento === null
    ) {
      return;
    }
    const ok = window.confirm(
      `¿Eliminar la asignación del funcionario ${a.mail} al sector ${a.sectorpartido_nombre_sector}?`,
    );
    if (!ok) return;
    try {
      setError(null);
      await eliminarAsignacion({
        funcionario_id_usuario: a.funcionario_id_usuario,
        sectorpartido_nombre_sector: a.sectorpartido_nombre_sector,
        sectorpartido_id_estadio: a.sectorpartido_id_estadio,
        sectorpartido_id_evento: a.sectorpartido_id_evento,
      });
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
                {asignacionesActivas.length}
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

          {/* Registro de funcionario */}
          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Funcionarios de validación
                </h2>
                <p className="text-sm text-white/60">
                  Registrá un nuevo funcionario para poder asignarlo a sectores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMostrarRegistro((v) => !v);
                  setRegError(null);
                }}
                className="rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                {mostrarRegistro ? "Cerrar" : "+ Registrar funcionario"}
              </button>
            </div>

            {mostrarRegistro && (
              <form onSubmit={registrarFun} className="mt-5 flex flex-col gap-5">
                {regError && (
                  <div className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200">
                    {regError}
                  </div>
                )}

                {/* Documento + legajo */}
                <fieldset className="grid gap-3 md:grid-cols-4">
                  <CampoFun label="País del documento">
                    <input className={inputFunClass} required value={funForm.doc_pais} onChange={(e) => setFun("doc_pais", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="Tipo">
                    <input className={inputFunClass} required value={funForm.doc_tipo} onChange={(e) => setFun("doc_tipo", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="Número de documento">
                    <input className={inputFunClass} required value={funForm.doc_numero} onChange={(e) => setFun("doc_numero", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="N.º de legajo">
                    <input className={inputFunClass} type="number" min="1" required value={funForm.numero_legajo} onChange={(e) => setFun("numero_legajo", e.target.value)} />
                  </CampoFun>
                </fieldset>

                {/* Credenciales */}
                <fieldset className="grid gap-3 md:grid-cols-2">
                  <CampoFun label="Mail">
                    <input className={inputFunClass} type="email" required value={funForm.mail} onChange={(e) => setFun("mail", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="Contraseña" hint="Mín. 8, con mayúscula, minúscula y número.">
                    <input className={inputFunClass} type="password" required value={funForm.contrasena} onChange={(e) => setFun("contrasena", e.target.value)} />
                  </CampoFun>
                </fieldset>

                {/* Dirección */}
                <fieldset className="grid gap-3 md:grid-cols-2">
                  <CampoFun label="País">
                    <input className={inputFunClass} required value={funForm.dir_pais} onChange={(e) => setFun("dir_pais", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="Localidad">
                    <input className={inputFunClass} required value={funForm.dir_localidad} onChange={(e) => setFun("dir_localidad", e.target.value)} />
                  </CampoFun>
                  <CampoFun label="Calle">
                    <input className={inputFunClass} required value={funForm.dir_calle} onChange={(e) => setFun("dir_calle", e.target.value)} />
                  </CampoFun>
                  <div className="grid grid-cols-2 gap-3">
                    <CampoFun label="Número">
                      <input className={inputFunClass} type="number" required value={funForm.dir_numero} onChange={(e) => setFun("dir_numero", e.target.value)} />
                    </CampoFun>
                    <CampoFun label="Código postal">
                      <input className={inputFunClass} required value={funForm.dir_codigo_postal} onChange={(e) => setFun("dir_codigo_postal", e.target.value)} />
                    </CampoFun>
                  </div>
                </fieldset>

                <CampoFun label="Teléfonos (opcional, separados por coma)">
                  <input className={inputFunClass} placeholder="099123456, 29001234" value={funForm.telefonos} onChange={(e) => setFun("telefonos", e.target.value)} />
                </CampoFun>

                <div>
                  <button
                    type="submit"
                    disabled={registrando}
                    className="rounded-full bg-gold px-6 py-2.5 font-semibold text-night transition-opacity disabled:opacity-50"
                  >
                    {registrando ? "Registrando…" : "Registrar funcionario"}
                  </button>
                </div>
              </form>
            )}
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
                  {asignacionesActivas.length} asignación
                  {asignacionesActivas.length === 1 ? "" : "es"}.
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

            {!loading && asignacionesActivas.length === 0 && !error && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <span className="text-4xl">📋</span>
                <p className="text-white/60">
                  Todavía no hay asignaciones registradas.
                </p>
              </div>
            )}

            {!loading && asignacionesActivas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">Funcionario</th>
                      <th className="py-3 pr-4">Partido</th>
                      <th className="py-3 pr-4">Sector</th>
                      <th className="py-3 pr-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignacionesActivas.map((a) => (
                      <tr
                        key={`${a.funcionario_id_usuario}-${a.sectorpartido_id_estadio}-${a.sectorpartido_nombre_sector}-${a.sectorpartido_id_evento}`}
                        className="border-b border-white/5 text-white transition-colors hover:bg-white/5"
                      >
                        <td className="py-3 pr-4">
                          <div>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                              Legajo {a.numero_legajo}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/50">
                            {a.mail}
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

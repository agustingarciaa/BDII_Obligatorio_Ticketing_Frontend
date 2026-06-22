"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import {
  getDispositivos,
  getFuncionariosDispositivo,
  crearDispositivo,
  editarDispositivo,
  eliminarDispositivo,
  type Dispositivo,
  type FuncionarioDispositivo,
} from "@/lib/api";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";

export default function DispositivosPage() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioDispositivo[]>([]);

  const [funId, setFunId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  async function cargar() {
    try {
      setError(null);
      setLoading(true);
      const [disp, funcs] = await Promise.all([
        getDispositivos(),
        getFuncionariosDispositivo(),
      ]);
      setDispositivos(disp);
      setFuncionarios(funcs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los dispositivos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  // Funcionarios disponibles (sin dispositivo). En edición se suma el actual del dispositivo.
  const funcionariosDisponibles = useMemo(() => {
    const actual = editingId
      ? dispositivos.find((d) => d.id_dispositivo === editingId)?.fun_id_usuario
      : undefined;
    return funcionarios.filter(
      (f) => !f.tiene_dispositivo || f.id_usuario === actual,
    );
  }, [funcionarios, editingId, dispositivos]);

  const sinDispositivo = useMemo(
    () => funcionarios.filter((f) => !f.tiene_dispositivo).length,
    [funcionarios],
  );

  const dispositivoEnEdicion = useMemo(
    () => dispositivos.find((d) => d.id_dispositivo === editingId) ?? null,
    [dispositivos, editingId],
  );

  function limpiarFormulario() {
    setFunId("");
    setEditingId(null);
  }

  function editarFila(d: Dispositivo) {
    setEditingId(d.id_dispositivo);
    setFunId(String(d.fun_id_usuario));
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!funId) {
      setError("Elegí un funcionario.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (editingId === null) {
        await crearDispositivo(Number(funId));
        flashSuccess("Dispositivo registrado correctamente.");
      } else {
        await editarDispositivo(editingId, Number(funId));
        flashSuccess("Dispositivo actualizado correctamente.");
      }
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el dispositivo.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function borrar(d: Dispositivo) {
    const ok = window.confirm(
      `¿Eliminar el dispositivo ${d.id_dispositivo} (funcionario legajo ${d.funcionario.numero_legajo})?`,
    );
    if (!ok) return;
    try {
      setError(null);
      if (editingId === d.id_dispositivo) limpiarFormulario();
      await eliminarDispositivo(d.id_dispositivo);
      flashSuccess("Dispositivo eliminado.");
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el dispositivo.",
      );
    }
  }

  const sinFuncionariosLibres =
    editingId === null && funcionariosDisponibles.length === 0;

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral links={ADMIN_NAV_LINKS} />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Gestión de dispositivos
            </h1>
            <p className="mt-2 max-w-xl text-white/70">
              Administrá los dispositivos autorizados para validar entradas,
              vinculados a un funcionario de validación.
            </p>
          </section>

          {/* Banners globales */}
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

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Dispositivos activos</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {dispositivos.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Funcionarios sin dispositivo</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {sinDispositivo}
              </p>
            </div>
          </section>

          {/* Formulario crear / editar */}
          <section
            ref={formRef}
            className={`rounded-2xl border bg-white/10 p-6 backdrop-blur transition-colors ${
              editingId !== null
                ? "border-gold/60 ring-1 ring-gold/40"
                : "border-white/10"
            }`}
          >
            <h2 className="text-xl font-bold text-white">
              {editingId === null
                ? "Registrar dispositivo"
                : `Editar dispositivo #${editingId}`}
            </h2>
            {dispositivoEnEdicion && (
              <p className="mt-1 text-sm text-white/60">
                Actualmente vinculado a legajo{" "}
                {dispositivoEnEdicion.funcionario.numero_legajo} ·{" "}
                {dispositivoEnEdicion.funcionario.mail}
              </p>
            )}

            <form
              onSubmit={(e) => void guardar(e)}
              className="mt-4 flex flex-col gap-4 md:flex-row md:items-center"
            >
              <label className="flex-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Funcionario de validación
                </span>
                <select
                  required
                  value={funId}
                  disabled={sinFuncionariosLibres}
                  onChange={(e) => setFunId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" className="text-black">
                    Elegir funcionario…
                  </option>
                  {funcionariosDisponibles.map((f) => (
                    <option
                      key={f.id_usuario}
                      value={f.id_usuario}
                      className="text-black"
                    >
                      Legajo {f.numero_legajo} — {f.mail}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-3 md:pt-5">
                <button
                  type="submit"
                  disabled={saving || !funId || sinFuncionariosLibres}
                  className="rounded-full bg-gold px-5 py-2 font-semibold text-night transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Guardando…"
                    : editingId === null
                      ? "Registrar"
                      : "Guardar cambios"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="rounded-full border border-white/20 px-5 py-2 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {sinFuncionariosLibres && (
              <p className="mt-3 text-sm text-white/60">
                No hay funcionarios libres: todos los funcionarios activos ya
                tienen un dispositivo asignado.
              </p>
            )}
          </section>

          {/* Tabla */}
          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Dispositivos registrados
                </h2>
                <p className="text-sm text-white/60">
                  {dispositivos.length} dispositivo
                  {dispositivos.length === 1 ? "" : "s"} autorizado
                  {dispositivos.length === 1 ? "" : "s"}.
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

            {loading && <p className="text-white/70">Cargando dispositivos…</p>}

            {!loading && dispositivos.length === 0 && !error && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <span className="text-4xl">📟</span>
                <p className="text-white/60">
                  Todavía no hay dispositivos registrados.
                </p>
              </div>
            )}

            {!loading && dispositivos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Legajo</th>
                      <th className="py-3 pr-4">Funcionario (mail)</th>
                      <th className="py-3 pr-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispositivos.map((d) => (
                      <tr
                        key={d.id_dispositivo}
                        className={`border-b border-white/5 text-white transition-colors ${
                          editingId === d.id_dispositivo
                            ? "bg-gold/10"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3 pr-4 font-mono text-white/80">
                          #{d.id_dispositivo}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                            {d.funcionario.numero_legajo}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{d.funcionario.mail}</td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => editarFila(d)}
                              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void borrar(d)}
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

'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import NavbarGeneral from '../../../components/navbars/NavbarGeneral';
import {
  crearEstadio,
  editarEstadio,
  eliminarEstadio,
  getEstadios,
  getSectores,
  crearSector,
  editarSector,
  eliminarSector,
  type Estadio,
  type Sector,
} from '../../../lib/api';
import { ADMIN_NAV_LINKS } from '../../../lib/nav-links';

export default function EstadiosPage() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  // Gestión de sectores por estadio
  const [sectoresEstadioId, setSectoresEstadioId] = useState<number | null>(null);
  const [nuevoSectorNombre, setNuevoSectorNombre] = useState('');
  const [nuevoSectorCap, setNuevoSectorCap] = useState('');
  const [sectorError, setSectorError] = useState('');

  // Edición inline de un sector existente
  const [editSectorKey, setEditSectorKey] = useState<string | null>(null); // `${id_estadio}-${nombre_actual}`
  const [editSectorNombre, setEditSectorNombre] = useState('');
  const [editSectorCap, setEditSectorCap] = useState('');

  async function cargarDatos() {
    try {
      setError('');
      const [est, sec] = await Promise.all([getEstadios(), getSectores()]);
      setEstadios(est);
      setSectores(sec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadios.');
    }
  }

  useEffect(() => {
    void cargarDatos();
  }, []);

  async function guardar() {
    try {
      setError('');
      setMensaje('');

      if (!nombre.trim() || !pais.trim() || !ciudad.trim()) {
        setError('Completá nombre, país y ciudad.');
        return;
      }

      if (editandoId) {
        await editarEstadio(editandoId, { nombre, pais, ciudad });
        setMensaje('Estadio actualizado correctamente.');
      } else {
        await crearEstadio({ nombre, pais, ciudad });
        setMensaje('Estadio creado correctamente.');
      }

      setNombre('');
      setPais('');
      setCiudad('');
      setEditandoId(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar estadio.');
    }
  }

  function cargarParaEditar(estadio: Estadio) {
    setEditandoId(estadio.id_estadio);
    setNombre(estadio.nombre);
    setPais(estadio.pais);
    setCiudad(estadio.ciudad);
    setMensaje('');
    setError('');
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function eliminar(id: number) {
    if (!window.confirm(`¿Eliminar el estadio ${id}?`)) return;
    try {
      setError('');
      setMensaje('');
      await eliminarEstadio(id);
      setMensaje('Estadio eliminado correctamente.');
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estadio.');
    }
  }

  // ── Sectores ──────────────────────────────────────────────────────────────

  function abrirSectores(id: number) {
    setSectoresEstadioId((prev) => (prev === id ? null : id));
    setNuevoSectorNombre('');
    setNuevoSectorCap('');
    setSectorError('');
  }

  async function agregarSector(idEstadio: number) {
    setSectorError('');
    if (!nuevoSectorNombre.trim()) {
      setSectorError('Ingresá el nombre del sector (ej: A, B, Tribuna Norte).');
      return;
    }
    const cap = Number(nuevoSectorCap);
    if (!cap || cap < 1) {
      setSectorError('La capacidad debe ser un número mayor a 0.');
      return;
    }
    try {
      await crearSector({
        nombre_sector: nuevoSectorNombre.trim(),
        id_estadio: idEstadio,
        capacidad_max: cap,
      });
      setNuevoSectorNombre('');
      setNuevoSectorCap('');
      await cargarDatos();
    } catch (err) {
      setSectorError(
        err instanceof Error ? err.message : 'No se pudo crear el sector.',
      );
    }
  }

  async function quitarSector(idEstadio: number, nombreSector: string) {
    if (!window.confirm(`¿Eliminar el sector "${nombreSector}"?`)) return;
    setSectorError('');
    try {
      await eliminarSector(idEstadio, nombreSector);
      await cargarDatos();
    } catch (err) {
      setSectorError(
        err instanceof Error ? err.message : 'No se pudo eliminar el sector.',
      );
    }
  }

  function iniciarEditarSector(s: Sector) {
    setEditSectorKey(`${s.id_estadio}-${s.nombre_sector}`);
    setEditSectorNombre(s.nombre_sector);
    setEditSectorCap(String(s.capacidad_max));
    setSectorError('');
  }

  function cancelarEditarSector() {
    setEditSectorKey(null);
    setEditSectorNombre('');
    setEditSectorCap('');
  }

  async function guardarEditarSector(idEstadio: number, nombreActual: string) {
    setSectorError('');
    if (!editSectorNombre.trim()) {
      setSectorError('El nombre del sector no puede quedar vacío.');
      return;
    }
    const cap = Number(editSectorCap);
    if (!cap || cap < 1) {
      setSectorError('La capacidad debe ser un número mayor a 0.');
      return;
    }
    try {
      await editarSector(idEstadio, {
        nombre_sector_actual: nombreActual,
        nombre_sector: editSectorNombre.trim(),
        capacidad_max: cap,
      });
      cancelarEditarSector();
      await cargarDatos();
    } catch (err) {
      setSectorError(
        err instanceof Error ? err.message : 'No se pudo modificar el sector.',
      );
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
      <NavbarGeneral links={ADMIN_NAV_LINKS} />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold">Gestión de estadios</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-200">
          ABM de estadios del sistema: crear, editar, eliminar, y administrar los
          sectores físicos de cada estadio.
        </p>

        <section
          ref={formRef}
          className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur"
        >
          <h2 className="mb-5 text-2xl font-semibold">
            {editandoId ? 'Editar estadio' : 'Crear estadio'}
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              className="rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-black outline-none placeholder:text-gray-500"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-black outline-none placeholder:text-gray-500"
              placeholder="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-black outline-none placeholder:text-gray-500"
              placeholder="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            />

            <button
              type="button"
              onClick={guardar}
              className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              {editandoId ? 'Guardar cambios' : 'Crear estadio'}
            </button>
          </div>

          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setNombre('');
                setPais('');
                setCiudad('');
              }}
              className="mt-4 rounded-xl bg-white/20 px-5 py-2 font-semibold text-white transition hover:bg-white/30"
            >
              Cancelar edición
            </button>
          )}

          {mensaje && <p className="mt-4 text-green-300">{mensaje}</p>}
          {error && <p className="mt-4 text-red-300">{error}</p>}
        </section>

        <section className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur">
          <h2 className="mb-5 text-2xl font-semibold">Estadios cargados</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/30 text-sm text-gray-200">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Ciudad</th>
                  <th className="px-4 py-3">Sectores</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {estadios.map((estadio) => {
                  const sectoresEstadio = sectores.filter(
                    (s) => s.id_estadio === estadio.id_estadio,
                  );
                  const abierto = sectoresEstadioId === estadio.id_estadio;

                  return (
                    <Fragment key={estadio.id_estadio}>
                      <tr className="border-b border-white/10">
                        <td className="px-4 py-4">{estadio.id_estadio}</td>
                        <td className="px-4 py-4 font-semibold">
                          {estadio.nombre}
                        </td>
                        <td className="px-4 py-4">{estadio.pais}</td>
                        <td className="px-4 py-4">{estadio.ciudad}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => abrirSectores(estadio.id_estadio)}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
                          >
                            {sectoresEstadio.length} sector
                            {sectoresEstadio.length === 1 ? '' : 'es'}{' '}
                            {abierto ? '▲' : '▼'}
                          </button>
                        </td>
                        <td className="space-x-2 px-4 py-4">
                          <button
                            type="button"
                            onClick={() => cargarParaEditar(estadio)}
                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminar(estadio.id_estadio)}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>

                      {abierto && (
                        <tr className="border-b border-white/10 bg-black/20">
                          <td colSpan={6} className="px-4 py-5">
                            <h3 className="mb-3 font-semibold">
                              Sectores de {estadio.nombre}
                            </h3>

                            {/* Form agregar sector */}
                            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                              <input
                                className="rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-black outline-none placeholder:text-gray-500"
                                placeholder="Nombre del sector (A, B, Tribuna…)"
                                value={nuevoSectorNombre}
                                onChange={(e) =>
                                  setNuevoSectorNombre(e.target.value)
                                }
                              />
                              <input
                                type="number"
                                min="1"
                                className="rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-black outline-none placeholder:text-gray-500"
                                placeholder="Capacidad máxima"
                                value={nuevoSectorCap}
                                onChange={(e) =>
                                  setNuevoSectorCap(e.target.value)
                                }
                              />
                              <button
                                type="button"
                                onClick={() => agregarSector(estadio.id_estadio)}
                                className="rounded-xl bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300"
                              >
                                Agregar sector
                              </button>
                            </div>

                            {sectorError && (
                              <p className="mb-3 text-sm text-red-300">
                                {sectorError}
                              </p>
                            )}

                            {/* Lista de sectores */}
                            {sectoresEstadio.length === 0 ? (
                              <p className="text-sm text-gray-300">
                                Este estadio todavía no tiene sectores físicos.
                              </p>
                            ) : (
                              <ul className="flex flex-wrap gap-2">
                                {sectoresEstadio.map((s) => {
                                  const enEdicion =
                                    editSectorKey ===
                                    `${s.id_estadio}-${s.nombre_sector}`;
                                  return (
                                    <li
                                      key={s.nombre_sector}
                                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                                    >
                                      {enEdicion ? (
                                        <>
                                          <input
                                            className="w-28 rounded-lg border border-white/30 bg-white/80 px-2 py-1 text-sm text-black outline-none"
                                            value={editSectorNombre}
                                            placeholder="Nombre"
                                            onChange={(e) =>
                                              setEditSectorNombre(e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            min="1"
                                            className="w-24 rounded-lg border border-white/30 bg-white/80 px-2 py-1 text-sm text-black outline-none"
                                            value={editSectorCap}
                                            placeholder="Cap."
                                            onChange={(e) =>
                                              setEditSectorCap(e.target.value)
                                            }
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              guardarEditarSector(
                                                estadio.id_estadio,
                                                s.nombre_sector,
                                              )
                                            }
                                            className="rounded-lg bg-yellow-400 px-2 py-1 text-xs font-bold text-black transition hover:bg-yellow-300"
                                            title="Guardar"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            type="button"
                                            onClick={cancelarEditarSector}
                                            className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold text-white transition hover:bg-white/30"
                                            title="Cancelar"
                                          >
                                            ✕
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-semibold">
                                            {s.nombre_sector}
                                          </span>
                                          <span className="text-sm text-gray-300">
                                            cap.{' '}
                                            {s.capacidad_max.toLocaleString('es-UY')}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => iniciarEditarSector(s)}
                                            className="rounded-lg bg-blue-500 px-2 py-1 text-xs font-bold text-white transition hover:bg-blue-400"
                                            title="Editar sector"
                                          >
                                            ✎
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              quitarSector(
                                                estadio.id_estadio,
                                                s.nombre_sector,
                                              )
                                            }
                                            className="rounded-lg bg-red-500/80 px-2 py-1 text-xs font-bold text-white transition hover:bg-red-400"
                                            title="Eliminar sector"
                                          >
                                            ✕
                                          </button>
                                        </>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {estadios.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-300" colSpan={6}>
                      No hay estadios cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

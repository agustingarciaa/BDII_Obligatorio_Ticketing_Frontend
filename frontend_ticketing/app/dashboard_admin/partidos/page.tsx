'use client';

import { useEffect, useMemo, useState } from 'react';
import RequireRole from '@/components/RequireRole';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import {
  crearPartido,
  editarPartido,
  eliminarPartido,
  getPartidos,
  type CreatePartidoInput,
  type Partido,
} from '@/lib/api';

type FormPartido = {
  id_estadio: string;
  equipo_pais_local: string;
  equipo_pais_visitante: string;
  fecha_hora: string;
};

const initialForm: FormPartido = {
  id_estadio: '',
  equipo_pais_local: '',
  equipo_pais_visitante: '',
  fecha_hora: '',
};

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
}

export default function PartidosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [form, setForm] = useState<FormPartido>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarPartidos() {
    try {
      setError(null);
      setLoading(true);
      const data = await getPartidos();
      setPartidos(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los partidos.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarPartidos();
  }, []);

  const totalPartidos = partidos.length;

  const proximosPartidos = useMemo(() => {
    const ahora = new Date();

    return partidos.filter((partido) => {
      return new Date(partido.fecha_hora) >= ahora;
    }).length;
  }, [partidos]);

  const estadiosUsados = useMemo(() => {
    return new Set(partidos.map((partido) => partido.id_estadio)).size;
  }, [partidos]);

  const minFechaHora = new Date().toISOString().slice(0, 16);

  function limpiarFormulario() {
    setForm(initialForm);
    setEditingId(null);
  }

  function editarFila(partido: Partido) {
    setEditingId(partido.id);
    setForm({
      id_estadio: String(partido.id_estadio),
      equipo_pais_local: partido.equipo_pais_local,
      equipo_pais_visitante: partido.equipo_pais_visitante,
      fecha_hora: toDatetimeLocal(partido.fecha_hora),
    });
  }

  async function guardarPartido(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (new Date(form.fecha_hora) < new Date()) {
      setError('La fecha del partido no puede ser anterior a la fecha actual.');
      return;
    }

    const input: CreatePartidoInput = {
      id_estadio: Number(form.id_estadio),
      equipo_pais_local: form.equipo_pais_local.trim(),
      equipo_pais_visitante: form.equipo_pais_visitante.trim(),
      fecha_hora: form.fecha_hora,
    };

    try {
      setSaving(true);
      setError(null);

      if (editingId === null) {
        await crearPartido(input);
      } else {
        await editarPartido(editingId, input);
      }

      limpiarFormulario();
      await cargarPartidos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar el partido.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function borrarPartido(id: number) {
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar el partido ${id}?`,
    );

    if (!confirmado) return;

    try {
      setError(null);
      await eliminarPartido(id);
      await cargarPartidos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el partido.',
      );
    }
  }

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral rol="Administrador por sede" />

        <main className="flex flex-1 flex-col gap-8 p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Gestión de partidos
            </h1>

            <p className="mt-2 max-w-xl text-white/70">
              Administrá los partidos del Mundial 2026: crear, editar, eliminar
              y consultar partidos cargados en el sistema.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Partidos activos</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {totalPartidos}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Próximos partidos</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {proximosPartidos}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Estadios usados</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {estadiosUsados}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white">
              {editingId === null
                ? 'Crear partido'
                : `Editar partido ${editingId}`}
            </h2>

            <form
              onSubmit={(e) => void guardarPartido(e)}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <input
                type="number"
                required
                placeholder="ID estadio"
                value={form.id_estadio}
                onChange={(e) =>
                  setForm({ ...form, id_estadio: e.target.value })
                }
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
              />

              <input
                type="text"
                required
                placeholder="Equipo local"
                value={form.equipo_pais_local}
                onChange={(e) =>
                  setForm({ ...form, equipo_pais_local: e.target.value })
                }
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
              />

              <input
                type="text"
                required
                placeholder="Equipo visitante"
                value={form.equipo_pais_visitante}
                onChange={(e) =>
                  setForm({ ...form, equipo_pais_visitante: e.target.value })
                }
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
              />

              <input
                type="datetime-local"
                required
                min={minFechaHora}
                value={form.fecha_hora}
                onChange={(e) =>
                  setForm({ ...form, fecha_hora: e.target.value })
                }
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white"
              />

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gold px-5 py-2 font-semibold text-night disabled:opacity-50"
                >
                  {saving
                    ? 'Guardando...'
                    : editingId === null
                      ? 'Crear partido'
                      : 'Guardar cambios'}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="rounded-full border border-white/20 px-5 py-2 font-semibold text-white"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Partidos cargados
                </h2>
                <p className="text-sm text-white/60">
                  ABM de partidos cargados en el sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void cargarPartidos()}
                className="rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
              >
                Actualizar
              </button>
            </div>

            {loading && <p className="text-white/70">Cargando partidos...</p>}

            {error && <p className="text-red-300">{error}</p>}

            {!loading && !error && partidos.length === 0 && (
              <p className="text-white/70">No hay partidos cargados.</p>
            )}

            {!loading && partidos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Estadio</th>
                      <th className="py-3 pr-4">Local</th>
                      <th className="py-3 pr-4">Visitante</th>
                      <th className="py-3 pr-4">Fecha</th>
                      <th className="py-3 pr-4">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {partidos.map((partido) => (
                      <tr
                        key={partido.id}
                        className="border-b border-white/5 text-white"
                      >
                        <td className="py-3 pr-4">{partido.id}</td>
                        <td className="py-3 pr-4">{partido.id_estadio}</td>
                        <td className="py-3 pr-4">
                          {partido.equipo_pais_local}
                        </td>
                        <td className="py-3 pr-4">
                          {partido.equipo_pais_visitante}
                        </td>
                        <td className="py-3 pr-4">
                          {new Date(partido.fecha_hora).toLocaleString()}
                        </td>
                        <td className="flex gap-2 py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => editarFila(partido)}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => void borrarPartido(partido.id)}
                            className="rounded-full border border-red-300/60 px-3 py-1 text-xs font-semibold text-red-200"
                          >
                            Eliminar
                          </button>
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
'use client';

import { useEffect, useState } from 'react';
import NavbarGeneral from '../../../components/navbars/NavbarGeneral';
import {
  crearEstadio,
  editarEstadio,
  eliminarEstadio,
  getEstadios,
  type Estadio,
} from '../../../lib/api';

export default function EstadiosPage() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargarEstadios() {
    try {
      setError('');
      setEstadios(await getEstadios());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadios.');
    }
  }

  useEffect(() => {
    void cargarEstadios();
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
      await cargarEstadios();
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
  }

  async function eliminar(id: number) {
    try {
      setError('');
      setMensaje('');
      await eliminarEstadio(id);
      setMensaje('Estadio eliminado correctamente.');
      await cargarEstadios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estadio.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
      <NavbarGeneral />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold">Gestión de estadios</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-200">
          ABM de estadios del sistema: crear, editar, eliminar y consultar los
          estadios cargados.
        </p>

        <section className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur">
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
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {estadios.map((estadio) => (
                  <tr
                    key={estadio.id_estadio}
                    className="border-b border-white/10"
                  >
                    <td className="px-4 py-4">{estadio.id_estadio}</td>
                    <td className="px-4 py-4 font-semibold">{estadio.nombre}</td>
                    <td className="px-4 py-4">{estadio.pais}</td>
                    <td className="px-4 py-4">{estadio.ciudad}</td>
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
                ))}

                {estadios.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-300" colSpan={5}>
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
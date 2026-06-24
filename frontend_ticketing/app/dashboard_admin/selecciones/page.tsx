"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import {
  crearEquipo,
  editarEquipo,
  eliminarEquipo,
  getEquipos,
  type Equipo,
  type CreateEquipoInput,
} from "@/lib/api";
import { ADMIN_NAV_LINKS } from "@/lib/nav-links";
type FormEquipo = {
  pais: string;
};

const initialForm: FormEquipo = {
  pais: "",
};

export default function SeleccionesPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [form, setForm] = useState<FormEquipo>(initialForm);
  const [editingPais, setEditingPais] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarEquipos() {
    try {
      setLoading(true);
      setError(null);

      const data = await getEquipos();
      setEquipos(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las selecciones.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarEquipos();
  }, []);

  function limpiarFormulario() {
    setForm(initialForm);
    setEditingPais(null);
  }

  function editarFila(equipo: Equipo) {
    setEditingPais(equipo.pais);
    setForm({
      pais: equipo.pais,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function guardarEquipo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const input: CreateEquipoInput = {
      pais: form.pais.trim(),
    };

    try {
      setSaving(true);
      setError(null);

      if (editingPais === null) {
        await crearEquipo(input);
      } else {
        await editarEquipo(editingPais, input);
      }

      limpiarFormulario();
      await cargarEquipos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la selección.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function borrarEquipo(pais: string) {
    if (!window.confirm(`¿Eliminar ${pais}?`)) {
      return;
    }

    try {
      setError(null);

      await eliminarEquipo(pais);

      await cargarEquipos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la selección.",
      );
    }
  }
  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral links={ADMIN_NAV_LINKS} />

        <main className="flex flex-1 flex-col gap-8 p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Gestión de selecciones
            </h1>

            <p className="mt-2 text-white/70">
              Administrá las selecciones del Mundial 2026.
            </p>
          </section>

          {error && <p className="text-red-400">{error}</p>}

          <section
            ref={formRef}
            className="rounded-2xl border border-white/10 bg-white/10 p-6"
          >
            <form
              onSubmit={(e) => void guardarEquipo(e)}
              className="flex gap-4"
            >
              <input
                type="text"
                placeholder="País"
                value={form.pais}
                onChange={(e) => setForm({ pais: e.target.value })}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
              />

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gold px-5 py-2 font-semibold text-night"
              >
                {editingPais === null ? "Crear" : "Guardar"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-6">
            {loading ? (
              <p className="text-white">Cargando...</p>
            ) : (
              <table className="w-full text-white">
                <thead>
                  <tr>
                    <th className="text-left">País</th>
                    <th className="text-left">Activo</th>
                    <th className="text-left">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {equipos.map((equipo) => (
                    <tr key={equipo.pais}>
                      <td>{equipo.pais}</td>
                      <td>{equipo.activo ? "Sí" : "No"}</td>

                      <td className="flex gap-2 py-2">
                        <button
                          onClick={() => editarFila(equipo)}
                          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => void borrarEquipo(equipo.pais)}
                          className="rounded-full border border-red-300/60 px-5 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/10"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </RequireRole>
  );
}

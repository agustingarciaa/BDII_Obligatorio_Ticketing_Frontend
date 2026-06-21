'use client';

import { useEffect, useState } from 'react';
import RequireRole from '@/components/RequireRole';
import NavbarGeneral from '@/components/navbars/NavbarGeneral';
import {
  getAdminCompras,
  getAdminTransferencias,
  type CompraAdmin,
  type TransferenciaAdmin,
} from '@/lib/api';

export default function OperacionesPage() {
  const [compras, setCompras] = useState<CompraAdmin[]>([]);
  const [transferencias, setTransferencias] = useState<TransferenciaAdmin[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const links = [
    { label: 'Partidos', href: "/dashboard_admin/partidos" },
    { label: 'Estadios', href: "/dashboard_admin/estadios" },
    { label: 'Selecciones', href: "/dashboard_admin/selecciones" },
    { label: 'Operaciones', href: "/dashboard_admin/operaciones" },
  ];

  async function cargarOperaciones() {
    try {
      setLoading(true);
      setError(null);

      const [comprasData, transferenciasData] = await Promise.all([
        getAdminCompras(),
        getAdminTransferencias(),
      ]);

      setCompras(comprasData);
      setTransferencias(transferenciasData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las operaciones.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarOperaciones();
  }, []);

  return (
    <RequireRole role="ADMIN">
      <div className="wc-hero flex min-h-full flex-1 flex-col">
        <NavbarGeneral links={links} />

        <main className="flex flex-1 flex-col gap-8 p-10">
          <section>
            <h1 className="text-3xl font-bold text-white">
              Operaciones
            </h1>
            <p className="mt-2 max-w-xl text-white/70">
              Listado general de compras y transferencias realizadas por los usuarios.
            </p>
          </section>

          <button
            type="button"
            onClick={() => void cargarOperaciones()}
            className="w-fit rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
          >
            Actualizar
          </button>

          {loading && <p className="text-white/70">Cargando operaciones...</p>}

          {error && <p className="text-red-300">{error}</p>}

          {!loading && !error && (
            <>
              <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <h2 className="mb-4 text-xl font-bold text-white">
                  Compras
                </h2>

                {compras.length === 0 ? (
                  <p className="text-white/70">No hay compras registradas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/60">
                          <th className="py-3 pr-4">ID venta</th>
                          <th className="py-3 pr-4">Usuario</th>
                          <th className="py-3 pr-4">Mail</th>
                          <th className="py-3 pr-4">Estado</th>
                          <th className="py-3 pr-4">Cantidad</th>
                          <th className="py-3 pr-4">Monto</th>
                          <th className="py-3 pr-4">Fecha</th>
                        </tr>
                      </thead>

                      <tbody>
                        {compras.map((compra) => (
                          <tr
                            key={compra.id_venta}
                            className="border-b border-white/5 text-white"
                          >
                            <td className="py-3 pr-4">{compra.id_venta}</td>
                            <td className="py-3 pr-4">{compra.id_usuario}</td>
                            <td className="py-3 pr-4">{compra.mail}</td>
                            <td className="py-3 pr-4">{compra.estado}</td>
                            <td className="py-3 pr-4">
                              {compra.cantidad_entradas}
                            </td>
                            <td className="py-3 pr-4">
                              ${compra.monto_total}
                            </td>
                            <td className="py-3 pr-4">
                              {new Date(compra.fecha).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <h2 className="mb-4 text-xl font-bold text-white">
                  Transferencias
                </h2>

                {transferencias.length === 0 ? (
                  <p className="text-white/70">
                    No hay transferencias registradas.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/60">
                          <th className="py-3 pr-4">ID</th>
                          <th className="py-3 pr-4">Entrada</th>
                          <th className="py-3 pr-4">Origen</th>
                          <th className="py-3 pr-4">Destino</th>
                          <th className="py-3 pr-4">Estado</th>
                          <th className="py-3 pr-4">Fecha</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transferencias.map((transferencia) => (
                          <tr
                            key={transferencia.id_transferencia}
                            className="border-b border-white/5 text-white"
                          >
                            <td className="py-3 pr-4">
                              {transferencia.id_transferencia}
                            </td>
                            <td className="py-3 pr-4">
                              {transferencia.entrada_id_boleto}
                            </td>
                            <td className="py-3 pr-4">
                              {transferencia.origen_mail}
                            </td>
                            <td className="py-3 pr-4">
                              {transferencia.destino_mail}
                            </td>
                            <td className="py-3 pr-4">
                              {transferencia.estado}
                            </td>
                            <td className="py-3 pr-4">
                              {new Date(
                                transferencia.fecha,
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </RequireRole>
  );
}
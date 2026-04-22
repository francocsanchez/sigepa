import { getVuelos } from "@/api/vueloAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";
import type { Vuelo } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function ListTodosVuelosView() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: vuelos, isLoading, isError } = useQuery({
    queryKey: ["vuelos", "listar"],
    queryFn: getVuelos,
  });

  const pageSize = 20;
  const totalVuelos = vuelos?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalVuelos / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return <LoadingSpinner label="Cargando vuelos..." />;
  }

  if (isError || !vuelos) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar los vuelos.
      </div>
    );
  }

  const paginatedVuelos = vuelos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-secondary-dark/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Operaciones</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Todos los vuelos</h2>
          <p className="mt-1 text-sm text-slate-500">Vista simplificada con métricas clave de cada vuelo.</p>
        </div>

        <Link
          to="/vuelos"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
        >
          Volver al módulo
        </Link>
      </div>

      <div className="rounded-2xl border border-secondary-dark/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-secondary-dark/50 bg-secondary/35">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Fecha</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Costo vuelo</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Costo alquiler</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Pilotos</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Paracaidistas</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-dark/30">
              {paginatedVuelos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Todavía no hay vuelos registrados.
                  </td>
                </tr>
              ) : (
                paginatedVuelos.map((vuelo: Vuelo) => {
                  const costoVuelo = vuelo.paracaidistas.reduce((acc, item) => acc + item.valorSalto, 0);
                  const costoAlquiler = vuelo.paracaidistas.reduce((acc, item) => acc + item.alquiler, 0);

                  return (
                    <tr key={vuelo._id} className="transition-colors hover:bg-secondary/15">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">{dateFormatter.format(new Date(vuelo.fecha))}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{currencyFormatter.format(costoVuelo)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{currencyFormatter.format(costoAlquiler)}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">{vuelo.pilotos.length}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">{vuelo.paracaidistas.length}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/vuelos/${vuelo._id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-secondary-dark/60 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-secondary/15"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={pageSize} totalItems={vuelos.length} itemLabel="vuelos" />
      </div>
    </div>
  );
}

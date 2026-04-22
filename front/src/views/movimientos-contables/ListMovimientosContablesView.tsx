import { getBalanceContable, getMovimientosContables } from "@/api/movimientoContableAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default function ListMovimientosContablesView() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: movimientosContables,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["movimientos-contables", "listar"],
    queryFn: getMovimientosContables,
  });

  const { data: balanceContable } = useQuery({
    queryKey: ["movimientos-contables", "balance"],
    queryFn: getBalanceContable,
  });

  const pageSize = 50;
  const totalMovimientos = movimientosContables?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalMovimientos / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return <LoadingSpinner label="Cargando movimientos contables..." />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar los movimientos contables.
      </div>
    );
  }

  if (!movimientosContables) return null;
  const paginatedMovimientos = movimientosContables.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const periodTotals = movimientosContables.reduce(
    (acc, movimiento) => {
      const movimientoDate = new Date(movimiento.fecha);
      const isCurrentMonth = movimientoDate.getMonth() === currentMonth && movimientoDate.getFullYear() === currentYear;

      if (!isCurrentMonth) return acc;

      if (movimiento.tipo === "INGRESO") {
        acc.ingresos += movimiento.monto;
      } else {
        acc.egresos += movimiento.monto;
      }

      return acc;
    },
    { ingresos: 0, egresos: 0 },
  );

  const summaryCards = [
    {
      label: "Saldo actual",
      value: currencyFormatter.format(balanceContable?.saldoActual || 0),
      helper: "Acumulado total",
      tone: "text-slate-900",
    },
    {
      label: "Ingresos del mes",
      value: `+ ${currencyFormatter.format(periodTotals.ingresos)}`,
      helper: "Mes actual",
      tone: "text-emerald-700",
    },
    {
      label: "Egresos del mes",
      value: `- ${currencyFormatter.format(periodTotals.egresos)}`,
      helper: "Mes actual",
      tone: "text-red-600",
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 border-b border-secondary-dark/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Contabilidad</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Movimientos contables</h2>
        </div>

        <Link
          to="/contabilidad/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>Agregar movimiento</span>
        </Link>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">{card.label}</p>
            <p className={`mt-2 text-xl font-semibold ${card.tone}`}>{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-secondary-dark/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-secondary-dark/50 bg-secondary/35">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Fecha</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">
                  Categoría
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Monto</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/80">Concepto</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-dark/30">
              {movimientosContables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                    Todavía no hay movimientos contables cargados.
                  </td>
                </tr>
              ) : (
                paginatedMovimientos.map((movimiento) => {
                  const isIngreso = movimiento.tipo === "INGRESO";
                  const amountLabel = `${isIngreso ? "+" : "-"} ${currencyFormatter.format(movimiento.monto)}`;

                  return (
                    <tr key={movimiento._id} className="transition-colors hover:bg-secondary/15">
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-slate-700">{formatDate(movimiento.fecha)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-slate-800">{movimiento.categoria.nombre}</span>
                          <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-dark md:inline-flex">
                            {movimiento.tipo === "INGRESO" ? "Ingreso" : "Egreso"}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2.5 text-right text-sm font-semibold ${
                          isIngreso ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {amountLabel}
                      </td>
                      <td className="max-w-[420px] px-3 py-2.5 text-sm text-slate-700">{movimiento.concepto}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={movimientosContables.length}
          itemLabel="movimientos"
        />
      </div>
    </>
  );
}

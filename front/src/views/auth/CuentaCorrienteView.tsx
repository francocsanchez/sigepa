import { getMyCuentaCorriente } from "@/api/cuentaCorrienteAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { CuentaCorrienteMovimiento } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, BadgeDollarSign, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
});

const summaryCardClassName = "rounded-2xl border border-secondary-dark/60 bg-white p-5 shadow-sm";

const getAmountClassName = (tipo: CuentaCorrienteMovimiento["tipo"]) =>
  tipo === "CREDITO" ? "text-emerald-700" : "text-rose-700";

const getAmountPrefix = (tipo: CuentaCorrienteMovimiento["tipo"]) => (tipo === "CREDITO" ? "+" : "-");

const getEstadoBadgeClassName = (estado: CuentaCorrienteMovimiento["estado"]) => {
  if (estado === "PAGADA") return "bg-emerald-100 text-emerald-700";
  if (estado === "PENDIENTE") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const getEstadoLabel = (estado: CuentaCorrienteMovimiento["estado"]) => {
  if (estado === "PAGADA") return "Pagada";
  if (estado === "PENDIENTE") return "Pendiente";
  return "Registrado";
};

const getPeriodoLabel = (movimiento: CuentaCorrienteMovimiento) => {
  if (!movimiento.periodo) return null;
  return monthFormatter.format(new Date(movimiento.periodo.ano, movimiento.periodo.mes - 1, 1));
};

export default function CuentaCorrienteView() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cuenta-corriente", "me"],
    queryFn: getMyCuentaCorriente,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  if (authLoading) {
    return <LoadingSpinner label="Cargando cuenta corriente..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner label="Cargando cuenta corriente..." />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error instanceof Error ? error.message : "Ocurrió un error al cargar la cuenta corriente."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Mi perfil</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Cuenta corriente</h2>
          <p className="mt-1 text-sm text-slate-500">
            Seguimiento de cuotas, pagos y movimientos contables vinculados a tu usuario.
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
        >
          Volver a mi perfil
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Clock3 className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Cuotas pendientes</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.resumen.cuotasPendientes}</p>
        </article>

        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-rose-100 p-3 text-rose-700">
            <BadgeDollarSign className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Cuotas pendientes</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {currencyFormatter.format(data.resumen.montoCuotasPendientes)}
          </p>
        </article>

        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Cuotas abonadas</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.resumen.cuotasAbonadas}</p>
        </article>

        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-700">
            <BadgeDollarSign className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Vuelos pendientes</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {currencyFormatter.format(data.resumen.montoVuelosPendientes)}
          </p>
        </article>

        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Wallet className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Deuda pendiente</p>
          <p className={`mt-1 text-3xl font-semibold ${data.resumen.deudaPendienteTotal > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {currencyFormatter.format(data.resumen.deudaPendienteTotal)}
          </p>
        </article>

        <article className={summaryCardClassName}>
          <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Wallet className="size-5" />
          </div>
          <p className="text-sm text-slate-500">Saldo histórico</p>
          <p className={`mt-1 text-3xl font-semibold ${data.resumen.saldoCuenta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {currencyFormatter.format(data.resumen.saldoCuenta)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Movimientos registrados</h3>
            <p className="text-sm text-slate-500">
              Se listan cargos de cuotas y todos los movimientos contables asociados a tu cuenta.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <ArrowLeftRight className="size-3.5" />
            {data.resumen.totalMovimientos} registros
          </div>
        </div>

        {data.movimientos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary-dark/60 bg-secondary/10 px-6 py-10 text-center text-sm text-slate-500">
            No hay movimientos vinculados a tu usuario todavía.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-secondary-dark/60">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-dark/60">
                <thead className="bg-secondary/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Detalle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Origen</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Monto</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-secondary-dark/60 bg-white">
                  {data.movimientos.map((movimiento) => {
                    const periodoLabel = getPeriodoLabel(movimiento);

                    return (
                      <tr key={movimiento.id} className="align-top transition-colors hover:bg-secondary/10">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {dateFormatter.format(new Date(movimiento.fecha))}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{movimiento.descripcion}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {periodoLabel ? `${periodoLabel} · ` : ""}
                            {movimiento.detalle}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {movimiento.origen === "CUOTA" ? "Cuota" : movimiento.origen === "VUELO" ? "Vuelo" : "Movimiento contable"}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoBadgeClassName(movimiento.estado)}`}>
                            {getEstadoLabel(movimiento.estado)}
                          </span>
                        </td>

                        <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${getAmountClassName(movimiento.tipo)}`}>
                          {getAmountPrefix(movimiento.tipo)} {currencyFormatter.format(movimiento.monto)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

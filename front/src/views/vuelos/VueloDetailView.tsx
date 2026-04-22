import { getVueloById } from "@/api/vueloAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Usuario, VueloCargo, VueloParacaidista } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plane, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";

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

const tipoSaltoLabel: Record<string, string> = {
  SALTO_BAJO: "Salto bajo",
  MEDIO_SALTO: "Medio salto",
  SALTO_COMPLETO: "Salto completo",
};

const getUserLabel = (usuario: Pick<Usuario, "_id" | "name" | "lastName">) => `${usuario.lastName}, ${usuario.name}`;

export default function VueloDetailView() {
  const params = useParams();
  const idVuelo = params.idVuelo || "";

  const { data: vuelo, isLoading, isError } = useQuery({
    queryKey: ["vuelos", "detalle", idVuelo],
    queryFn: () => getVueloById(idVuelo),
    enabled: Boolean(idVuelo),
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando detalle del vuelo..." />;
  }

  if (isError || !vuelo) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        No se pudo cargar el detalle del vuelo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-secondary-dark/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Operaciones</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Detalle del vuelo</h2>
          <p className="mt-1 text-sm text-slate-500">Información completa del vuelo, sus participantes y su cobranza.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/vuelos/todos"
            className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
          >
            Ver tabla simplificada
          </Link>

          <Link
            to="/vuelos"
            className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
          >
            Volver a vuelos
          </Link>
        </div>
      </div>

      <article className="rounded-2xl border border-secondary-dark/50 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-secondary-dark/30 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CalendarDays className="h-4 w-4" />
              {dateFormatter.format(new Date(vuelo.fecha))}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Pilotos: {vuelo.pilotos.map((piloto: Pick<Usuario, "_id" | "name" | "lastName">) => getUserLabel(piloto)).join(" · ")}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/15 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(vuelo.resumenCobranza.total)}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Pendiente</p>
              <p className="mt-1 text-sm font-semibold text-amber-700">{currencyFormatter.format(vuelo.resumenCobranza.pendiente)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Pagado</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{currencyFormatter.format(vuelo.resumenCobranza.pagado)}</p>
            </div>
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-secondary-dark/40">
          <div className="border-b border-secondary-dark/40 bg-secondary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Paracaidistas</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-dark/40">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Paracaidista</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Tipo salto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Valor salto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Alquiler</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-secondary-dark/40 bg-white">
                {vuelo.paracaidistas.map((paracaidista: VueloParacaidista) => (
                  <tr key={`${vuelo._id}-${paracaidista.usuario._id}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{getUserLabel(paracaidista.usuario)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{tipoSaltoLabel[paracaidista.tipoSalto] || paracaidista.tipoSalto}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">{currencyFormatter.format(paracaidista.valorSalto)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">{currencyFormatter.format(paracaidista.alquiler)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      {currencyFormatter.format(paracaidista.valorSalto + paracaidista.alquiler)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-secondary-dark/40">
          <div className="border-b border-secondary-dark/40 bg-secondary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Cargos asociados</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-dark/40">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Concepto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Monto</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-secondary-dark/40 bg-white">
                {vuelo.cargos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Este vuelo no tiene cargos asociados.
                    </td>
                  </tr>
                ) : (
                  vuelo.cargos.map((cargo: VueloCargo) => (
                    <tr key={cargo._id}>
                      <td className="px-4 py-3 text-sm text-slate-800">{getUserLabel(cargo.usuario)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{cargo.tipoCargo === "ALQUILER" ? "Alquiler de equipo" : "Salto de paracaídas"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            cargo.estado === "PAGADO" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {cargo.estado === "PAGADO" ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{currencyFormatter.format(cargo.monto)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}

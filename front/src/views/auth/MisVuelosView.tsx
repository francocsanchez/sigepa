import { getMisVuelos } from "@/api/vueloAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { MiVuelo, Usuario, VueloCargo } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plane, ReceiptText, Users } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

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

const tipoSaltoLabel: Record<string, string> = {
  SALTO_BAJO: "Salto bajo",
  MEDIO_SALTO: "Medio salto",
  SALTO_COMPLETO: "Salto completo",
};

const getUserLabel = (usuario: { name: string; lastName: string }) => `${usuario.lastName}, ${usuario.name}`;

export default function MisVuelosView() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vuelos", "mis-vuelos"],
    queryFn: getMisVuelos,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  if (authLoading) {
    return <LoadingSpinner label="Cargando vuelos..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner label="Cargando vuelos..." />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error instanceof Error ? error.message : "No se pudo cargar el historial de vuelos."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Mi perfil</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Mis vuelos</h2>
          <p className="mt-1 text-sm text-slate-500">Detalle de cada vuelo en el que participaste, con pilotos, compañeros y cargos asociados.</p>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
        >
          Volver a mi perfil
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-secondary-dark/60 bg-secondary/10 px-6 py-10 text-center text-sm text-slate-500">
          Todavía no tenés vuelos registrados.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((vuelo: MiVuelo) => (
            <article key={vuelo._id} className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-secondary-dark/30 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <CalendarDays className="h-4 w-4" />
                    {dateFormatter.format(new Date(vuelo.fecha))}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Vuelo registrado</h3>
                  <p className="mt-1 text-sm text-slate-500">Pilotos: {vuelo.pilotos.map((piloto: Pick<Usuario, "_id" | "name" | "lastName">) => getUserLabel(piloto)).join(" · ")}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary/10 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mi salto</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {vuelo.miSalto ? tipoSaltoLabel[vuelo.miSalto.tipoSalto] : "Sin información"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Pendiente</p>
                    <p className="mt-2 text-sm font-semibold text-amber-700">{currencyFormatter.format(vuelo.resumenCobranza.pendiente)}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Pagado</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-700">{currencyFormatter.format(vuelo.resumenCobranza.pagado)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-2xl border border-secondary-dark/40 bg-secondary/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Mi participación</h4>
                  </div>

                  {vuelo.miSalto ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Tipo de salto</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{tipoSaltoLabel[vuelo.miSalto.tipoSalto]}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Valor de salto</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(vuelo.miSalto.valorSalto)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Alquiler</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(vuelo.miSalto.alquiler)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No se encontró tu participación dentro del vuelo.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-secondary-dark/40 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Compañeros de vuelo</h4>
                  </div>

                  {vuelo.companeros.length === 0 ? (
                    <p className="text-sm text-slate-500">No hubo otros paracaidistas registrados en este vuelo.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {vuelo.companeros.map((companero: Pick<Usuario, "_id" | "name" | "lastName">) => (
                        <span key={companero._id} className="rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-slate-700">
                          {getUserLabel(companero)}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="mt-4 rounded-2xl border border-secondary-dark/40 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Cargos del vuelo</h4>
                </div>

                {vuelo.cargos.length === 0 ? (
                  <p className="text-sm text-slate-500">Este vuelo no tiene cargos asociados para tu usuario.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-secondary-dark/40">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-dark/40">
                        <thead className="bg-secondary/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Concepto</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-dark/40 bg-white">
                          {vuelo.cargos.map((cargo: VueloCargo) => (
                            <tr key={cargo._id}>
                              <td className="px-4 py-3 text-sm text-slate-800">{cargo.tipoCargo === "ALQUILER" ? "Alquiler de equipo" : "Salto de paracaídas"}</td>
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

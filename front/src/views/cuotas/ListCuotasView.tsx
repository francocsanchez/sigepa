import { generateCuotas, getCuotasByYear, payCuota } from "@/api/cuotaAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Cuota, CuotaFila, GenerarCuotasResponse, PagarCuotaResponse } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, CheckCheck, Coins, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

export default function ListCuotasView() {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [generateMonth, setGenerateMonth] = useState(today.getMonth() + 1);
  const [amount, setAmount] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCuotaId, setSelectedCuotaId] = useState("");

  const {
    data: cuotasAnuales,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cuotas", "listar", selectedYear],
    queryFn: () => getCuotasByYear(selectedYear),
  });

  const { mutate: generarCuotas, isPending: isGenerating } = useMutation({
    mutationFn: generateCuotas,
    onError: (error: Error) => {
      toast.error(error.message || "Error al generar las cuotas");
    },
    onSuccess: (response: GenerarCuotasResponse) => {
      toast.success(response.message || "Cuotas generadas correctamente");
      queryClient.invalidateQueries({ queryKey: ["cuotas", "listar", selectedYear] });
    },
  });

  const { mutate: registrarPago, isPending: isPaying } = useMutation({
    mutationFn: payCuota,
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el pago");
    },
    onSuccess: (response: PagarCuotaResponse) => {
      toast.success(response.message || "Pago registrado correctamente");
      setSelectedCuotaId("");
      queryClient.invalidateQueries({ queryKey: ["cuotas", "listar", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "balance"] });
    },
  });

  const availableYears = useMemo(() => {
    const baseYear = today.getFullYear();
    return Array.from({ length: 5 }, (_, index) => baseYear - 2 + index);
  }, [today]);

  const usuariosConCuotasPendientes = useMemo(() => {
    if (!cuotasAnuales) return [];

    return cuotasAnuales.filas.filter((fila) => fila.meses.some(({ cuota }) => cuota?.estado === "PENDIENTE"));
  }, [cuotasAnuales]);

  const cuotasPendientesUsuario = useMemo(() => {
    const filaSeleccionada = usuariosConCuotasPendientes.find((fila) => fila.usuario._id === selectedUserId);

    if (!filaSeleccionada) return [];

    return filaSeleccionada.meses
      .map(({ cuota }) => cuota)
      .filter((cuota): cuota is Cuota => cuota !== null && cuota.estado === "PENDIENTE")
      .sort((a, b) => a.mes - b.mes);
  }, [selectedUserId, usuariosConCuotasPendientes]);

  const handleGenerate = () => {
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Ingresá un monto válido para generar las cuotas");
      return;
    }

    generarCuotas({
      mes: generateMonth,
      ano: selectedYear,
      monto: parsedAmount,
    });
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedCuotaId("");
  };

  const handlePay = () => {
    if (!selectedCuotaId) {
      toast.error("Seleccioná una cuota pendiente para registrar el pago");
      return;
    }

    registrarPago(selectedCuotaId);
  };

  if (isLoading) {
    return <LoadingSpinner label="Cargando cuotas..." />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar las cuotas.
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 border-b border-secondary-dark/60 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Configuración</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Cuotas sociales</h2>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Año
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Mes a generar
              <select
                value={generateMonth}
                onChange={(event) => setGenerateMonth(Number(event.target.value))}
                className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Monto
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
              />
            </label>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={2.2} />
              <span>Generar cuotas</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[240px] flex-col gap-1 text-sm font-medium text-slate-700">
            Socio
            <select
              value={selectedUserId}
              onChange={(event) => handleUserChange(event.target.value)}
              className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
            >
              <option value="">Seleccionar socio</option>
              {usuariosConCuotasPendientes.map((fila) => (
                <option key={fila.usuario._id} value={fila.usuario._id}>
                  {fila.usuario.lastName}, {fila.usuario.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[220px] flex-col gap-1 text-sm font-medium text-slate-700">
            Cuota pendiente
            <select
              value={selectedCuotaId}
              onChange={(event) => setSelectedCuotaId(event.target.value)}
              disabled={!selectedUserId}
              className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Seleccionar cuota</option>
              {cuotasPendientesUsuario.map((cuota) => (
                <option key={cuota._id} value={cuota._id}>
                  {monthNames[cuota.mes - 1]} {cuota.ano} - {currencyFormatter.format(cuota.monto)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={isPaying || !selectedCuotaId}
            onClick={handlePay}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4" strokeWidth={2.2} />
            <span>Registrar pago</span>
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">Año consultado</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{selectedYear}</p>
          <p className="mt-1 text-xs text-slate-500">Vista anual de cuotas generadas</p>
        </div>

        <div className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-3 shadow-sm">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">
            <CalendarRange className="h-4 w-4" />
            Mes seleccionado
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{monthNames[generateMonth - 1]}</p>
          <p className="mt-1 text-xs text-slate-500">Período a generar</p>
        </div>

        <div className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-3 shadow-sm">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">
            <Coins className="h-4 w-4" />
            Monto actual
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {amount && Number(amount) > 0 ? currencyFormatter.format(Number(amount)) : "Sin definir"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Se aplica al generar el período</p>
        </div>
      </div>

      <div className="rounded-2xl border border-secondary-dark/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed">
            <thead className="border-b border-secondary-dark/50 bg-secondary/35">
              <tr>
                <th className="sticky left-0 z-20 w-[180px] bg-secondary/35 px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-dark/80">
                  Usuario
                </th>
                {monthNames.map((monthName) => (
                  <th
                    key={monthName}
                    className="px-1.5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-dark/80"
                  >
                    {monthName}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-dark/30">
              {!cuotasAnuales || cuotasAnuales.filas.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-3 py-8 text-center text-sm text-slate-500">
                    No hay usuarios activos para mostrar cuotas.
                  </td>
                </tr>
              ) : (
                cuotasAnuales.filas.map((fila: CuotaFila) => (
                  <tr key={fila.usuario._id} className="transition-colors hover:bg-secondary/10">
                    <td className="sticky left-0 z-10 bg-white px-2 py-2 align-middle">
                      <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900">
                        {fila.usuario.lastName}, {fila.usuario.name}
                      </p>
                    </td>

                    {fila.meses.map(({ mes, cuota }: CuotaFila["meses"][number]) => {
                      const isPaid = cuota?.estado === "PAGADA";
                      const hasCuota = Boolean(cuota);

                      return (
                        <td
                          key={`${fila.usuario._id}-${mes}`}
                          className={`px-1 py-1 text-center ${
                            hasCuota ? (isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800") : "bg-red-50 text-red-700"
                          }`}
                        >
                          <div className="leading-tight">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.08em]">
                              {hasCuota ? (isPaid ? "Pagada" : "Pend.") : "-"}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-medium">
                              {cuota ? currencyFormatter.format(cuota.monto) : "Sin cuota"}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

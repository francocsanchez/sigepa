import { createVuelo, getPendingVueloCargos, getVuelos, payVueloCargos } from "@/api/vueloAPI";
import { getUsuarios } from "@/api/usuarioAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";
import type { Usuario, Vuelo, VueloCargo, VueloFormData, VueloParacaidista, VueloParacaidistaFormItem, VueloTipoSalto } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCheck, Plane, Plus, ReceiptText, Table2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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

const tipoSaltoOptions: Array<{ value: VueloTipoSalto; label: string }> = [
  { value: "SALTO_BAJO", label: "Salto bajo" },
  { value: "MEDIO_SALTO", label: "Medio salto" },
  { value: "SALTO_COMPLETO", label: "Salto completo" },
];

const emptyParacaidista = (): VueloParacaidistaFormItem => ({
  usuario: "",
  alquiler: "",
  valorSalto: "",
  tipoSalto: "SALTO_COMPLETO",
});

const initialFormData = (): VueloFormData => ({
  fecha: "",
  pilotos: [""],
  paracaidistas: [emptyParacaidista()],
});

const getUserLabel = (usuario: Pick<Usuario, "_id" | "name" | "lastName">) => `${usuario.lastName}, ${usuario.name}`;

export default function ListVuelosView() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<VueloFormData>(initialFormData);
  const [selectedPendingUserId, setSelectedPendingUserId] = useState("");
  const [selectedCargoIds, setSelectedCargoIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: usuarios,
    isLoading: isLoadingUsuarios,
    isError: isErrorUsuarios,
  } = useQuery({
    queryKey: ["usuarios", "listar"],
    queryFn: getUsuarios,
  });

  const {
    data: vuelos,
    isLoading: isLoadingVuelos,
    isError: isErrorVuelos,
  } = useQuery({
    queryKey: ["vuelos", "listar"],
    queryFn: getVuelos,
  });

  const {
    data: pendingCargos,
    isLoading: isLoadingPendingCargos,
    isError: isErrorPendingCargos,
  } = useQuery({
    queryKey: ["vuelos", "cargos", "pendientes"],
    queryFn: getPendingVueloCargos,
  });

  const pilotos = useMemo(
    () => (usuarios || []).filter((usuario) => usuario.enable && usuario.role.includes("piloto")),
    [usuarios],
  );

  const paracaidistas = useMemo(
    () => (usuarios || []).filter((usuario) => usuario.enable && usuario.role.includes("paracaidista")),
    [usuarios],
  );

  const pendingUsers = useMemo(() => {
    const byUser = new Map<string, Usuario>();

    (pendingCargos || []).forEach((cargo: VueloCargo) => {
      if (!byUser.has(cargo.usuario._id)) {
        byUser.set(cargo.usuario._id, cargo.usuario as Usuario);
      }
    });

    return Array.from(byUser.values()).sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [pendingCargos]);

  const pendingCargosBySelectedUser = useMemo(() => {
    if (!selectedPendingUserId) return [];
    return (pendingCargos || []).filter((cargo) => cargo.usuario._id === selectedPendingUserId);
  }, [pendingCargos, selectedPendingUserId]);

  const { mutate: mutateCreateVuelo, isPending: isCreatingVuelo } = useMutation({
    mutationFn: createVuelo,
    onError: (error: Error) => toast.error(error.message || "Error al registrar el vuelo"),
    onSuccess: (response) => {
      toast.success(response.message || "Vuelo registrado correctamente");
      setFormData(initialFormData());
      queryClient.invalidateQueries({ queryKey: ["vuelos", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["vuelos", "cargos", "pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente", "me"] });
    },
  });

  const { mutate: mutatePayCargos, isPending: isPayingCargos } = useMutation({
    mutationFn: payVueloCargos,
    onError: (error: Error) => toast.error(error.message || "Error al registrar el pago"),
    onSuccess: (response) => {
      toast.success(response.message || "Pago registrado correctamente");
      setSelectedCargoIds([]);
      queryClient.invalidateQueries({ queryKey: ["vuelos", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["vuelos", "cargos", "pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente", "me"] });
    },
  });

  const handlePilotChange = (index: number, value: string) => {
    setFormData((current: VueloFormData) => {
      const pilotosActualizados = [...current.pilotos];
      pilotosActualizados[index] = value;
      return {
        ...current,
        pilotos: pilotosActualizados,
      };
    });
  };

  const pageSize = 10;
  const totalVuelos = vuelos?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalVuelos / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const addSecondPilot = () => {
    setFormData((current: VueloFormData) => ({
      ...current,
      pilotos: current.pilotos.length === 1 ? [...current.pilotos, ""] : current.pilotos,
    }));
  };

  const removeSecondPilot = () => {
    setFormData((current: VueloFormData) => ({
      ...current,
      pilotos: current.pilotos.slice(0, 1),
    }));
  };

  const updateParacaidista = <K extends keyof VueloParacaidistaFormItem>(index: number, key: K, value: VueloParacaidistaFormItem[K]) => {
    setFormData((current: VueloFormData) => ({
      ...current,
      paracaidistas: current.paracaidistas.map((item: VueloParacaidistaFormItem, itemIndex: number) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addParacaidista = () => {
    setFormData((current: VueloFormData) => ({
      ...current,
      paracaidistas: [...current.paracaidistas, emptyParacaidista()],
    }));
  };

  const removeParacaidista = (index: number) => {
    setFormData((current: VueloFormData) => ({
      ...current,
      paracaidistas: current.paracaidistas.filter((_: VueloParacaidistaFormItem, itemIndex: number) => itemIndex !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.fecha) {
      toast.error("Ingresá la fecha del vuelo");
      return;
    }

    const pilotosSeleccionados = formData.pilotos.filter(Boolean);

    if (pilotosSeleccionados.length === 0) {
      toast.error("Seleccioná al menos un piloto");
      return;
    }

    if (new Set(pilotosSeleccionados).size !== pilotosSeleccionados.length) {
      toast.error("No podés repetir pilotos en el mismo vuelo");
      return;
    }

    const paracaidistasSeleccionados = formData.paracaidistas.filter((item: VueloParacaidistaFormItem) => item.usuario);

    if (paracaidistasSeleccionados.length === 0) {
      toast.error("Agregá al menos un paracaidista");
      return;
    }

    if (paracaidistasSeleccionados.length !== formData.paracaidistas.length) {
      toast.error("Todos los paracaidistas deben estar completos");
      return;
    }

    if (new Set(paracaidistasSeleccionados.map((item: VueloParacaidistaFormItem) => item.usuario)).size !== paracaidistasSeleccionados.length) {
      toast.error("No podés repetir paracaidistas en el mismo vuelo");
      return;
    }

    mutateCreateVuelo(formData);
  };

  const toggleCargoSelection = (cargoId: string) => {
    setSelectedCargoIds((current: string[]) =>
      current.includes(cargoId) ? current.filter((id) => id !== cargoId) : [...current, cargoId],
    );
  };

  const handlePaySelected = () => {
    if (selectedCargoIds.length === 0) {
      toast.error("Seleccioná al menos un cargo pendiente");
      return;
    }

    mutatePayCargos({
      cargoIds: selectedCargoIds,
      fechaPago: new Date().toISOString(),
    });
  };

  if (isLoadingUsuarios || isLoadingVuelos || isLoadingPendingCargos) {
    return <LoadingSpinner label="Cargando módulo de vuelos..." />;
  }

  if (isErrorUsuarios || isErrorVuelos || isErrorPendingCargos || !usuarios || !vuelos || !pendingCargos) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar el módulo de vuelos.
      </div>
    );
  }

  const totalPendiente = pendingCargos.reduce((acc, cargo) => acc + cargo.monto, 0);
  const paginatedVuelos = vuelos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-secondary-dark/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Operaciones</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Vuelos</h2>
          <p className="mt-1 text-sm text-slate-500">Registro de vuelos, cargos pendientes y pagos aplicados a paracaidistas.</p>
        </div>

        <Link
          to="/vuelos/todos"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-secondary-dark/60 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
        >
          <Table2 className="h-4 w-4" />
          Ver todos los vuelos
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">Vuelos registrados</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{vuelos.length}</p>
        </article>

        <article className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">Cargos pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingCargos.length}</p>
        </article>

        <article className="rounded-2xl border border-secondary-dark/60 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-light">Total pendiente</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{currencyFormatter.format(totalPendiente)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Registrar vuelo</h3>
            <p className="text-sm text-slate-500">Cada cargo de salto o alquiler queda pendiente hasta que se registre el pago.</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <Plane className="h-3.5 w-3.5" />
            Nuevo vuelo
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Fecha
            <input
              type="date"
              value={formData.fecha}
              onChange={(event) => setFormData((current: VueloFormData) => ({ ...current, fecha: event.target.value }))}
              className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Piloto 1
              <select
                value={formData.pilotos[0] || ""}
                onChange={(event) => handlePilotChange(0, event.target.value)}
                className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
              >
                <option value="">Seleccionar piloto</option>
                {pilotos.map((piloto: Usuario) => (
                  <option key={piloto._id} value={piloto._id}>
                    {getUserLabel(piloto)}
                  </option>
                ))}
              </select>
            </label>

            {formData.pilotos.length > 1 ? (
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Piloto 2
                <div className="flex gap-2">
                  <select
                    value={formData.pilotos[1] || ""}
                    onChange={(event) => handlePilotChange(1, event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
                  >
                    <option value="">Seleccionar piloto</option>
                    {pilotos.map((piloto: Usuario) => (
                      <option key={piloto._id} value={piloto._id}>
                        {getUserLabel(piloto)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={removeSecondPilot}
                    className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-3 text-slate-600 transition hover:bg-secondary/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </label>
            ) : (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addSecondPilot}
                  className="inline-flex items-center gap-2 rounded-xl border border-secondary-dark/60 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
                >
                  <Plus className="h-4 w-4" />
                  Agregar piloto
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Paracaidistas</h4>

            <button
              type="button"
              onClick={addParacaidista}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-dark/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
            >
              <Plus className="h-4 w-4" />
              Agregar fila
            </button>
          </div>

          <div className="space-y-3">
            {formData.paracaidistas.map((item: VueloParacaidistaFormItem, index: number) => (
              <div key={`paracaidista-${index}`} className="grid gap-3 rounded-2xl border border-secondary-dark/40 bg-secondary/10 p-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Paracaidista
                  <select
                    value={item.usuario}
                    onChange={(event) => updateParacaidista(index, "usuario", event.target.value)}
                    className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
                  >
                    <option value="">Seleccionar paracaidista</option>
                    {paracaidistas.map((paracaidista: Usuario) => (
                      <option key={paracaidista._id} value={paracaidista._id}>
                        {getUserLabel(paracaidista)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Valor salto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.valorSalto}
                    onChange={(event) => updateParacaidista(index, "valorSalto", event.target.value === "" ? "" : Number(event.target.value))}
                    className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Alquiler
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.alquiler}
                    onChange={(event) => updateParacaidista(index, "alquiler", event.target.value === "" ? "" : Number(event.target.value))}
                    className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Tipo de salto
                  <select
                    value={item.tipoSalto}
                    onChange={(event) => updateParacaidista(index, "tipoSalto", event.target.value as VueloTipoSalto)}
                    className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
                  >
                    {tipoSaltoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeParacaidista(index)}
                    disabled={formData.paracaidistas.length === 1}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-secondary-dark/60 px-3 text-slate-600 transition hover:bg-secondary/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreatingVuelo}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plane className="h-4 w-4" />
            Registrar vuelo
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Cobro de saltos y equipo</h3>
            <p className="text-sm text-slate-500">Aplicá pagos sobre cargos pendientes. El asiento contable se registra al momento del cobro.</p>
          </div>

          <label className="flex min-w-[260px] flex-col gap-1 text-sm font-medium text-slate-700">
            Usuario con deuda
            <select
              value={selectedPendingUserId}
              onChange={(event) => {
                setSelectedPendingUserId(event.target.value);
                setSelectedCargoIds([]);
              }}
              className="rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary"
            >
              <option value="">Seleccionar usuario</option>
              {pendingUsers.map((usuario: Usuario) => (
                <option key={usuario._id} value={usuario._id}>
                  {getUserLabel(usuario)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {pendingCargosBySelectedUser.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary-dark/60 bg-secondary/10 px-6 py-10 text-center text-sm text-slate-500">
            {selectedPendingUserId ? "El usuario seleccionado no tiene cargos pendientes." : "Seleccioná un usuario para aplicar pagos."}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-secondary-dark/60">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-dark/60">
                  <thead className="bg-secondary/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Pagar</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Fecha vuelo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Concepto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Categoría</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Monto</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-secondary-dark/60 bg-white">
                    {pendingCargosBySelectedUser.map((cargo: VueloCargo) => (
                      <tr key={cargo._id} className="transition-colors hover:bg-secondary/10">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedCargoIds.includes(cargo._id)}
                            onChange={() => toggleCargoSelection(cargo._id)}
                            className="h-4 w-4 rounded border-secondary-dark/60 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{dateFormatter.format(new Date(cargo.fecha))}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{cargo.tipoCargo === "ALQUILER" ? "Alquiler de equipo" : "Salto de paracaídas"}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{cargo.categoria.nombre}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-rose-700">
                          {currencyFormatter.format(cargo.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePaySelected}
                disabled={selectedCargoIds.length === 0 || isPayingCargos}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCheck className="h-4 w-4" />
                Registrar pago
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Historial de vuelos</h3>
            <p className="text-sm text-slate-500">Resumen de pilotos, paracaidistas y estado de cobranza por vuelo.</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <CalendarDays className="h-3.5 w-3.5" />
            {vuelos.length} registros
          </div>
        </div>

        {vuelos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary-dark/60 bg-secondary/10 px-6 py-10 text-center text-sm text-slate-500">
            Todavía no hay vuelos registrados.
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedVuelos.map((vuelo: Vuelo) => (
              <article key={vuelo._id} className="rounded-2xl border border-secondary-dark/50 bg-white p-4">
                <div className="flex flex-col gap-3 border-b border-secondary-dark/30 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Vuelo del {dateFormatter.format(new Date(vuelo.fecha))}</p>
                    <p className="mt-1 text-sm text-slate-500">
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

                <div className="mt-4 overflow-hidden rounded-2xl border border-secondary-dark/40">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-dark/40">
                      <thead className="bg-secondary/10">
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
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {tipoSaltoOptions.find((option) => option.value === paracaidista.tipoSalto)?.label || paracaidista.tipoSalto}
                            </td>
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
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ReceiptText className="h-3.5 w-3.5" />
                    {vuelo.cargos.length} cargos contables asociados al vuelo
                  </div>

                  <Link
                    to={`/vuelos/${vuelo._id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/15"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-secondary-dark/50 bg-white shadow-sm">
              <Pagination currentPage={currentPage} onPageChange={setCurrentPage} pageSize={pageSize} totalItems={vuelos.length} itemLabel="vuelos" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

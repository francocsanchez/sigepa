import { getCategoriasContables } from "@/api/categoriaContableAPI";
import { getMovimientoContableByID, updateMovimientoContableById } from "@/api/movimientoContableAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import MovimientoContableForm from "@/components/movimientos-contables/MovimientoContableForm";
import type { MovimientoContableFormData } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const toInputDate = (value: string) => {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export default function EditMovimientoContableView() {
  const params = useParams();
  const idMovimientoContable = params.idMovimientoContable!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: categoriasContables,
    isLoading: categoriasIsLoading,
    isError: categoriasIsError,
  } = useQuery({
    queryKey: ["categorias-contables", "select"],
    queryFn: () => getCategoriasContables(),
  });

  const {
    data: movimientoContable,
    isLoading: movimientoIsLoading,
    isError: movimientoIsError,
  } = useQuery({
    queryKey: ["movimiento-contable", idMovimientoContable],
    queryFn: () => getMovimientoContableByID(idMovimientoContable),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MovimientoContableFormData>({
    values: {
      tipo: movimientoContable?.tipo || "",
      fecha: movimientoContable ? toInputDate(movimientoContable.fecha) : "",
      monto: movimientoContable?.monto ?? "",
      concepto: movimientoContable?.concepto || "",
      categoria: movimientoContable?.categoria._id || "",
      observaciones: movimientoContable?.observaciones || "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateMovimientoContableById,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (response: { message: string }) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-contables", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["movimiento-contable", idMovimientoContable] });
      navigate("/contabilidad");
    },
  });

  if (categoriasIsLoading || movimientoIsLoading) {
    return <LoadingSpinner label="Cargando movimiento contable..." />;
  }

  if (categoriasIsError || movimientoIsError || !categoriasContables || !movimientoContable) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar el movimiento contable.
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Contabilidad</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Editar movimiento</h2>
        </div>
      </div>

      <div className="flex-1">
        <form
          onSubmit={handleSubmit((formData) => mutation.mutate({ formData, idMovimientoContable }))}
          className="w-full space-y-5 rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm"
        >
          <MovimientoContableForm register={register} watch={watch} errors={errors} categoriasContables={categoriasContables} />

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/contabilidad"
              className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-secondary/40"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

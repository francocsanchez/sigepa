import { getCategoriaContableByID, updateCategoriaContableById } from "@/api/categoriaContableAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import CategoriaContableForm from "@/components/categorias-contables/CategoriaContableForm";
import type { CategoriaContableFormData } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EditCategoriaContableView() {
  const params = useParams();
  const idCategoriaContable = params.idCategoriaContable!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: categoriaContable,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["categoria-contable", idCategoriaContable],
    queryFn: () => getCategoriaContableByID(idCategoriaContable),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaContableFormData>({
    values: {
      nombre: categoriaContable?.nombre || "",
      tipo: categoriaContable?.tipo || "",
      enable: categoriaContable?.enable ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: updateCategoriaContableById,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (response: { message: string }) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["categorias-contables", "listar"] });
      queryClient.invalidateQueries({ queryKey: ["categoria-contable", idCategoriaContable] });
      navigate("/config/categorias-contables");
    },
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando categoría contable..." />;
  }

  if (isError || !categoriaContable) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar la categoría contable.
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Categorías contables</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Editar categoría contable</h2>
        </div>
      </div>

      <div className="flex-1">
        <form
          onSubmit={handleSubmit((formData) => mutation.mutate({ formData, idCategoriaContable }))}
          className="w-full space-y-5 rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm"
        >
          <CategoriaContableForm register={register} errors={errors} />

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/config/categorias-contables"
              className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-secondary/40"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

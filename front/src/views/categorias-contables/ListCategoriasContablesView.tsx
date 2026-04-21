import { changeStatusCategoriaContable, getCategoriasContables } from "@/api/categoriaContableAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { CategoriaContableMutationResponse } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const tipoLabels = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  AMBAS: "Ambas",
} as const;

export default function ListCategoriasContablesView() {
  const queryClient = useQueryClient();

  const {
    data: categoriasContables,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["categorias-contables", "listar"],
    queryFn: () => getCategoriasContables(true),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (id: string) => changeStatusCategoriaContable(id),
    onError: (error: Error) => {
      toast.error(error.message || "Error al cambiar el estado de la categoría contable");
    },
    onSuccess: (response: CategoriaContableMutationResponse) => {
      toast.success(response.message || "Estado de la categoría contable actualizado");
      queryClient.invalidateQueries({ queryKey: ["categorias-contables", "listar"] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando categorías contables..." />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar las categorías contables.
      </div>
    );
  }

  if (!categoriasContables) return null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Categorías contables</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Listado de categorías contables</h2>
        </div>

        <Link
          to="/config/categorias-contables/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>Nueva categoría</span>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="rounded-2xl border border-secondary-dark/60 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-secondary-dark/50 bg-secondary/40">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-primary-dark/80">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-primary-dark/80">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-primary-dark/80">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-primary-dark/80">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-secondary-dark/40">
                {categoriasContables.map((categoria) => (
                  <tr key={categoria._id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{categoria.nombre}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-dark">
                        {tipoLabels[categoria.tipo]}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          categoria.enable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {categoria.enable ? "Habilitada" : "Deshabilitada"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`${categoria._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-dark/60 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/40 hover:bg-secondary/40 hover:text-primary-dark"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                          <span>Ver</span>
                        </Link>

                        <Link
                          to={`${categoria._id}/editar`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-dark/60 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/40 hover:bg-secondary/40 hover:text-primary-dark"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                          <span>Editar</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => changeStatus(categoria._id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            !categoria.enable
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {categoria.enable ? (
                            <>
                              <ShieldOff className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>Deshabilitar</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>Habilitar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

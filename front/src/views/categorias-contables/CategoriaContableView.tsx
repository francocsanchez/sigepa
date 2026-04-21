import { getCategoriaContableByID } from "@/api/categoriaContableAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

const readValue = (value?: string | number | boolean | null) => {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (value === undefined || value === null || value === "") {
    return "No informado";
  }

  return value;
};

type DetailItemProps = {
  label: string;
  value: string | number | boolean | null | undefined;
};

const tipoLabels = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  AMBAS: "Ambas",
} as const;

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1 rounded-xl border border-secondary-dark/50 bg-secondary/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-light">{label}</p>
      <p className="text-sm font-medium text-neutral-dark">{readValue(value)}</p>
    </div>
  );
}

export default function CategoriaContableView() {
  const params = useParams();
  const idCategoriaContable = params.idCategoriaContable!;

  const {
    data: categoriaContable,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["categoria-contable", idCategoriaContable],
    queryFn: () => getCategoriaContableByID(idCategoriaContable),
    retry: false,
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando ficha de la categoría contable..." />;
  }

  if (isError || !categoriaContable) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar la ficha de la categoría contable.
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Categorías contables</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Ficha de categoría contable</h2>
        </div>

        <Link
          to="/config/categorias-contables"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-secondary/40"
        >
          Volver al listado
        </Link>
      </div>

      <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Información principal</h3>
          <p className="text-sm text-slate-500">Datos básicos y estado actual de la categoría contable.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Nombre" value={categoriaContable.nombre} />
          <DetailItem label="Tipo" value={tipoLabels[categoriaContable.tipo]} />
          <DetailItem label="Estado" value={categoriaContable.enable ? "Habilitada" : "Deshabilitada"} />
        </div>
      </section>
    </>
  );
}

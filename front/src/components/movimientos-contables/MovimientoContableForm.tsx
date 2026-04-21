import { categoriaMatchesMovimientoTipo, movimientoContableTipos, type CategoriaContable, type MovimientoContableFormData } from "@/types/index";
import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";

type MovimientoContableFormProps = {
  register: UseFormRegister<MovimientoContableFormData>;
  watch: UseFormWatch<MovimientoContableFormData>;
  errors: FieldErrors<MovimientoContableFormData>;
  categoriasContables: CategoriaContable[];
};

const inputClassName =
  "w-full rounded-xl border border-secondary-dark/60 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const tipoLabels = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
} as const;

const categoriaTipoLabels = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  AMBAS: "Ambas",
} as const;

export default function MovimientoContableForm({
  register,
  watch,
  errors,
  categoriasContables,
}: MovimientoContableFormProps) {
  const selectedTipo = watch("tipo");
  const filteredCategorias = categoriasContables.filter((categoria) => categoriaMatchesMovimientoTipo(categoria.tipo, selectedTipo));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Datos del movimiento</h3>
        <p className="mt-1 text-sm text-slate-500">Registrá ingresos y egresos operativos del club. El usuario creador se guarda automáticamente.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Tipo</label>
          <select
            {...register("tipo", {
              required: "El tipo es obligatorio",
            })}
            className={inputClassName}
          >
            <option value="">Seleccionar tipo</option>
            {movimientoContableTipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipoLabels[tipo]}
              </option>
            ))}
          </select>
          {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            {...register("fecha", {
              required: "La fecha es obligatoria",
            })}
            className={inputClassName}
          />
          {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Monto</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register("monto", {
              required: "El monto es obligatorio",
              valueAsNumber: true,
              validate: (value) => Number(value) > 0 || "El monto debe ser mayor a 0",
            })}
            className={inputClassName}
            placeholder="Ej: 25000"
          />
          {errors.monto && <p className="text-xs text-red-500">{errors.monto.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Categoría</label>
          <select
            {...register("categoria", {
              required: "La categoría es obligatoria",
            })}
            className={inputClassName}
            disabled={selectedTipo === ""}
          >
            <option value="">{selectedTipo === "" ? "Primero seleccioná un tipo" : "Seleccionar categoría"}</option>
            {filteredCategorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>
                {categoria.nombre} · {categoriaTipoLabels[categoria.tipo]}
              </option>
            ))}
          </select>
          {errors.categoria && <p className="text-xs text-red-500">{errors.categoria.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <label className="text-sm font-medium text-slate-700">Concepto</label>
          <input
            type="text"
            {...register("concepto", {
              required: "El concepto es obligatorio",
              validate: (value) => value.trim().length > 0 || "El concepto es obligatorio",
            })}
            className={inputClassName}
            placeholder="Ej: Compra de combustible"
          />
          {errors.concepto && <p className="text-xs text-red-500">{errors.concepto.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2 xl:col-span-4">
          <label className="text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            rows={4}
            {...register("observaciones")}
            className={`${inputClassName} resize-none`}
            placeholder="Detalle opcional para auditoría interna"
          />
          {errors.observaciones && <p className="text-xs text-red-500">{errors.observaciones.message}</p>}
        </div>
      </div>
    </div>
  );
}

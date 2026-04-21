import type { CategoriaContableFormData, CategoriaContableTipo } from "@/types/index";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { categoriaContableTipos } from "@/types/index";

type CategoriaContableFormProps = {
  register: UseFormRegister<CategoriaContableFormData>;
  errors: FieldErrors<CategoriaContableFormData>;
};

const inputClassName =
  "w-full rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const tipoLabels: Record<CategoriaContableTipo, string> = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  AMBAS: "Ambas",
};

export default function CategoriaContableForm({ register, errors }: CategoriaContableFormProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Datos de la categoría</h3>
        <p className="mt-1 text-sm text-slate-500">Definí el nombre y cómo se usará la categoría dentro del sistema contable.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nombre</label>

          <input
            type="text"
            {...register("nombre", {
              required: "El nombre es obligatorio",
              validate: (value) => value.trim().length > 0 || "El nombre es obligatorio",
            })}
            className={inputClassName}
            placeholder="Ej: Cuotas societarias"
          />

          {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Tipo</label>

          <select
            {...register("tipo", {
              required: "El tipo es obligatorio",
            })}
            className={inputClassName}
          >
            <option value="">Seleccionar tipo</option>
            {categoriaContableTipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipoLabels[tipo]}
              </option>
            ))}
          </select>

          {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
        </div>
      </div>
    </div>
  );
}

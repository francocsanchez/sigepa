import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { UsuarioFormData, UsuarioRole } from "@/types/index";
import { usuarioRoles } from "@/types/index";

type UsuarioFormProps = {
  register: UseFormRegister<UsuarioFormData>;
  errors: FieldErrors<UsuarioFormData>;
};

const inputClassName =
  "w-full rounded-xl border border-secondary-dark/60 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const roleLabels: Record<UsuarioRole, string> = {
  admin: "Admin",
  secretaria: "Secretaria",
  instructor: "Instructor",
  paracaidista: "Paracaidista",
  socio: "Socio",
  piloto: "Piloto",
  contable: "Contable",
};

export default function UsuarioForm({ register, errors }: UsuarioFormProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Datos personales</h3>
        <p className="mt-1 text-sm text-slate-500">Completá la información básica y de contacto del usuario.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Nombre</label>

          <input
            type="text"
            {...register("name", {
              required: "El nombre es obligatorio",
            })}
            className={inputClassName}
            placeholder="Ej: Juan"
          />

          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Apellido</label>

          <input
            type="text"
            {...register("lastName", {
              required: "El apellido es obligatorio",
            })}
            className={inputClassName}
            placeholder="Ej: Pérez"
          />

          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>

          <input
            type="email"
            {...register("email", {
              required: "El email es obligatorio",
            })}
            className={inputClassName}
            placeholder="Ej: usuario@email.com"
          />

          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">DNI</label>

          <input
            type="number"
            {...register("dni", {
              required: "El DNI es obligatorio",
              valueAsNumber: true,
            })}
            className={inputClassName}
            placeholder="Ej: 12345678"
          />

          {errors.dni && <p className="text-xs text-red-500">{errors.dni.message}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">Permisos y estado</h3>
        <p className="mt-1 text-sm text-slate-500">Podés asignar más de un rol y definir si el usuario queda activo.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-secondary-dark/60 bg-secondary/20 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Roles</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {usuarioRoles.map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 rounded-xl border border-secondary-dark/50 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  value={role}
                  {...register("role", {
                    validate: (value) => value.length > 0 || "Seleccione al menos un rol",
                  })}
                  className="h-4 w-4 rounded border-secondary-dark text-primary focus:ring-primary"
                />
                <span>{roleLabels[role]}</span>
              </label>
            ))}
          </div>

          {errors.role && <p className="mt-2 text-xs text-red-500">{errors.role.message}</p>}
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-secondary-dark/60 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" {...register("enable")} className="h-4 w-4 rounded border-secondary-dark text-primary focus:ring-primary" />
          <span>Usuario habilitado</span>
        </label>
      </div>
    </div>
  );
}

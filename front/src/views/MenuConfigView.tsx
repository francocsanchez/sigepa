import useRoleGuard from "@/hooks/useRoleGuard";
import { ChevronRight, FolderOpen, HandCoins, Users } from "lucide-react";
import { Link } from "react-router-dom";

const configItems = [
  {
    title: "Usuarios",
    description: "Configura accesos, permisos y cuentas del equipo.",
    href: "/config/usuarios",
    icon: Users,
  },
  {
    title: "Categorías contables",
    description: "Administrá las categorías para ingresos, egresos y usos mixtos.",
    href: "/config/categorias-contables",
    icon: FolderOpen,
  },
  {
    title: "Cuotas",
    description: "Generá y consultá las cuotas sociales por año y por mes.",
    href: "/config/cuotas",
    icon: HandCoins,
    allowedRoles: ["admin", "secretaria", "contable"],
  },
];

export default function MenuConfigView() {
  const { allowed: canManageCuotas } = useRoleGuard(["admin", "secretaria", "contable"]);
  const visibleItems = configItems.filter((item) => !item.allowedRoles || canManageCuotas);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Administración</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Centro de control</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid  gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.href}
                className="group flex min-h-[200px] flex-col rounded-[1.75rem] border border-secondary-dark/70 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(15,12,10,0.18)] transition-all duration-200 hover:border-primary/30 hover:shadow-[0_26px_60px_-46px_rgba(255,122,0,0.18)]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.9} />
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-primary">
                  <span>Abrir sección</span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

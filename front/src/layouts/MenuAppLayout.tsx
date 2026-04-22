import useRoleGuard from "@/hooks/useRoleGuard";
import { useQueryClient } from "@tanstack/react-query";
import { BanknoteArrowUp, LayoutDashboard, LogOut, Plane, Settings, UserCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Contabilidad",
    href: "/contabilidad",
    icon: BanknoteArrowUp,
  },
  {
    label: "Vuelos",
    href: "/vuelos",
    icon: Plane,
  },
  {
    label: "Administración",
    href: "/config",
    icon: Settings,
  },
];

export default function MenuAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("AUTH_TOKEN");
    queryClient.removeQueries({ queryKey: ["auth-user"] });
    navigate("/login", { replace: true });
  };

  const { allowed: canShowConfig } = useRoleGuard(["admin", "secretaria"]);
  const { allowed: canShowAccounting } = useRoleGuard(["admin", "contable"]);
  const { allowed: canShowFlights } = useRoleGuard(["admin", "secretaria"]);

  return (
    <aside className="sticky top-0 flex h-screen w-full max-w-sm flex-col overflow-y-auto border-r border-[#2e241f] bg-[#171311] px-4 py-5 text-[#f7e4d1] sm:px-5 lg:w-2/12 lg:min-w-[270px]">
      <div className="mb-8 px-2">
        <div className="mx-auto flex w-full max-w-[180px] flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#f6c9a6]">Sistema de Gestion</p>
          <h1 className="mt-2 text-[2rem] font-black uppercase tracking-[0.16em] text-white">
            SI<span className="text-primary">.</span>GE<span className="text-primary">.</span>PA<span className="text-primary">.</span>
          </h1>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navigationItems
          .filter((item) => {
            if (item.href === "/config") return canShowConfig;
            if (item.href === "/contabilidad") return canShowAccounting;
            if (item.href === "/vuelos") return canShowFlights;
            return true;
          })
          .map((item) => {
            const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#241c18] text-[#ff8a1c] shadow-[0_14px_30px_-24px_rgba(255,122,0,0.55)]"
                    : "text-[#d8c2b2] hover:bg-[#211916] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? "border-primary/20 bg-[#2c221d] text-primary"
                      : "border-[#3a2d27] bg-[#1d1714] text-[#a99789] group-hover:border-[#5a463d] group-hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" strokeWidth={1.9} />
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto pt-6">
        <Link
          to="/profile"
          className="group flex items-center gap-3 rounded-xl border border-[#3a2d27] bg-[#1d1714] px-3 py-2.5 shadow-[0_20px_50px_-45px_rgba(0,0,0,0.9)] transition-colors hover:border-primary/30 hover:bg-[#241c18]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <UserCircle2 className="h-4.5 w-4.5" strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9f8b7f]">Mi perfil</p>
            <p className="truncate text-sm font-semibold text-[#fff7f1]">SI.GE.PA Admin</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-[#3a2d27] bg-[#14110f] px-3 py-2.5 text-sm font-medium text-[#d8c2b2] transition-colors hover:border-rose-400/30 hover:bg-[#241616] hover:text-rose-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1916] text-[#b9a79a]">
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

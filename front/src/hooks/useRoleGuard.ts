import { useAuth } from "./useAuth";
import type { UsuarioRole } from "@/types/index";

export default function useRoleGuard(allowedRoles: UsuarioRole[]) {
  const { user } = useAuth();

  const roles = user?.role ?? [];

  const hasAccess = roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    return {
      allowed: false,
      message: "No posee permisos para acceder a esta sección.",
    };
  }

  return {
    allowed: true,
    message: null,
  };
}

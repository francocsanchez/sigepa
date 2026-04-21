import { useAuth } from "@/hooks/useAuth";
import type { UsuarioRole } from "@/types/index";
import { Navigate, Outlet } from "react-router-dom";

type RoleProtectedRouteProps = {
  allowedRoles: UsuarioRole[];
};

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isError } = useAuth();

  if (isLoading) return null;

  if (isError || !isAuthenticated || !user) {
    localStorage.removeItem("AUTH_TOKEN");
    return <Navigate to="/login" replace />;
  }

  const userRoles = user.role;
  const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}

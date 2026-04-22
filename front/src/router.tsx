import LoadingSpinner from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "./layouts/ProtectedRoute";
import RoleProtectedRoute from "./layouts/RoleProtectedRoute";

const DashboardView = lazy(() => import("./views/DashboardView"));
const MenuConfigView = lazy(() => import("./views/MenuConfigView"));
const ListUsuariosView = lazy(() => import("./views/usuarios/ListUsuariosView"));
const CreateUsuarioView = lazy(() => import("./views/usuarios/CreateUsuarioView"));
const EditUsuarioView = lazy(() => import("./views/usuarios/EditUsuarioView"));
const UsuarioView = lazy(() => import("./views/usuarios/UsuarioView"));
const ListCategoriasContablesView = lazy(() => import("./views/categorias-contables/ListCategoriasContablesView"));
const CreateCategoriaContableView = lazy(() => import("./views/categorias-contables/CreateCategoriaContableView"));
const EditCategoriaContableView = lazy(() => import("./views/categorias-contables/EditCategoriaContableView"));
const CategoriaContableView = lazy(() => import("./views/categorias-contables/CategoriaContableView"));
const ListMovimientosContablesView = lazy(() => import("./views/movimientos-contables/ListMovimientosContablesView"));
const CreateMovimientoContableView = lazy(() => import("./views/movimientos-contables/CreateMovimientoContableView"));
const ListCuotasView = lazy(() => import("./views/cuotas/ListCuotasView"));
const LoginView = lazy(() => import("./views/auth/LoginView"));
const NotFound = lazy(() => import("./views/NotFound"));
const NoAutorizado = lazy(() => import("./views/NoAutorizado"));
const MiPerfilView = lazy(() => import("./views/auth/MiPerfilView"));
const MisVuelosView = lazy(() => import("./views/auth/MisVuelosView"));
const CuentaCorrienteView = lazy(() => import("./views/auth/CuentaCorrienteView"));
const ListVuelosView = lazy(() => import("./views/vuelos/ListVuelosView"));
const ListTodosVuelosView = lazy(() => import("./views/vuelos/ListTodosVuelosView"));
const VueloDetailView = lazy(() => import("./views/vuelos/VueloDetailView"));

const RouteFallback = <LoadingSpinner label="Cargando vista..." className="min-h-screen" />;

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={RouteFallback}>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardView />} />
              <Route path="/profile" element={<MiPerfilView />} />
              <Route path="/profile/vuelos" element={<MisVuelosView />} />
              <Route path="/profile/cuenta-corriente" element={<CuentaCorrienteView />} />
              <Route path="/no-autorizado" element={<NoAutorizado />} />

              <Route element={<RoleProtectedRoute allowedRoles={["admin", "contable"]} />}>
                <Route path="/contabilidad" element={<ListMovimientosContablesView />} />
                <Route path="/contabilidad/create" element={<CreateMovimientoContableView />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={["admin", "secretaria"]} />}>
                <Route path="/config" element={<MenuConfigView />} />
                <Route path="/vuelos" element={<ListVuelosView />} />
                <Route path="/vuelos/todos" element={<ListTodosVuelosView />} />
                <Route path="/vuelos/:idVuelo" element={<VueloDetailView />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/config/usuarios" element={<ListUsuariosView />} />
                <Route path="/config/usuarios/create" element={<CreateUsuarioView />} />
                <Route path="/config/usuarios/:idUsuario" element={<UsuarioView />} />
                <Route path="/config/usuarios/:idUsuario/editar" element={<EditUsuarioView />} />
                <Route path="/config/categorias-contables" element={<ListCategoriasContablesView />} />
                <Route path="/config/categorias-contables/create" element={<CreateCategoriaContableView />} />
                <Route path="/config/categorias-contables/:idCategoriaContable" element={<CategoriaContableView />} />
                <Route path="/config/categorias-contables/:idCategoriaContable/editar" element={<EditCategoriaContableView />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={["admin", "secretaria"]} />}>
                <Route path="/config/cuotas" element={<ListCuotasView />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

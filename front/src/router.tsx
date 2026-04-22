import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import MenuConfigView from "./views/MenuConfigView";
import ListUsuariosView from "./views/usuarios/ListUsuariosView";
import CreateUsuarioView from "./views/usuarios/CreateUsuarioView";
import EditUsuarioView from "./views/usuarios/EditUsuarioView";
import UsuarioView from "./views/usuarios/UsuarioView";
import ListCategoriasContablesView from "./views/categorias-contables/ListCategoriasContablesView";
import CreateCategoriaContableView from "./views/categorias-contables/CreateCategoriaContableView";
import EditCategoriaContableView from "./views/categorias-contables/EditCategoriaContableView";
import CategoriaContableView from "./views/categorias-contables/CategoriaContableView";
import ListMovimientosContablesView from "./views/movimientos-contables/ListMovimientosContablesView";
import CreateMovimientoContableView from "./views/movimientos-contables/CreateMovimientoContableView";
import ListCuotasView from "./views/cuotas/ListCuotasView";

import LoginView from "./views/auth/LoginView";
import NotFound from "./views/NotFound";
import ProtectedRoute from "./layouts/ProtectedRoute";
import NoAutorizado from "./views/NoAutorizado";
import MiPerfilView from "./views/auth/MiPerfilView";
import RoleProtectedRoute from "./layouts/RoleProtectedRoute";
import CuentaCorrienteView from "./views/auth/CuentaCorrienteView";
import ListVuelosView from "./views/vuelos/ListVuelosView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<MiPerfilView />} />
            <Route path="/profile/cuenta-corriente" element={<CuentaCorrienteView />} />
            <Route path="/no-autorizado" element={<NoAutorizado />} />

            <Route path="/config" element={<MenuConfigView />} />
            <Route path="/config/usuarios" element={<ListUsuariosView />} />
            <Route path="/config/usuarios/create" element={<CreateUsuarioView />} />
            <Route path="/config/usuarios/:idUsuario" element={<UsuarioView />} />
            <Route path="/config/usuarios/:idUsuario/editar" element={<EditUsuarioView />} />
            <Route path="/config/categorias-contables" element={<ListCategoriasContablesView />} />
            <Route path="/config/categorias-contables/create" element={<CreateCategoriaContableView />} />
            <Route path="/config/categorias-contables/:idCategoriaContable" element={<CategoriaContableView />} />
            <Route path="/config/categorias-contables/:idCategoriaContable/editar" element={<EditCategoriaContableView />} />

            <Route element={<RoleProtectedRoute allowedRoles={["admin", "secretaria", "contable"]} />}>
              <Route path="/config/cuotas" element={<ListCuotasView />} />
              <Route path="/contabilidad" element={<ListMovimientosContablesView />} />
              <Route path="/contabilidad/create" element={<CreateMovimientoContableView />} />
              <Route path="/vuelos" element={<ListVuelosView />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

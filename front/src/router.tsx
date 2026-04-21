import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import MenuConfigView from "./views/MenuConfigView";
import ListUsuariosView from "./views/usuarios/ListUsuariosView";
import CreateUsuarioView from "./views/usuarios/CreateUsuarioView";
import EditUsuarioView from "./views/usuarios/EditUsuarioView";
import UsuarioView from "./views/usuarios/UsuarioView";

import LoginView from "./views/auth/LoginView";
import NotFound from "./views/NotFound";
import ProtectedRoute from "./layouts/ProtectedRoute";
import NoAutorizado from "./views/NoAutorizado";
import MiPerfilView from "./views/auth/MiPerfilView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<MiPerfilView />} />
            <Route path="/no-autorizado" element={<NoAutorizado />} />

            <Route path="/config" element={<MenuConfigView />} />
            <Route path="/config/usuarios" element={<ListUsuariosView />} />
            <Route path="/config/usuarios/create" element={<CreateUsuarioView />} />
            <Route path="/config/usuarios/:idUsuario" element={<UsuarioView />} />
            <Route path="/config/usuarios/:idUsuario/editar" element={<EditUsuarioView />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

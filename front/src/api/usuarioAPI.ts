import api from "@/libs/axios";
import type {
  AuthenticatedUser,
  AuthenticatedUserResponse,
  UpdateUsuarioByIdParams,
  Usuario,
  UsuarioFormData,
  UsuarioListResponse,
  UsuarioMutationResponse,
  UsuarioResponse,
} from "@/types/index";
import { isAxiosError } from "axios";

export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const { data } = await api.get<UsuarioListResponse>("/usuarios");

    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener los usuarios");
    }

    throw new Error("Error al obtener los usuarios");
  }
}

export async function changeStatusUsuario(idUsuario: string): Promise<UsuarioMutationResponse> {
  try {
    const { data } = await api.patch<UsuarioMutationResponse>(`/usuarios/${idUsuario}/change-status`);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al cambiar el estado del usuario");
    }

    throw new Error("Error al cambiar el estado del usuario");
  }
}

export async function createUsuario(formData: UsuarioFormData): Promise<UsuarioMutationResponse> {
  try {
    const { data } = await api.post<UsuarioMutationResponse>("/usuarios", formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al crear el usuario");
    }
    throw new Error("Error inesperado al crear el usuario");
  }
}

export async function getUsuarioByID(idUsuario: string): Promise<Usuario> {
  try {
    const { data } = await api.get<UsuarioResponse>(`/usuarios/${idUsuario}`);

    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener el usuario");
    }

    throw new Error("Error al obtener el usuario");
  }
}

export async function updateUsuarioById({ formData, idUsuario }: UpdateUsuarioByIdParams): Promise<UsuarioMutationResponse> {
  try {
    const { data } = await api.put<UsuarioMutationResponse>(`/usuarios/${idUsuario}`, formData);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al actualizar el usuario");
    }

    throw new Error("Error al actualizar el usuario");
  }
}

export async function getMe(): Promise<AuthenticatedUser | null> {
  const token = localStorage.getItem("AUTH_TOKEN");
  if (!token) return null;

  const { data } = await api.get<AuthenticatedUserResponse>("/usuarios/me");
  return data.data;
}

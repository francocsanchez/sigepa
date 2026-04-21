import api from "@/libs/axios";
import type {
  CategoriaContable,
  CategoriaContableListResponse,
  CategoriaContableMutationResponse,
  CategoriaContableResponse,
  CategoriaContableFormData,
  UpdateCategoriaContableByIdParams,
} from "@/types/index";
import { isAxiosError } from "axios";

export async function getCategoriasContables(includeDisabled = false): Promise<CategoriaContable[]> {
  try {
    const { data } = await api.get<CategoriaContableListResponse>("/categorias-contables", {
      params: includeDisabled ? { includeDisabled: true } : undefined,
    });

    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener las categorías contables");
    }

    throw new Error("Error al obtener las categorías contables");
  }
}

export async function changeStatusCategoriaContable(idCategoriaContable: string): Promise<CategoriaContableMutationResponse> {
  try {
    const { data } = await api.patch<CategoriaContableMutationResponse>(`/categorias-contables/${idCategoriaContable}/change-status`);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || error.response.data.message || "Error al cambiar el estado de la categoría contable",
      );
    }

    throw new Error("Error al cambiar el estado de la categoría contable");
  }
}

export async function createCategoriaContable(formData: CategoriaContableFormData): Promise<CategoriaContableMutationResponse> {
  try {
    const payload = {
      nombre: formData.nombre.trim(),
      tipo: formData.tipo,
    };

    const { data } = await api.post<CategoriaContableMutationResponse>("/categorias-contables", payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al crear la categoría contable");
    }

    throw new Error("Error al crear la categoría contable");
  }
}

export async function getCategoriaContableByID(idCategoriaContable: string): Promise<CategoriaContable> {
  try {
    const { data } = await api.get<CategoriaContableResponse>(`/categorias-contables/${idCategoriaContable}`);

    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener la categoría contable");
    }

    throw new Error("Error al obtener la categoría contable");
  }
}

export async function updateCategoriaContableById({
  formData,
  idCategoriaContable,
}: UpdateCategoriaContableByIdParams): Promise<CategoriaContableMutationResponse> {
  try {
    const payload = {
      nombre: formData.nombre.trim(),
      tipo: formData.tipo,
    };

    const { data } = await api.put<CategoriaContableMutationResponse>(`/categorias-contables/${idCategoriaContable}`, payload);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || error.response.data.message || "Error al actualizar la categoría contable",
      );
    }

    throw new Error("Error al actualizar la categoría contable");
  }
}

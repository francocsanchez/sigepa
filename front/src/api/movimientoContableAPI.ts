import api from "@/libs/axios";
import type {
  BalanceContable,
  BalanceContableResponse,
  MovimientoContable,
  MovimientoContableFormData,
  MovimientoContableListResponse,
  MovimientoContableMutationResponse,
  MovimientoContableResponse,
  UpdateMovimientoContableByIdParams,
} from "@/types/index";
import { isAxiosError } from "axios";

export async function getMovimientosContables(): Promise<MovimientoContable[]> {
  try {
    const { data } = await api.get<MovimientoContableListResponse>("/movimientos-contables");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener los movimientos contables");
    }

    throw new Error("Error al obtener los movimientos contables");
  }
}

export async function createMovimientoContable(formData: MovimientoContableFormData): Promise<MovimientoContableMutationResponse> {
  try {
    const payload = {
      tipo: formData.tipo,
      fecha: formData.fecha,
      monto: Number(formData.monto),
      concepto: formData.concepto.trim(),
      categoria: formData.categoria,
      observaciones: formData.observaciones.trim(),
    };

    const { data } = await api.post<MovimientoContableMutationResponse>("/movimientos-contables", payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al crear el movimiento contable");
    }

    throw new Error("Error al crear el movimiento contable");
  }
}

export async function getMovimientoContableByID(idMovimientoContable: string): Promise<MovimientoContable> {
  try {
    const { data } = await api.get<MovimientoContableResponse>(`/movimientos-contables/${idMovimientoContable}`);
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener el movimiento contable");
    }

    throw new Error("Error al obtener el movimiento contable");
  }
}

export async function updateMovimientoContableById({
  formData,
  idMovimientoContable,
}: UpdateMovimientoContableByIdParams): Promise<MovimientoContableMutationResponse> {
  try {
    const payload = {
      tipo: formData.tipo,
      fecha: formData.fecha,
      monto: Number(formData.monto),
      concepto: formData.concepto.trim(),
      categoria: formData.categoria,
      observaciones: formData.observaciones.trim(),
    };

    const { data } = await api.put<MovimientoContableMutationResponse>(`/movimientos-contables/${idMovimientoContable}`, payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al actualizar el movimiento contable");
    }

    throw new Error("Error al actualizar el movimiento contable");
  }
}

export async function deleteMovimientoContableById(idMovimientoContable: string): Promise<MovimientoContableMutationResponse> {
  try {
    const { data } = await api.delete<MovimientoContableMutationResponse>(`/movimientos-contables/${idMovimientoContable}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al anular el movimiento contable");
    }

    throw new Error("Error al anular el movimiento contable");
  }
}

export async function getBalanceContable(): Promise<BalanceContable> {
  try {
    const { data } = await api.get<BalanceContableResponse>("/movimientos-contables/balance");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener el balance contable");
    }

    throw new Error("Error al obtener el balance contable");
  }
}

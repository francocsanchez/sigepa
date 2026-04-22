import api from "@/libs/axios";
import type { CuotaAnual, CuotaAnualResponse, GenerarCuotasFormData, GenerarCuotasResponse, PagarCuotaResponse } from "@/types/index";
import { isAxiosError } from "axios";

export async function getCuotasByYear(ano: number): Promise<CuotaAnual> {
  try {
    const { data } = await api.get<CuotaAnualResponse>("/cuotas", {
      params: { ano },
    });

    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener las cuotas");
    }

    throw new Error("Error al obtener las cuotas");
  }
}

export async function generateCuotas(formData: GenerarCuotasFormData): Promise<GenerarCuotasResponse> {
  try {
    const { data } = await api.post<GenerarCuotasResponse>("/cuotas/generate", formData);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al generar las cuotas");
    }

    throw new Error("Error al generar las cuotas");
  }
}

export async function payCuota(idCuota: string): Promise<PagarCuotaResponse> {
  try {
    const { data } = await api.patch<PagarCuotaResponse>(`/cuotas/${idCuota}/pay`);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al registrar el pago de la cuota");
    }

    throw new Error("Error al registrar el pago de la cuota");
  }
}

import api from "@/libs/axios";
import type { CuentaCorriente, CuentaCorrienteResponse } from "@/types/index";
import { isAxiosError } from "axios";

export async function getMyCuentaCorriente(): Promise<CuentaCorriente> {
  try {
    const { data } = await api.get<CuentaCorrienteResponse>("/cuenta-corriente/me");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener la cuenta corriente");
    }

    throw new Error("Error al obtener la cuenta corriente");
  }
}

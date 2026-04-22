import api from "@/libs/axios";
import type {
  PagarVuelosPayload,
  PagarVuelosResponse,
  MiVuelo,
  MisVuelosResponse,
  Vuelo,
  VueloCargo,
  VueloCargoListResponse,
  VueloFormData,
  VueloListResponse,
  VueloMutationResponse,
  VueloResponse,
} from "@/types/index";
import { isAxiosError } from "axios";

export async function getVuelos(): Promise<Vuelo[]> {
  try {
    const { data } = await api.get<VueloListResponse>("/vuelos");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener los vuelos");
    }

    throw new Error("Error al obtener los vuelos");
  }
}

export async function getMisVuelos(): Promise<MiVuelo[]> {
  try {
    const { data } = await api.get<MisVuelosResponse>("/vuelos/mis-vuelos");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener tus vuelos");
    }

    throw new Error("Error al obtener tus vuelos");
  }
}

export async function getVueloById(idVuelo: string): Promise<Vuelo> {
  try {
    const { data } = await api.get<VueloResponse>(`/vuelos/${idVuelo}`);
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener el vuelo");
    }

    throw new Error("Error al obtener el vuelo");
  }
}

export async function createVuelo(formData: VueloFormData): Promise<VueloMutationResponse> {
  try {
    const payload = {
      fecha: formData.fecha,
      pilotos: formData.pilotos.filter(Boolean),
      paracaidistas: formData.paracaidistas.map((item: VueloFormData["paracaidistas"][number]) => ({
        usuario: item.usuario,
        alquiler: Number(item.alquiler || 0),
        valorSalto: Number(item.valorSalto || 0),
        tipoSalto: item.tipoSalto,
      })),
    };

    const { data } = await api.post<VueloMutationResponse>("/vuelos", payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al registrar el vuelo");
    }

    throw new Error("Error al registrar el vuelo");
  }
}

export async function getPendingVueloCargos(): Promise<VueloCargo[]> {
  try {
    const { data } = await api.get<VueloCargoListResponse>("/vuelos/cargos/pendientes");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al obtener cargos pendientes");
    }

    throw new Error("Error al obtener cargos pendientes");
  }
}

export async function payVueloCargos(payload: PagarVuelosPayload): Promise<PagarVuelosResponse> {
  try {
    const { data } = await api.post<PagarVuelosResponse>("/vuelos/cargos/pagar", payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || error.response.data.message || "Error al registrar el pago");
    }

    throw new Error("Error al registrar el pago");
  }
}

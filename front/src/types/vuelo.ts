import type { MovimientoContable } from "./movimientoContable";
import type { Usuario } from "./usuario";

export const vueloTipoSaltos = ["SALTO_BAJO", "MEDIO_SALTO", "SALTO_COMPLETO"] as const;
export const vueloCargoTipos = ["SALTO", "ALQUILER"] as const;
export const vueloCargoEstados = ["PENDIENTE", "PAGADO"] as const;

export type VueloTipoSalto = (typeof vueloTipoSaltos)[number];
export type VueloCargoTipo = (typeof vueloCargoTipos)[number];
export type VueloCargoEstado = (typeof vueloCargoEstados)[number];

export type VueloParacaidistaFormItem = {
  usuario: string;
  alquiler: number | "";
  valorSalto: number | "";
  tipoSalto: VueloTipoSalto;
};

export type VueloFormData = {
  fecha: string;
  pilotos: string[];
  paracaidistas: VueloParacaidistaFormItem[];
};

export type VueloParacaidista = {
  usuario: Pick<Usuario, "_id" | "name" | "lastName" | "email" | "role" | "enable">;
  alquiler: number;
  valorSalto: number;
  tipoSalto: VueloTipoSalto;
};

export type VueloCargo = {
  _id: string;
  vuelo: {
    _id: string;
    fecha: string;
  };
  usuario: Pick<Usuario, "_id" | "name" | "lastName" | "email" | "role" | "enable">;
  fecha: string;
  categoria: {
    _id: string;
    nombre: string;
    tipo: string;
    key?: string | null;
  };
  tipoCargo: VueloCargoTipo;
  monto: number;
  estado: VueloCargoEstado;
  pagoMovimiento?: Pick<MovimientoContable, "_id" | "fecha" | "monto" | "concepto" | "tipo"> | null;
  paidAt?: string;
  enable: boolean;
};

export type Vuelo = {
  _id: string;
  fecha: string;
  pilotos: Pick<Usuario, "_id" | "name" | "lastName" | "email" | "role" | "enable">[];
  paracaidistas: VueloParacaidista[];
  cargos: VueloCargo[];
  resumenCobranza: {
    total: number;
    pendiente: number;
    pagado: number;
  };
  enable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VueloListResponse = {
  data: Vuelo[];
};

export type VueloResponse = {
  data: Vuelo;
  message?: string;
};

export type VueloMutationResponse = {
  data: Vuelo | null;
  message: string;
};

export type VueloCargoListResponse = {
  data: VueloCargo[];
};

export type PagarVuelosPayload = {
  cargoIds: string[];
  fechaPago?: string;
};

export type PagarVuelosResponse = {
  data: VueloCargo[];
  message: string;
};

export type MiVuelo = {
  _id: string;
  fecha: string;
  pilotos: Pick<Usuario, "_id" | "name" | "lastName" | "email" | "role" | "enable">[];
  miSalto: {
    alquiler: number;
    valorSalto: number;
    tipoSalto: VueloTipoSalto;
  } | null;
  companeros: Pick<Usuario, "_id" | "name" | "lastName" | "email" | "role" | "enable">[];
  cargos: VueloCargo[];
  resumenCobranza: {
    total: number;
    pendiente: number;
    pagado: number;
  };
};

export type MisVuelosResponse = {
  data: MiVuelo[];
};

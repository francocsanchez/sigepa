export const cuotaEstados = ["PENDIENTE", "PAGADA"] as const;

export type CuotaEstado = (typeof cuotaEstados)[number];

export type CuotaUsuario = {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  enable: boolean;
};

export type Cuota = {
  _id: string;
  usuario: CuotaUsuario;
  mes: number;
  ano: number;
  monto: number;
  estado: CuotaEstado;
  enable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CuotaFila = {
  usuario: CuotaUsuario;
  meses: {
    mes: number;
    cuota: Cuota | null;
  }[];
};

export type CuotaAnual = {
  ano: number;
  filas: CuotaFila[];
};

export type CuotaAnualResponse = {
  data: CuotaAnual;
};

export type GenerarCuotasFormData = {
  mes: number;
  ano: number;
  monto: number;
};

export type GenerarCuotasResponse = {
  data: {
    ano: number;
    mes: number;
    generadas: number;
    omitidas: number;
  } | null;
  message: string;
};

export type PagarCuotaResponse = {
  data: Cuota | null;
  message: string;
};

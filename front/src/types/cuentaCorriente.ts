export type CuentaCorrienteOrigen = "CUOTA" | "MOVIMIENTO" | "VUELO";
export type CuentaCorrienteTipo = "DEBITO" | "CREDITO";
export type CuentaCorrienteEstado = "PENDIENTE" | "PAGADA" | "REGISTRADO";

export type CuentaCorrienteMovimiento = {
  id: string;
  fecha: string;
  descripcion: string;
  detalle: string;
  origen: CuentaCorrienteOrigen;
  tipo: CuentaCorrienteTipo;
  estado: CuentaCorrienteEstado;
  monto: number;
  referenciaId: string;
  periodo?: {
    mes: number;
    ano: number;
  };
  categoria?: {
    _id: string;
    nombre: string;
    tipo: string;
  } | null;
  vuelo?: {
    _id: string;
    fecha: string;
    tipoCargo: "SALTO" | "ALQUILER";
  };
};

export type CuentaCorrienteResumen = {
  cuotasPendientes: number;
  montoCuotasPendientes: number;
  cuotasAbonadas: number;
  vuelosPendientes: number;
  montoVuelosPendientes: number;
  vuelosPagados: number;
  deudaPendienteTotal: number;
  saldoCuenta: number;
  totalMovimientos: number;
};

export type CuentaCorriente = {
  resumen: CuentaCorrienteResumen;
  movimientos: CuentaCorrienteMovimiento[];
};

export type CuentaCorrienteResponse = {
  data: CuentaCorriente;
  message?: string;
};

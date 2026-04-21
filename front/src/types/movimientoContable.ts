import type { CategoriaContable, CategoriaContableTipo } from "./categoriaContable";

export const movimientoContableTipos = ["INGRESO", "EGRESO"] as const;

export type MovimientoContableTipo = (typeof movimientoContableTipos)[number];

export type MovimientoContableCategoria = Pick<CategoriaContable, "_id" | "nombre" | "tipo">;

export type MovimientoContableCreatedBy = {
  _id: string;
  name: string;
  lastName: string;
  email: string;
};

export type MovimientoContable = {
  _id: string;
  tipo: MovimientoContableTipo;
  fecha: string;
  monto: number;
  concepto: string;
  categoria: MovimientoContableCategoria;
  usuario?: string | null;
  observaciones: string;
  createdBy: MovimientoContableCreatedBy;
  enable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MovimientoContableFormData = {
  tipo: MovimientoContableTipo | "";
  fecha: string;
  monto: number | "";
  concepto: string;
  categoria: string;
  observaciones: string;
};

export type MovimientoContableListResponse = {
  data: MovimientoContable[];
};

export type MovimientoContableMutationResponse = {
  data: MovimientoContable | null;
  message: string;
};

export type MovimientoContableResponse = {
  data: MovimientoContable;
  message?: string;
};

export type UpdateMovimientoContableByIdParams = {
  idMovimientoContable: string;
  formData: MovimientoContableFormData;
};

export type BalanceContable = {
  key: string;
  totalIngresos: number;
  totalEgresos: number;
  saldoActual: number;
};

export type BalanceContableResponse = {
  data: BalanceContable;
  message?: string;
};

export const categoriaMatchesMovimientoTipo = (
  categoriaTipo: CategoriaContableTipo,
  movimientoTipo: MovimientoContableTipo | "",
) => movimientoTipo !== "" && (categoriaTipo === "AMBAS" || categoriaTipo === movimientoTipo);

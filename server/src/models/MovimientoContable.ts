import { Schema, model, Document, Types } from "mongoose";
import { categoriaContableTipo } from "./CategoriaContable";

export const movimientoContableTipo = {
  INGRESO: categoriaContableTipo.INGRESO,
  EGRESO: categoriaContableTipo.EGRESO,
} as const;

export type MovimientoContableTipo = (typeof movimientoContableTipo)[keyof typeof movimientoContableTipo];

export interface IMovimientoContable extends Document {
  tipo: MovimientoContableTipo;
  fecha: Date;
  monto: number;
  concepto: string;
  categoria: Types.ObjectId;
  usuario?: Types.ObjectId;
  observaciones: string;
  createdBy: Types.ObjectId;
  enable: boolean;
}

const MovimientoContableSchema: Schema = new Schema<IMovimientoContable>(
  {
    tipo: { type: String, required: true, enum: Object.values(movimientoContableTipo) },
    fecha: { type: Date, required: true },
    monto: { type: Number, required: true, min: 0 },
    concepto: { type: String, required: true, trim: true },
    categoria: { type: Schema.Types.ObjectId, ref: "categoriasContables", required: true },
    usuario: { type: Schema.Types.ObjectId, ref: "usuarios", required: false },
    observaciones: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    enable: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<IMovimientoContable>("movimientosContables", MovimientoContableSchema);

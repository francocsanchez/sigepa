import { Schema, model, Document, Types } from "mongoose";

export const cuotaEstado = {
  PENDIENTE: "PENDIENTE",
  PAGADA: "PAGADA",
} as const;

export type CuotaEstado = (typeof cuotaEstado)[keyof typeof cuotaEstado];

export interface ICuota extends Document {
  usuario: Types.ObjectId;
  mes: number;
  ano: number;
  monto: number;
  estado: CuotaEstado;
  enable: boolean;
}

const CuotaSchema: Schema = new Schema<ICuota>(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    ano: { type: Number, required: true, min: 2000 },
    monto: { type: Number, required: true, min: 0 },
    estado: { type: String, required: true, enum: Object.values(cuotaEstado), default: cuotaEstado.PENDIENTE },
    enable: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

CuotaSchema.index({ usuario: 1, mes: 1, ano: 1 }, { unique: true });

export default model<ICuota>("cuotas", CuotaSchema);

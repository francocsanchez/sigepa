import { Schema, model, Document, Types } from "mongoose";

export const vueloCargoTipo = {
  SALTO: "SALTO",
  ALQUILER: "ALQUILER",
} as const;

export const vueloCargoEstado = {
  PENDIENTE: "PENDIENTE",
  PAGADO: "PAGADO",
} as const;

export type VueloCargoTipo = (typeof vueloCargoTipo)[keyof typeof vueloCargoTipo];
export type VueloCargoEstado = (typeof vueloCargoEstado)[keyof typeof vueloCargoEstado];

export interface IVueloCargo extends Document {
  vuelo: Types.ObjectId;
  usuario: Types.ObjectId;
  fecha: Date;
  categoria: Types.ObjectId;
  tipoCargo: VueloCargoTipo;
  monto: number;
  estado: VueloCargoEstado;
  pagoMovimiento?: Types.ObjectId;
  paidAt?: Date;
  paidBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  enable: boolean;
}

const VueloCargoSchema = new Schema<IVueloCargo>(
  {
    vuelo: { type: Schema.Types.ObjectId, ref: "vuelos", required: true },
    usuario: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    fecha: { type: Date, required: true },
    categoria: { type: Schema.Types.ObjectId, ref: "categoriasContables", required: true },
    tipoCargo: { type: String, required: true, enum: Object.values(vueloCargoTipo) },
    monto: { type: Number, required: true, min: 0 },
    estado: { type: String, required: true, enum: Object.values(vueloCargoEstado), default: vueloCargoEstado.PENDIENTE },
    pagoMovimiento: { type: Schema.Types.ObjectId, ref: "movimientosContables", required: false },
    paidAt: { type: Date, required: false },
    paidBy: { type: Schema.Types.ObjectId, ref: "usuarios", required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    enable: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<IVueloCargo>("vuelosCargos", VueloCargoSchema);

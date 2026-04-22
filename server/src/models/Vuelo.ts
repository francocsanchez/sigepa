import { Schema, model, Document, Types } from "mongoose";

export const vueloTipoSalto = {
  SALTO_BAJO: "SALTO_BAJO",
  MEDIO_SALTO: "MEDIO_SALTO",
  SALTO_COMPLETO: "SALTO_COMPLETO",
} as const;

export type VueloTipoSalto = (typeof vueloTipoSalto)[keyof typeof vueloTipoSalto];

export interface IVueloParacaidista {
  usuario: Types.ObjectId;
  alquiler: number;
  valorSalto: number;
  tipoSalto: VueloTipoSalto;
}

export interface IVuelo extends Document {
  fecha: Date;
  pilotos: Types.ObjectId[];
  paracaidistas: IVueloParacaidista[];
  createdBy: Types.ObjectId;
  enable: boolean;
}

const VueloParacaidistaSchema = new Schema<IVueloParacaidista>(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    alquiler: { type: Number, required: true, min: 0, default: 0 },
    valorSalto: { type: Number, required: true, min: 0, default: 0 },
    tipoSalto: { type: String, required: true, enum: Object.values(vueloTipoSalto) },
  },
  { _id: false },
);

const VueloSchema = new Schema<IVuelo>(
  {
    fecha: { type: Date, required: true },
    pilotos: {
      type: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
      required: true,
      validate: {
        validator: (pilotos: Types.ObjectId[]) => Array.isArray(pilotos) && pilotos.length >= 1 && pilotos.length <= 2,
        message: "Debe indicar entre uno y dos pilotos",
      },
    },
    paracaidistas: {
      type: [VueloParacaidistaSchema],
      required: true,
      validate: {
        validator: (paracaidistas: IVueloParacaidista[]) => Array.isArray(paracaidistas) && paracaidistas.length > 0,
        message: "Debe indicar al menos un paracaidista",
      },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "usuarios", required: true },
    enable: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<IVuelo>("vuelos", VueloSchema);

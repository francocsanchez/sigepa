import { Schema, model, Document } from "mongoose";

export const categoriaContableTipo = {
  INGRESO: "INGRESO",
  EGRESO: "EGRESO",
  AMBAS: "AMBAS",
} as const;

export type CategoriaContableTipo = (typeof categoriaContableTipo)[keyof typeof categoriaContableTipo];

export interface ICategoriaContable extends Document {
  nombre: string;
  tipo: CategoriaContableTipo;
  key?: string | null;
  isSystem: boolean;
  enable: boolean;
}

const CategoriaContableSchema: Schema = new Schema<ICategoriaContable>(
  {
    nombre: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: Object.values(categoriaContableTipo) },
    key: { type: String, trim: true, uppercase: true, unique: true, sparse: true, default: null },
    isSystem: { type: Boolean, required: true, default: false },
    enable: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<ICategoriaContable>("categoriasContables", CategoriaContableSchema);

import { Schema, model, Document } from "mongoose";

export interface IConfig extends Document {
  email: string;
  direccion: string;
  lat: string;
  long: string;
  valorSalto: number;
  valorEquipo: number;
  valorCuota: number;
  bancoTitular: string;
  bancoAlias: string;
  bancoCBU: string;
  bancoMercadoPagoAlias: string;
  bancoMercadoPagoCBU: string;
  telefono: string;
  facebook: string;
  instragram: string;
}

const ConfigSchema: Schema = new Schema<IConfig>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    direccion: { type: String, required: true, trim: true },
    lat: { type: String, required: true, trim: true },
    long: { type: String, required: true, trim: true },
    valorSalto: { type: Number, required: true },
    valorEquipo: { type: Number, required: true },
    valorCuota: { type: Number, required: true },
    bancoTitular: { type: String, required: true, trim: true },
    bancoAlias: { type: String, required: true, trim: true },
    bancoCBU: { type: String, required: true, trim: true },
    bancoMercadoPagoAlias: { type: String, required: true, trim: true },
    bancoMercadoPagoCBU: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    facebook: { type: String, required: true, trim: true },
    instragram: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  },
);

export default model<IConfig>("configuraciones", ConfigSchema);

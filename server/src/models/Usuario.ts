import { Schema, model, Document } from "mongoose";

export const userRole = {
  ADMIN: "admin",
  PARACAIDISTA: "paracaidista",
  SOCIO: "socio",
  PILOTO: "piloto",
  SUPERVISOR: "supervisor",
  CONTABLE: "contable",
} as const;

export type userRole = (typeof userRole)[keyof typeof userRole];

export interface IUsuario extends Document {
  email: string;
  enable: boolean;
  password: string;
  role: userRole[];
  name: string;
  lastName: string;
  dni: Number;
  telefono: string;
  licenciaFAP: string;
  direccion: string;
  nacionalidad: string;
  fechaNacimiento: string;
  contactoEmergencia: string;
  grupoSanguineo: string;
  obraSocial: string;
}

const UsuarioSchema: Schema = new Schema<IUsuario>(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    dni: { type: Number, required: true, unique: true },
    telefono: { type: String },
    licenciaFAP: { type: String },
    direccion: { type: String },
    nacionalidad: { type: String },
    fechaNacimiento: { type: String },
    contactoEmergencia: { type: String },
    grupoSanguineo: { type: String },
    obraSocial: { type: String },
    enable: { type: Boolean, required: true, default: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: [String],
      default: ["socio"],
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUsuario>("usuarios", UsuarioSchema);

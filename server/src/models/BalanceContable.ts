import { Schema, model, Document } from "mongoose";

export interface IBalanceContable extends Document {
  key: string;
  totalIngresos: number;
  totalEgresos: number;
  saldoActual: number;
}

const BalanceContableSchema: Schema = new Schema<IBalanceContable>(
  {
    key: { type: String, required: true, unique: true, default: "general" },
    totalIngresos: { type: Number, required: true, default: 0 },
    totalEgresos: { type: Number, required: true, default: 0 },
    saldoActual: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

export default model<IBalanceContable>("balancesContables", BalanceContableSchema);

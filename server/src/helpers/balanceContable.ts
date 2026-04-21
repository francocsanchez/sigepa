import BalanceContable from "../models/BalanceContable";
import { movimientoContableTipo, type MovimientoContableTipo } from "../models/MovimientoContable";

const BALANCE_KEY = "general";

const buildSignedDelta = (tipo: MovimientoContableTipo, monto: number) =>
  tipo === movimientoContableTipo.INGRESO ? monto : -monto;

export async function applyBalanceDelta(tipo: MovimientoContableTipo, monto: number) {
  const signedDelta = buildSignedDelta(tipo, monto);

  await BalanceContable.findOneAndUpdate(
    { key: BALANCE_KEY },
    {
      $inc: {
        totalIngresos: tipo === movimientoContableTipo.INGRESO ? monto : 0,
        totalEgresos: tipo === movimientoContableTipo.EGRESO ? monto : 0,
        saldoActual: signedDelta,
      },
      $setOnInsert: { key: BALANCE_KEY },
    },
    { upsert: true, new: true },
  );
}

export async function revertBalanceDelta(tipo: MovimientoContableTipo, monto: number) {
  const signedDelta = buildSignedDelta(tipo, monto);

  await BalanceContable.findOneAndUpdate(
    { key: BALANCE_KEY },
    {
      $inc: {
        totalIngresos: tipo === movimientoContableTipo.INGRESO ? -monto : 0,
        totalEgresos: tipo === movimientoContableTipo.EGRESO ? -monto : 0,
        saldoActual: -signedDelta,
      },
      $setOnInsert: { key: BALANCE_KEY },
    },
    { upsert: true, new: true },
  );
}

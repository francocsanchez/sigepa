import { Request, Response } from "express";
import Cuota, { cuotaEstado } from "../models/Cuota";
import MovimientoContable, { movimientoContableTipo } from "../models/MovimientoContable";
import { logError } from "../utils/logError";

type CuentaCorrienteItem = {
  id: string;
  fecha: Date;
  descripcion: string;
  detalle: string;
  origen: "CUOTA" | "MOVIMIENTO";
  tipo: "DEBITO" | "CREDITO";
  estado: "PENDIENTE" | "PAGADA" | "REGISTRADO";
  monto: number;
  referenciaId: string;
  periodo?: {
    mes: number;
    ano: number;
  };
  categoria?: {
    _id: string;
    nombre: string;
    tipo: string;
  } | null;
};

const buildCuotaDescription = (mes: number, ano: number) => `Cuota social ${String(mes).padStart(2, "0")}/${ano}`;

export class CuentaCorrienteController {
  static getMyAccountStatement = async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;

      const [cuotas, movimientos] = await Promise.all([
        Cuota.find({ usuario: userId, enable: true }).sort({ ano: -1, mes: -1, createdAt: -1 }).lean(),
        MovimientoContable.find({ usuario: userId, enable: true })
          .sort({ fecha: -1, createdAt: -1 })
          .populate([
            { path: "categoria", select: "nombre tipo" },
            { path: "createdBy", select: "name lastName email" },
          ])
          .lean(),
      ]);

      const cuotasPendientes = cuotas.filter((cuota) => cuota.estado === cuotaEstado.PENDIENTE);
      const cuotasAbonadas = cuotas.filter((cuota) => cuota.estado === cuotaEstado.PAGADA);

      const cuotaItems: CuentaCorrienteItem[] = cuotas.map((cuota) => ({
        id: `cuota-${String(cuota._id)}`,
        fecha: (cuota as any).createdAt ?? new Date(cuota.ano, cuota.mes - 1, 1),
        descripcion: buildCuotaDescription(cuota.mes, cuota.ano),
        detalle:
          cuota.estado === cuotaEstado.PAGADA ? "Cargo generado y abonado" : "Cargo generado pendiente de pago",
        origen: "CUOTA",
        tipo: "DEBITO",
        estado: cuota.estado,
        monto: cuota.monto,
        referenciaId: String(cuota._id),
        periodo: {
          mes: cuota.mes,
          ano: cuota.ano,
        },
      }));

      const movimientoItems: CuentaCorrienteItem[] = movimientos.map((movimiento: any) => ({
        id: `movimiento-${String(movimiento._id)}`,
        fecha: movimiento.fecha,
        descripcion: movimiento.concepto,
        detalle: movimiento.categoria?.nombre || "Movimiento sin categoría",
        origen: "MOVIMIENTO",
        tipo: movimiento.tipo === movimientoContableTipo.INGRESO ? "CREDITO" : "DEBITO",
        estado: "REGISTRADO",
        monto: movimiento.monto,
        referenciaId: String(movimiento._id),
        categoria: movimiento.categoria
          ? {
              _id: String(movimiento.categoria._id),
              nombre: movimiento.categoria.nombre,
              tipo: movimiento.categoria.tipo,
            }
          : null,
      }));

      const movimientosCuenta = [...cuotaItems, ...movimientoItems].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      const saldoCuenta = movimientosCuenta.reduce((acc, item) => acc + (item.tipo === "CREDITO" ? item.monto : -item.monto), 0);

      return res.status(200).json({
        data: {
          resumen: {
            cuotasPendientes: cuotasPendientes.length,
            montoCuotasPendientes: cuotasPendientes.reduce((acc, cuota) => acc + cuota.monto, 0),
            cuotasAbonadas: cuotasAbonadas.length,
            saldoCuenta,
            totalMovimientos: movimientosCuenta.length,
          },
          movimientos: movimientosCuenta,
        },
      });
    } catch (error) {
      logError("CuentaCorrienteController.getMyAccountStatement");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

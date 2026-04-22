import { Request, Response } from "express";
import { applyBalanceDelta } from "../helpers/balanceContable";
import { systemCategoriaKey } from "../helpers/systemCategories";
import CategoriaContable, { categoriaContableTipo } from "../models/CategoriaContable";
import Cuota from "../models/Cuota";
import MovimientoContable, { movimientoContableTipo } from "../models/MovimientoContable";
import Usuario from "../models/Usuario";
import { logError } from "../utils/logError";

const USER_PROJECTION = "name lastName email enable";

const buildYearMatrix = (usuarios: Array<{ _id: string; name: string; lastName: string; email: string; enable: boolean }>, cuotas: any[]) => {
  const cuotasByUser = new Map<string, Map<number, any>>();

  cuotas.forEach((cuota) => {
    const userId = String(cuota.usuario._id);
    const userMap = cuotasByUser.get(userId) || new Map<number, any>();
    userMap.set(cuota.mes, cuota);
    cuotasByUser.set(userId, userMap);
  });

  return usuarios.map((usuario) => {
    const userCuotas = cuotasByUser.get(String(usuario._id)) || new Map<number, any>();

    return {
      usuario,
      meses: Array.from({ length: 12 }, (_, index) => {
        const mes = index + 1;

        return {
          mes,
          cuota: userCuotas.get(mes) || null,
        };
      }),
    };
  });
};

export class CuotaController {
  static generate = async (req: Request, res: Response) => {
    try {
      const { mes, ano, monto } = req.body;

      const usuariosActivos = await Usuario.find({ enable: true }, "_id").lean();

      if (usuariosActivos.length === 0) {
        return res.status(200).json({
          data: {
            ano,
            mes,
            generadas: 0,
            omitidas: 0,
          },
          message: "No hay usuarios activos para generar cuotas",
        });
      }

      const usuarioIds = usuariosActivos.map((usuario) => usuario._id);
      const cuotasExistentes = await Cuota.find({
        usuario: { $in: usuarioIds },
        mes,
        ano,
      })
        .select("usuario")
        .lean();

      const existingUserIds = new Set(cuotasExistentes.map((cuota) => String(cuota.usuario)));
      const cuotasToCreate = usuariosActivos
        .filter((usuario) => !existingUserIds.has(String(usuario._id)))
        .map((usuario) => ({
          usuario: usuario._id,
          mes,
          ano,
          monto,
        }));

      if (cuotasToCreate.length > 0) {
        await Cuota.insertMany(cuotasToCreate, { ordered: false });
      }

      return res.status(201).json({
        data: {
          ano,
          mes,
          generadas: cuotasToCreate.length,
          omitidas: cuotasExistentes.length,
        },
        message:
          cuotasToCreate.length > 0
            ? "Cuotas generadas correctamente"
            : "Las cuotas de ese período ya estaban generadas para todos los usuarios activos",
      });
    } catch (error) {
      logError("CuotaController.generate");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static getByYear = async (req: Request, res: Response) => {
    try {
      const ano = Number(req.query.ano);

      const usuariosActivos = await Usuario.find({ enable: true }, USER_PROJECTION).sort({ lastName: 1, name: 1 }).lean();

      const cuotas = await Cuota.find({
        ano,
        enable: true,
        usuario: { $in: usuariosActivos.map((usuario) => usuario._id) },
      })
        .sort({ mes: 1 })
        .populate({ path: "usuario", select: USER_PROJECTION })
        .lean();

      return res.status(200).json({
        data: {
          ano,
          filas: buildYearMatrix(usuariosActivos as any, cuotas),
        },
      });
    } catch (error) {
      logError("CuotaController.getByYear");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static pay = async (req: Request, res: Response) => {
    try {
      const { idCuota } = req.params;

      const cuota = await Cuota.findById(idCuota).populate({ path: "usuario", select: USER_PROJECTION });

      if (!cuota || !cuota.enable) {
        return res.status(404).json({
          data: null,
          message: "Cuota no encontrada",
        });
      }

      if (cuota.estado === "PAGADA") {
        return res.status(400).json({
          data: null,
          message: "La cuota ya se encuentra pagada",
        });
      }

      const categoriaCuotaSocial = await CategoriaContable.findOne({ key: systemCategoriaKey.CUOTA_SOCIAL }).lean();

      if (!categoriaCuotaSocial || !categoriaCuotaSocial.enable || categoriaCuotaSocial.tipo === categoriaContableTipo.EGRESO) {
        return res.status(400).json({
          data: null,
          message: "La categoría contable de cuota social no está disponible",
        });
      }

      const usuario = cuota.usuario as any;
      const concepto = `Abono de cuota (${cuota.mes}/${cuota.ano}) - ${usuario.lastName}, ${usuario.name}`;

      const movimiento = new MovimientoContable({
        tipo: movimientoContableTipo.INGRESO,
        fecha: new Date(),
        monto: cuota.monto,
        concepto,
        categoria: categoriaCuotaSocial._id,
        usuario: usuario._id,
        observaciones: "",
        createdBy: req.user!._id,
      });

      await movimiento.save();
      await applyBalanceDelta(movimientoContableTipo.INGRESO, cuota.monto);

      cuota.estado = "PAGADA";
      await cuota.save();

      const cuotaActualizada = await Cuota.findById(idCuota).populate({ path: "usuario", select: USER_PROJECTION }).lean();

      return res.status(200).json({
        data: cuotaActualizada,
        message: "Pago de cuota registrado correctamente",
      });
    } catch (error) {
      logError("CuotaController.pay");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

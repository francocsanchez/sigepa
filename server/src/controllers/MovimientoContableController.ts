import { Request, Response } from "express";
import CategoriaContable, { categoriaContableTipo } from "../models/CategoriaContable";
import MovimientoContable from "../models/MovimientoContable";
import Usuario from "../models/Usuario";
import { logError } from "../utils/logError";

const MOVIMIENTO_POPULATE = [
  { path: "categoria", select: "nombre tipo" },
  { path: "usuario", select: "name lastName email dni" },
  { path: "createdBy", select: "name lastName email" },
];

const validateCategoriaForTipo = async (categoriaId: string, tipo: string) => {
  const categoria = await CategoriaContable.findById(categoriaId).lean();

  if (!categoria || !categoria.enable) {
    return { error: "La categoría no existe o está deshabilitada" };
  }

  if (categoria.tipo !== categoriaContableTipo.AMBAS && categoria.tipo !== tipo) {
    return { error: "La categoría no corresponde al tipo de movimiento" };
  }

  return { categoria };
};

const validateUsuarioIfPresent = async (usuarioId?: string) => {
  if (!usuarioId) return null;

  const usuario = await Usuario.findById(usuarioId).lean();

  if (!usuario || !usuario.enable) {
    return { error: "El usuario relacionado no existe o está deshabilitado" };
  }

  return { usuario };
};

export class MovimientoContableController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const movimientos = await MovimientoContable.find({ enable: true })
        .sort({ fecha: -1, createdAt: -1 })
        .populate(MOVIMIENTO_POPULATE)
        .lean();

      return res.status(200).json({
        data: movimientos,
      });
    } catch (error) {
      logError("MovimientoContableController.getAll");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const { tipo, fecha, monto, concepto, categoria, usuario, observaciones } = req.body;

      const categoriaValidation = await validateCategoriaForTipo(categoria, tipo);
      if (categoriaValidation?.error) {
        return res.status(400).json({
          data: null,
          message: categoriaValidation.error,
        });
      }

      const usuarioValidation = await validateUsuarioIfPresent(usuario);
      if (usuarioValidation?.error) {
        return res.status(400).json({
          data: null,
          message: usuarioValidation.error,
        });
      }

      const movimiento = new MovimientoContable({
        tipo,
        fecha,
        monto,
        concepto,
        categoria,
        usuario,
        observaciones,
        createdBy: req.user._id,
      });

      await movimiento.save();

      const createdMovimiento = await MovimientoContable.findById(movimiento._id).populate(MOVIMIENTO_POPULATE).lean();

      return res.status(201).json({
        data: createdMovimiento,
        message: "Movimiento contable creado correctamente",
      });
    } catch (error) {
      logError("MovimientoContableController.create");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static updateByID = async (req: Request, res: Response) => {
    const { idMovimientoContable } = req.params;

    try {
      const { tipo, fecha, monto, concepto, categoria, usuario, observaciones } = req.body;

      const existingMovimiento = await MovimientoContable.findById(idMovimientoContable);

      if (!existingMovimiento || !existingMovimiento.enable) {
        return res.status(404).json({
          data: null,
          message: "Movimiento contable no encontrado",
        });
      }

      const categoriaValidation = await validateCategoriaForTipo(categoria, tipo);
      if (categoriaValidation?.error) {
        return res.status(400).json({
          data: null,
          message: categoriaValidation.error,
        });
      }

      const usuarioValidation = await validateUsuarioIfPresent(usuario);
      if (usuarioValidation?.error) {
        return res.status(400).json({
          data: null,
          message: usuarioValidation.error,
        });
      }

      existingMovimiento.tipo = tipo;
      existingMovimiento.fecha = fecha;
      existingMovimiento.monto = monto;
      existingMovimiento.concepto = concepto;
      existingMovimiento.categoria = categoria;
      existingMovimiento.usuario = usuario || undefined;
      existingMovimiento.observaciones = observaciones || "";
      await existingMovimiento.save();

      const updatedMovimiento = await MovimientoContable.findById(idMovimientoContable).populate(MOVIMIENTO_POPULATE).lean();

      return res.status(200).json({
        data: updatedMovimiento,
        message: "Movimiento contable actualizado correctamente",
      });
    } catch (error) {
      logError("MovimientoContableController.updateByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static deleteByID = async (req: Request, res: Response) => {
    const { idMovimientoContable } = req.params;

    try {
      const movimiento = await MovimientoContable.findById(idMovimientoContable);

      if (!movimiento || !movimiento.enable) {
        return res.status(404).json({
          data: null,
          message: "Movimiento contable no encontrado",
        });
      }

      movimiento.enable = false;
      await movimiento.save();

      return res.status(200).json({
        data: null,
        message: "Movimiento contable eliminado correctamente",
      });
    } catch (error) {
      logError("MovimientoContableController.deleteByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

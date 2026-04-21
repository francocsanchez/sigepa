import { Request, Response } from "express";
import CategoriaContable from "../models/CategoriaContable";
import { logError } from "../utils/logError";

export class CategoriaContableController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const includeDisabled = req.query.includeDisabled === "true";
      const filters = includeDisabled ? {} : { enable: true };
      const categorias = await CategoriaContable.find(filters).sort({ nombre: 1 }).lean();

      return res.status(200).json({
        data: categorias,
      });
    } catch (error) {
      logError("CategoriaContableController.getAll");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static getByID = async (req: Request, res: Response) => {
    const { idCategoriaContable } = req.params;

    try {
      const categoria = await CategoriaContable.findById(idCategoriaContable).lean();

      if (!categoria) {
        return res.status(404).json({
          data: null,
          message: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        data: categoria,
      });
    } catch (error) {
      logError("CategoriaContableController.getByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const { nombre, tipo } = req.body;
      const normalizedNombre = nombre.trim();

      const existingCategoria = await CategoriaContable.findOne({
        nombre: { $regex: `^${normalizedNombre}$`, $options: "i" },
      }).lean();

      if (existingCategoria) {
        return res.status(400).json({
          data: null,
          message: "La categoría ya existe",
        });
      }

      const categoria = new CategoriaContable({
        nombre: normalizedNombre,
        tipo,
      });

      await categoria.save();

      return res.status(201).json({
        data: categoria,
        message: "Categoría creada correctamente",
      });
    } catch (error) {
      logError("CategoriaContableController.create");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static updateByID = async (req: Request, res: Response) => {
    const { idCategoriaContable } = req.params;

    try {
      const { nombre, tipo } = req.body;
      const normalizedNombre = nombre.trim();

      const existingCategoria = await CategoriaContable.findOne({
        _id: { $ne: idCategoriaContable },
        nombre: { $regex: `^${normalizedNombre}$`, $options: "i" },
      }).lean();

      if (existingCategoria) {
        return res.status(400).json({
          data: null,
          message: "La categoría ya existe",
        });
      }

      const categoria = await CategoriaContable.findByIdAndUpdate(
        idCategoriaContable,
        {
          nombre: normalizedNombre,
          tipo,
        },
        { new: true },
      ).lean();

      if (!categoria) {
        return res.status(404).json({
          data: null,
          message: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        data: categoria,
        message: "Categoría actualizada correctamente",
      });
    } catch (error) {
      logError("CategoriaContableController.updateByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static deleteByID = async (req: Request, res: Response) => {
    const { idCategoriaContable } = req.params;

    try {
      const categoria = await CategoriaContable.findById(idCategoriaContable);

      if (!categoria) {
        return res.status(404).json({
          data: null,
          message: "Categoría no encontrada",
        });
      }

      categoria.enable = false;
      await categoria.save();

      return res.status(200).json({
        data: null,
        message: "Categoría eliminada correctamente",
      });
    } catch (error) {
      logError("CategoriaContableController.deleteByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static changeStatus = async (req: Request, res: Response) => {
    const { idCategoriaContable } = req.params;

    try {
      const categoria = await CategoriaContable.findById(idCategoriaContable);

      if (!categoria) {
        return res.status(404).json({
          data: null,
          message: "Categoría no encontrada",
        });
      }

      categoria.enable = !categoria.enable;
      await categoria.save();

      return res.status(200).json({
        data: categoria,
        message: `Categoría ${categoria.enable ? "habilitada" : "deshabilitada"} correctamente`,
      });
    } catch (error) {
      logError("CategoriaContableController.changeStatus");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

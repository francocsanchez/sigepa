import { Request, Response } from "express";
import Config from "../models/Config";
import { logError } from "../utils/logError";

export class ConfigController {
  static get = async (req: Request, res: Response) => {
    try {
      const config = await Config.findOne().lean();

      if (!config) {
        return res.status(404).json({
          data: null,
          message: "La configuración no fue inicializada",
        });
      }

      return res.status(200).json({
        data: config,
      });
    } catch (error) {
      logError("ConfigController.get");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const existingConfig = await Config.findOne().lean();

      if (existingConfig) {
        return res.status(400).json({
          data: null,
          message: "Las variables de configuración ya fueron inicializadas",
        });
      }

      const config = new Config(req.body);
      await config.save();

      return res.status(201).json({
        data: config,
        message: "Configuración inicializada correctamente",
      });
    } catch (error) {
      logError("ConfigController.create");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const config = await Config.findOne();

      if (!config) {
        return res.status(404).json({
          data: null,
          message: "La configuración no fue inicializada",
        });
      }

      Object.assign(config, req.body);
      await config.save();

      return res.status(200).json({
        data: config,
        message: "Configuración actualizada correctamente",
      });
    } catch (error) {
      logError("ConfigController.update");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

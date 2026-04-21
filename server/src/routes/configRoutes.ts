import { Router } from "express";
import { ConfigController } from "../controllers/ConfigController";
import { handleImputErrors } from "../middleware/validation";
import { createValidationConfig, updateValidationConfig } from "../validation/config";

const router = Router();

/**
 * @method GET
 * @route /
 * @params Ninguno.
 * @description Obtiene la configuración del sistema.
 */
router.get("/", ConfigController.get);

/**
 * @method POST
 * @route /
 * @params Ninguno.
 * @description Inicializa la configuración del sistema una sola vez.
 */
router.post("/", createValidationConfig, handleImputErrors, ConfigController.create);

/**
 * @method PUT
 * @route /
 * @params Ninguno.
 * @description Actualiza la configuración del sistema.
 */
router.put("/", updateValidationConfig, handleImputErrors, ConfigController.update);

export default router;

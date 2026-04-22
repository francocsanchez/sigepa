import { Router } from "express";
import { VueloController } from "../controllers/VueloController";
import { authenticate } from "../middleware/authenticate";
import { handleImputErrors } from "../middleware/validation";
import { createValidationVuelo, payVueloCargoValidation } from "../validation/vuelos";

const router = Router();

router.use(authenticate);

router.get("/", VueloController.getAll);
router.get("/cargos/pendientes", VueloController.getPendingCharges);
router.post("/", createValidationVuelo, handleImputErrors, VueloController.create);
router.post("/cargos/pagar", payVueloCargoValidation, handleImputErrors, VueloController.payCharges);

export default router;

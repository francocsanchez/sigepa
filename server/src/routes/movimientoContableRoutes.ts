import { Router } from "express";
import { MovimientoContableController } from "../controllers/MovimientoContableController";
import { authenticate } from "../middleware/authenticate";
import { handleImputErrors } from "../middleware/validation";
import {
  createValidationMovimientoContable,
  idValidationMovimientoContable,
  updateValidationMovimientoContable,
} from "../validation/movimientosContables";

const router = Router();

router.use(authenticate);

router.get("/", MovimientoContableController.getAll);
router.post("/", createValidationMovimientoContable, handleImputErrors, MovimientoContableController.create);
router.put("/:idMovimientoContable", updateValidationMovimientoContable, handleImputErrors, MovimientoContableController.updateByID);
router.delete("/:idMovimientoContable", idValidationMovimientoContable, handleImputErrors, MovimientoContableController.deleteByID);

export default router;

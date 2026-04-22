import { Router } from "express";
import { CuentaCorrienteController } from "../controllers/CuentaCorrienteController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/me", CuentaCorrienteController.getMyAccountStatement);

export default router;

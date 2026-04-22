import { Router } from "express";
import { CuotaController } from "../controllers/CuotaController";
import { authenticate } from "../middleware/authenticate";
import { handleImputErrors } from "../middleware/validation";
import { generateValidationCuota, listValidationCuota, payValidationCuota } from "../validation/cuotas";

const router = Router();

router.use(authenticate);

router.get("/", listValidationCuota, handleImputErrors, CuotaController.getByYear);
router.post("/generate", generateValidationCuota, handleImputErrors, CuotaController.generate);
router.patch("/:idCuota/pay", payValidationCuota, handleImputErrors, CuotaController.pay);

export default router;

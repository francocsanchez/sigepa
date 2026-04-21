import { Router } from "express";
import { CategoriaContableController } from "../controllers/CategoriaContableController";
import { authenticate } from "../middleware/authenticate";
import { handleImputErrors } from "../middleware/validation";
import {
  createValidationCategoriaContable,
  idValidationCategoriaContable,
  updateValidationCategoriaContable,
} from "../validation/categoriasContables";

const router = Router();

router.use(authenticate);

router.get("/", CategoriaContableController.getAll);
router.post("/", createValidationCategoriaContable, handleImputErrors, CategoriaContableController.create);
router.put("/:idCategoriaContable", updateValidationCategoriaContable, handleImputErrors, CategoriaContableController.updateByID);
router.delete("/:idCategoriaContable", idValidationCategoriaContable, handleImputErrors, CategoriaContableController.deleteByID);

export default router;

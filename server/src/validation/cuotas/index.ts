import { body, param, query } from "express-validator";

export const generateValidationCuota = [
  body("mes").notEmpty().withMessage("El mes es obligatorio").isInt({ min: 1, max: 12 }).withMessage("El mes no es válido").toInt(),
  body("ano").notEmpty().withMessage("El año es obligatorio").isInt({ min: 2000, max: 3000 }).withMessage("El año no es válido").toInt(),
  body("monto")
    .notEmpty()
    .withMessage("El monto es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El monto debe ser un número positivo")
    .toFloat(),
];

export const listValidationCuota = [
  query("ano").notEmpty().withMessage("El año es obligatorio").isInt({ min: 2000, max: 3000 }).withMessage("El año no es válido").toInt(),
];

export const payValidationCuota = [param("idCuota").isMongoId().withMessage("ID de cuota no válido")];

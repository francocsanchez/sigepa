import { body, param } from "express-validator";
import { movimientoContableTipo } from "../../models/MovimientoContable";

const allowedTipos = Object.values(movimientoContableTipo);

const movimientoBodyValidation = [
  body("tipo").notEmpty().withMessage("El tipo es obligatorio").isIn(allowedTipos).withMessage("El tipo no es válido"),
  body("fecha").notEmpty().withMessage("La fecha es obligatoria").isISO8601().withMessage("La fecha no es válida").toDate(),
  body("monto").notEmpty().withMessage("El monto es obligatorio").isFloat({ gt: 0 }).withMessage("El monto debe ser un número positivo").toFloat(),
  body("concepto").notEmpty().withMessage("El concepto es obligatorio").trim(),
  body("categoria").notEmpty().withMessage("La categoría es obligatoria").isMongoId().withMessage("La categoría no es válida"),
  body("usuario").optional({ values: "falsy" }).isMongoId().withMessage("El usuario no es válido"),
  body("observaciones").optional().trim(),
];

export const idValidationMovimientoContable = [
  param("idMovimientoContable").isMongoId().withMessage("ID de movimiento contable no válido"),
];

export const createValidationMovimientoContable = movimientoBodyValidation;

export const updateValidationMovimientoContable = [
  param("idMovimientoContable").isMongoId().withMessage("ID de movimiento contable no válido"),
  ...movimientoBodyValidation,
];

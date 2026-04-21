import { body, param } from "express-validator";
import { categoriaContableTipo } from "../../models/CategoriaContable";

const allowedTipos = Object.values(categoriaContableTipo);

export const idValidationCategoriaContable = [
  param("idCategoriaContable").isMongoId().withMessage("ID de categoría contable no válido"),
];

export const createValidationCategoriaContable = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
  body("tipo").notEmpty().withMessage("El tipo es obligatorio").isIn(allowedTipos).withMessage("El tipo no es válido"),
];

export const updateValidationCategoriaContable = [
  param("idCategoriaContable").isMongoId().withMessage("ID de categoría contable no válido"),
  body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
  body("tipo").notEmpty().withMessage("El tipo es obligatorio").isIn(allowedTipos).withMessage("El tipo no es válido"),
];

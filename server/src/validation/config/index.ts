import { body } from "express-validator";

const configFieldsValidation = [
  body("email").notEmpty().withMessage("El email es obligatorio").isEmail().withMessage("El email no es válido").normalizeEmail(),
  body("direccion").notEmpty().withMessage("La dirección es obligatoria").trim(),
  body("lat").notEmpty().withMessage("La latitud es obligatoria").trim(),
  body("long").notEmpty().withMessage("La longitud es obligatoria").trim(),
  body("valorSalto").notEmpty().withMessage("El valor del salto es obligatorio").isNumeric().withMessage("El valor del salto debe ser numérico").toFloat(),
  body("valorEquipo").notEmpty().withMessage("El valor del equipo es obligatorio").isNumeric().withMessage("El valor del equipo debe ser numérico").toFloat(),
  body("valorCuota").notEmpty().withMessage("El valor de la cuota es obligatorio").isNumeric().withMessage("El valor de la cuota debe ser numérico").toFloat(),
  body("bancoTitular").notEmpty().withMessage("El titular del banco es obligatorio").trim(),
  body("bancoAlias").notEmpty().withMessage("El alias del banco es obligatorio").trim(),
  body("bancoCBU").notEmpty().withMessage("El CBU del banco es obligatorio").trim(),
  body("bancoMercadoPagoAlias").notEmpty().withMessage("El alias de Mercado Pago es obligatorio").trim(),
  body("bancoMercadoPagoCBU").notEmpty().withMessage("El CBU de Mercado Pago es obligatorio").trim(),
  body("telefono").notEmpty().withMessage("El teléfono es obligatorio").trim(),
  body("facebook").notEmpty().withMessage("El Facebook es obligatorio").trim(),
  body("instragram").notEmpty().withMessage("El Instagram es obligatorio").trim(),
];

export const createValidationConfig = configFieldsValidation;
export const updateValidationConfig = configFieldsValidation;

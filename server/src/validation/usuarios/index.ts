import { body, param } from "express-validator";
import { userRole } from "../../models/Usuario";

const allowedRoles = Object.values(userRole);

const roleValidation = body("role")
  .optional()
  .custom((value) => {
    const roles = Array.isArray(value) ? value : [value];
    return roles.length > 0 && roles.every((role) => allowedRoles.includes(role));
  })
  .withMessage("El rol no es válido");

export const idValidationUsuario = [param("idUsuario").isMongoId().withMessage("ID de usuario no válido")];

export const updateValidationUsuario = [
  param("idUsuario").isMongoId().withMessage("ID de usuario no válido"),
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .trim()
    .escape(),
  body("lastName")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .trim()
    .escape(),
  body("email").notEmpty().withMessage("El email es obligatorio").isEmail().withMessage("El email no es válido").normalizeEmail(),
  body("dni").notEmpty().withMessage("El DNI es obligatorio").isNumeric().withMessage("El DNI debe ser numérico").toInt(),
  body("telefono").optional().trim(),
  body("licenciaFAP").optional().trim(),
  body("direccion").optional().trim(),
  body("nacionalidad").optional().trim(),
  body("fechaNacimiento").optional().trim(),
  body("fechaVencimientoCMA").optional().trim(),
  body("fechaVencimientoLicencia").optional().trim(),
  body("contactoEmergencia").optional().trim(),
  body("grupoSanguineo").optional().trim(),
  body("obraSocial").optional().trim(),
  body("enable").optional().isBoolean().withMessage("El estado debe ser booleano").toBoolean(),
  roleValidation,
];

export const createValidationUsuario = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .trim()
    .escape(),
  body("lastName")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .trim()
    .escape(),
  body("email").notEmpty().withMessage("El email es obligatorio").isEmail().withMessage("El email no es válido").normalizeEmail(),
  body("dni").notEmpty().withMessage("El DNI es obligatorio").isNumeric().withMessage("El DNI debe ser numérico").toInt(),
  body("telefono").optional().trim(),
  body("licenciaFAP").optional().trim(),
  body("direccion").optional().trim(),
  body("nacionalidad").optional().trim(),
  body("fechaNacimiento").optional().trim(),
  body("fechaVencimientoCMA").optional().trim(),
  body("fechaVencimientoLicencia").optional().trim(),
  body("contactoEmergencia").optional().trim(),
  body("grupoSanguineo").optional().trim(),
  body("obraSocial").optional().trim(),
  body("enable").optional().isBoolean().withMessage("El estado debe ser booleano").toBoolean(),
  roleValidation,
];

export const forgotPasswordValidationUsuario = [
  body("email").notEmpty().withMessage("El email es obligatorio").isEmail().withMessage("El email no es válido").normalizeEmail(),
];

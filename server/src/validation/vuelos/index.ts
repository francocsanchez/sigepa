import { body, param } from "express-validator";
import { vueloTipoSalto } from "../../models/Vuelo";

const allowedTipoSalto = Object.values(vueloTipoSalto);

export const createValidationVuelo = [
  body("fecha").notEmpty().withMessage("La fecha es obligatoria").isISO8601().withMessage("La fecha no es válida").toDate(),
  body("pilotos")
    .isArray({ min: 1, max: 2 })
    .withMessage("Debe indicar entre uno y dos pilotos"),
  body("pilotos.*").isMongoId().withMessage("El piloto no es válido"),
  body("paracaidistas")
    .isArray({ min: 1 })
    .withMessage("Debe indicar al menos un paracaidista"),
  body("paracaidistas.*.usuario").isMongoId().withMessage("El paracaidista no es válido"),
  body("paracaidistas.*.alquiler")
    .notEmpty()
    .withMessage("El alquiler es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El alquiler debe ser un número mayor o igual a 0")
    .toFloat(),
  body("paracaidistas.*.valorSalto")
    .notEmpty()
    .withMessage("El valor del salto es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El valor del salto debe ser un número mayor o igual a 0")
    .toFloat(),
  body("paracaidistas.*.tipoSalto")
    .notEmpty()
    .withMessage("El tipo de salto es obligatorio")
    .isIn(allowedTipoSalto)
    .withMessage("El tipo de salto no es válido"),
];

export const idValidationVuelo = [param("idVuelo").isMongoId().withMessage("ID de vuelo no válido")];

export const payVueloCargoValidation = [
  body("cargoIds").isArray({ min: 1 }).withMessage("Debe indicar al menos un cargo para registrar el pago"),
  body("cargoIds.*").isMongoId().withMessage("El cargo indicado no es válido"),
  body("fechaPago").optional().isISO8601().withMessage("La fecha de pago no es válida").toDate(),
];

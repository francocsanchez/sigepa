import { Request, Response } from "express";
import { applyBalanceDelta } from "../helpers/balanceContable";
import { systemCategoriaKey } from "../helpers/systemCategories";
import CategoriaContable from "../models/CategoriaContable";
import MovimientoContable, { movimientoContableTipo } from "../models/MovimientoContable";
import Usuario, { userRole } from "../models/Usuario";
import Vuelo, { vueloTipoSalto } from "../models/Vuelo";
import VueloCargo, { vueloCargoEstado, vueloCargoTipo } from "../models/VueloCargo";
import { logError } from "../utils/logError";

const VUELO_POPULATE = [
  { path: "pilotos", select: "name lastName email role enable" },
  { path: "paracaidistas.usuario", select: "name lastName email role enable" },
  { path: "createdBy", select: "name lastName email" },
];

const CARGO_POPULATE = [
  { path: "usuario", select: "name lastName email role enable" },
  { path: "categoria", select: "nombre tipo key" },
  { path: "vuelo", select: "fecha pilotos paracaidistas", populate: [{ path: "pilotos", select: "name lastName email" }] },
  { path: "pagoMovimiento", select: "fecha monto concepto tipo" },
  { path: "createdBy", select: "name lastName email" },
  { path: "paidBy", select: "name lastName email" },
];

const tipoSaltoLabel: Record<string, string> = {
  [vueloTipoSalto.SALTO_BAJO]: "Salto bajo",
  [vueloTipoSalto.MEDIO_SALTO]: "Medio salto",
  [vueloTipoSalto.SALTO_COMPLETO]: "Salto completo",
};

const buildCargoConcepto = ({
  tipoCargo,
  fecha,
  usuario,
  tipoSalto,
}: {
  tipoCargo: string;
  fecha: Date;
  usuario: { name: string; lastName: string };
  tipoSalto?: string;
}) => {
  const fechaLabel = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(fecha));

  const userLabel = `${usuario.lastName}, ${usuario.name}`;

  if (tipoCargo === vueloCargoTipo.ALQUILER) {
    return `Pago de alquiler de equipo (${fechaLabel}) - ${userLabel}`;
  }

  return `Pago de salto ${tipoSalto ? `(${tipoSaltoLabel[tipoSalto] || tipoSalto}) ` : ""}(${fechaLabel}) - ${userLabel}`;
};

const ensureSystemCategoria = async (key: string) => {
  const categoria = await CategoriaContable.findOne({ key, enable: true }).lean();
  if (!categoria) {
    throw new Error(`La categoría contable del sistema ${key} no está disponible`);
  }

  return categoria;
};

const ensureUsersByRole = async (userIds: string[], role: string) => {
  const uniqueUserIds = [...new Set(userIds)];
  const users = await Usuario.find({
    _id: { $in: uniqueUserIds },
    enable: true,
    role,
  })
    .select("name lastName email role enable")
    .lean();

  if (users.length !== uniqueUserIds.length) {
    return {
      error:
        role === userRole.PILOTO
          ? "Uno o más pilotos no existen, están deshabilitados o no tienen rol piloto"
          : "Uno o más paracaidistas no existen, están deshabilitados o no tienen rol paracaidista",
    };
  }

  return {
    users,
  };
};

const buildFlightCargoSummary = (cargos: any[]) =>
  cargos.reduce(
    (acc, cargo) => {
      acc.total += cargo.monto;

      if (cargo.estado === vueloCargoEstado.PENDIENTE) {
        acc.pendiente += cargo.monto;
      } else {
        acc.pagado += cargo.monto;
      }

      return acc;
    },
    { total: 0, pendiente: 0, pagado: 0 },
  );

const buildUserFlightSummary = (vuelo: any, userId: string, cargos: any[]) => {
  const miParticipacion = vuelo.paracaidistas.find((item: any) => String(item.usuario?._id || item.usuario) === userId);
  const companeros = vuelo.paracaidistas
    .filter((item: any) => String(item.usuario?._id || item.usuario) !== userId)
    .map((item: any) => item.usuario);

  return {
    _id: String(vuelo._id),
    fecha: vuelo.fecha,
    pilotos: vuelo.pilotos,
    miSalto: miParticipacion
      ? {
          alquiler: miParticipacion.alquiler,
          valorSalto: miParticipacion.valorSalto,
          tipoSalto: miParticipacion.tipoSalto,
        }
      : null,
    companeros,
    cargos,
    resumenCobranza: buildFlightCargoSummary(cargos),
  };
};

export class VueloController {
  static getAll = async (_req: Request, res: Response) => {
    try {
      const vuelos = await Vuelo.find({ enable: true }).sort({ fecha: -1, createdAt: -1 }).populate(VUELO_POPULATE).lean();

      const vueloIds = vuelos.map((vuelo) => vuelo._id);
      const cargos = await VueloCargo.find({
        enable: true,
        vuelo: { $in: vueloIds },
      })
        .populate(CARGO_POPULATE)
        .lean();

      const cargosByVuelo = new Map<string, any[]>();

      cargos.forEach((cargo) => {
        const vueloId = String(cargo.vuelo?._id || cargo.vuelo);
        const bucket = cargosByVuelo.get(vueloId) || [];
        bucket.push(cargo);
        cargosByVuelo.set(vueloId, bucket);
      });

      const data = vuelos.map((vuelo) => {
        const vueloCargos = cargosByVuelo.get(String(vuelo._id)) || [];
        return {
          ...vuelo,
          cargos: vueloCargos,
          resumenCobranza: buildFlightCargoSummary(vueloCargos),
        };
      });

      return res.status(200).json({
        data,
      });
    } catch (error) {
      logError("VueloController.getAll");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const { fecha, pilotos, paracaidistas } = req.body;

      const pilotIds = pilotos.map(String);
      const parachutistIds = paracaidistas.map((item: any) => String(item.usuario));

      if (new Set(pilotIds).size !== pilotIds.length) {
        return res.status(400).json({
          data: null,
          message: "No se pueden repetir pilotos en el mismo vuelo",
        });
      }

      if (new Set(parachutistIds).size !== parachutistIds.length) {
        return res.status(400).json({
          data: null,
          message: "No se pueden repetir paracaidistas en el mismo vuelo",
        });
      }

      const [pilotsValidation, parachutistsValidation, categoriaSalto, categoriaAlquiler] = await Promise.all([
        ensureUsersByRole(pilotIds, userRole.PILOTO),
        ensureUsersByRole(parachutistIds, userRole.PARACAIDISTA),
        ensureSystemCategoria(systemCategoriaKey.SALTO_PARACAIDAS),
        ensureSystemCategoria(systemCategoriaKey.ALQUILER_EQUIPO),
      ]);

      if (pilotsValidation.error) {
        return res.status(400).json({
          data: null,
          message: pilotsValidation.error,
        });
      }

      if (parachutistsValidation.error) {
        return res.status(400).json({
          data: null,
          message: parachutistsValidation.error,
        });
      }

      const vuelo = new Vuelo({
        fecha,
        pilotos,
        paracaidistas,
        createdBy: req.user!._id,
      });

      await vuelo.save();

      const cargosToCreate = paracaidistas.flatMap((item: any) => {
        const userId = String(item.usuario);
        const cargos: any[] = [];

        if (Number(item.valorSalto) > 0) {
          cargos.push({
            vuelo: vuelo._id,
            usuario: userId,
            fecha,
            categoria: categoriaSalto._id,
            tipoCargo: vueloCargoTipo.SALTO,
            monto: Number(item.valorSalto),
            createdBy: req.user!._id,
          });
        }

        if (Number(item.alquiler) > 0) {
          cargos.push({
            vuelo: vuelo._id,
            usuario: userId,
            fecha,
            categoria: categoriaAlquiler._id,
            tipoCargo: vueloCargoTipo.ALQUILER,
            monto: Number(item.alquiler),
            createdBy: req.user!._id,
          });
        }

        return cargos;
      });

      if (cargosToCreate.length > 0) {
        await VueloCargo.insertMany(cargosToCreate);
      }

      const createdVuelo = await Vuelo.findById(vuelo._id).populate(VUELO_POPULATE).lean();
      const createdCargos = await VueloCargo.find({ vuelo: vuelo._id, enable: true }).populate(CARGO_POPULATE).lean();

      return res.status(201).json({
        data: {
          ...createdVuelo,
          cargos: createdCargos,
          resumenCobranza: buildFlightCargoSummary(createdCargos),
        },
        message: "Vuelo registrado correctamente",
      });
    } catch (error) {
      logError("VueloController.create");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: error instanceof Error && error.message.includes("categoría contable") ? error.message : "Error del servidor",
      });
    }
  };

  static getPendingCharges = async (_req: Request, res: Response) => {
    try {
      const cargos = await VueloCargo.find({
        enable: true,
        estado: vueloCargoEstado.PENDIENTE,
      })
        .sort({ fecha: -1, createdAt: -1 })
        .populate(CARGO_POPULATE)
        .lean();

      return res.status(200).json({
        data: cargos,
      });
    } catch (error) {
      logError("VueloController.getPendingCharges");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static payCharges = async (req: Request, res: Response) => {
    try {
      const { cargoIds, fechaPago } = req.body;
      const paymentDate = fechaPago || new Date();

      const cargos = await VueloCargo.find({
        _id: { $in: cargoIds },
        enable: true,
        estado: vueloCargoEstado.PENDIENTE,
      }).populate([
        { path: "usuario", select: "name lastName email role enable" },
        { path: "categoria", select: "nombre tipo key" },
      ]);

      if (cargos.length !== cargoIds.length) {
        return res.status(400).json({
          data: null,
          message: "Uno o más cargos no existen o ya fueron abonados",
        });
      }

      const movimientos = cargos.map((cargo: any) => ({
        tipo: movimientoContableTipo.INGRESO,
        fecha: paymentDate,
        monto: cargo.monto,
        concepto: buildCargoConcepto({
          tipoCargo: cargo.tipoCargo,
          fecha: cargo.fecha,
          usuario: cargo.usuario,
          tipoSalto:
            cargo.tipoCargo === vueloCargoTipo.SALTO
              ? (cargo.vuelo as any)?.paracaidistas?.find?.((item: any) => String(item.usuario) === String(cargo.usuario._id))?.tipoSalto
              : undefined,
        }),
        categoria: cargo.categoria._id,
        usuario: cargo.usuario._id,
        observaciones: "",
        createdBy: req.user!._id,
      }));

      const createdMovimientos = await MovimientoContable.insertMany(movimientos);
      const totalIngresado = createdMovimientos.reduce((acc, movimiento) => acc + movimiento.monto, 0);
      await applyBalanceDelta(movimientoContableTipo.INGRESO, totalIngresado);

      await Promise.all(
        cargos.map((cargo, index) =>
          VueloCargo.findByIdAndUpdate(cargo._id, {
            estado: vueloCargoEstado.PAGADO,
            pagoMovimiento: createdMovimientos[index]._id,
            paidAt: paymentDate,
            paidBy: req.user!._id,
          }),
        ),
      );

      const updatedCargos = await VueloCargo.find({ _id: { $in: cargoIds } }).populate(CARGO_POPULATE).lean();

      return res.status(200).json({
        data: updatedCargos,
        message: "Pago registrado correctamente",
      });
    } catch (error) {
      logError("VueloController.payCharges");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static getMine = async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;

      const vuelos = await Vuelo.find({
        enable: true,
        "paracaidistas.usuario": userId,
      })
        .sort({ fecha: -1, createdAt: -1 })
        .populate(VUELO_POPULATE)
        .lean();

      const vueloIds = vuelos.map((vuelo) => vuelo._id);
      const cargos = await VueloCargo.find({
        enable: true,
        vuelo: { $in: vueloIds },
        usuario: userId,
      })
        .populate(CARGO_POPULATE)
        .lean();

      const cargosByVuelo = new Map<string, any[]>();

      cargos.forEach((cargo) => {
        const vueloId = String(cargo.vuelo?._id || cargo.vuelo);
        const bucket = cargosByVuelo.get(vueloId) || [];
        bucket.push(cargo);
        cargosByVuelo.set(vueloId, bucket);
      });

      return res.status(200).json({
        data: vuelos.map((vuelo) => buildUserFlightSummary(vuelo, String(userId), cargosByVuelo.get(String(vuelo._id)) || [])),
      });
    } catch (error) {
      logError("VueloController.getMine");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

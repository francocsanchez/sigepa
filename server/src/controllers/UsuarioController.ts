import { Request, Response } from "express";
import crypto from "crypto";
import Usuario, { userRole } from "../models/Usuario";
import { checkPassword, hashPassword } from "../helpers/hash";
import { logError } from "../utils/logError";
import { generateJWT } from "../helpers/jwt";
import { sendMail } from "../helpers/mailer";
import { passwordRecoveryEmail } from "../templates/passwordRecoveryEmail";

const USER_PUBLIC_PROJECTION = "-password";
const DEFAULT_ROLE = [userRole.SOCIO];

const normalizeRoles = (role: string | string[] | undefined) => {
  if (!role) return DEFAULT_ROLE;
  return Array.isArray(role) ? role : [role];
};

const generateTemporaryPassword = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export class UsuarioController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const usuarios = await Usuario.find({}, USER_PUBLIC_PROJECTION).sort({ lastName: 1 }).lean();

      return res.status(200).json({
        data: usuarios,
      });
    } catch (error) {
      logError("UsuarioController.getAll");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    const {
      email,
      name,
      lastName,
      dni,
      telefono,
      licenciaFAP,
      direccion,
      nacionalidad,
      role,
      enable,
      grupoSanguineo,
      obraSocial,
      fechaNacimiento,
      fechaVencimientoCMA,
      fechaVencimientoLicencia,
      contactoEmergencia,
    } = req.body;

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Usuario.findOne({
        $or: [{ email: normalizedEmail }, { dni }],
      }).lean();

      if (existingUser) {
        return res.status(400).json({
          data: null,
          message: existingUser.email === normalizedEmail ? "El email ya está registrado" : "El DNI ya está registrado",
        });
      }

      const newUser = new Usuario({
        email: normalizedEmail,
        name,
        lastName,
        dni,
        telefono,
        licenciaFAP,
        direccion,
        nacionalidad,
        enable,
        grupoSanguineo,
        obraSocial,
        fechaNacimiento,
        fechaVencimientoCMA,
        fechaVencimientoLicencia,
        contactoEmergencia,
        role: normalizeRoles(role),
      });

      newUser.password = await hashPassword(String(dni));
      await newUser.save();

      const usuarioCreado = await Usuario.findById(newUser._id, USER_PUBLIC_PROJECTION).lean();

      return res.status(200).json({
        data: usuarioCreado,
        message: "Usuario creado exitosamente",
      });
    } catch (error) {
      logError("UsuarioController.create");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static getByID = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;

    try {
      const usuario = await Usuario.findById(idUsuario, USER_PUBLIC_PROJECTION).lean();

      if (!usuario) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        data: usuario,
      });
    } catch (error) {
      logError("UsuarioController.getByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static updateByID = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;
    const {
      email,
      name,
      lastName,
      dni,
      telefono,
      licenciaFAP,
      direccion,
      nacionalidad,
      role,
      enable,
      grupoSanguineo,
      obraSocial,
      fechaNacimiento,
      fechaVencimientoCMA,
      fechaVencimientoLicencia,
      contactoEmergencia,
    } = req.body;

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Usuario.findOne({
        _id: { $ne: idUsuario },
        $or: [{ email: normalizedEmail }, { dni }],
      }).lean();

      if (existingUser) {
        return res.status(400).json({
          data: null,
          message: existingUser.email === normalizedEmail ? "El email ya está registrado" : "El DNI ya está registrado",
        });
      }

      const updatedUser = await Usuario.findByIdAndUpdate(
        idUsuario,
        {
          email: normalizedEmail,
          name,
          lastName,
          dni,
          telefono,
          licenciaFAP,
          direccion,
          nacionalidad,
          enable,
          grupoSanguineo,
          obraSocial,
          fechaNacimiento,
          fechaVencimientoCMA,
          fechaVencimientoLicencia,
          contactoEmergencia,
          role: normalizeRoles(role),
        },
        { new: true, projection: USER_PUBLIC_PROJECTION },
      ).lean();

      if (!updatedUser) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        data: updatedUser,
        message: "Usuario actualizado correctamente",
      });
    } catch (error) {
      logError("UsuarioController.updateByID");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static changeStatus = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;

    try {
      const usuario = await Usuario.findById(idUsuario);

      if (!usuario) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      usuario.enable = !usuario.enable;
      await usuario.save();

      const usuarioActualizado = await Usuario.findById(idUsuario, USER_PUBLIC_PROJECTION).lean();

      return res.status(200).json({
        data: usuarioActualizado,
        message: `Usuario ${usuario.enable ? "habilitado" : "deshabilitado"} correctamente`,
      });
    } catch (error) {
      logError("UsuarioController.changeStatus");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return res.status(400).json({
          data: null,
          message: "Email y password son obligatorios",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const user = await Usuario.findOne({ email: normalizedEmail }).lean();

      if (!user) {
        return res.status(401).json({
          data: null,
          message: "Credenciales inválidas",
        });
      }

      if (!user.enable) {
        return res.status(403).json({
          data: null,
          message: "Usuario deshabilitado",
        });
      }

      const ok = await checkPassword(password, user.password);

      if (!ok) {
        return res.status(401).json({
          data: null,
          message: "Credenciales inválidas",
        });
      }

      const token = generateJWT({ sub: String(user._id) });

      return res.status(200).json({
        token,
      });
    } catch (error) {
      logError("UsuarioController.login");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error interno del servidor",
      });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email: string };

      if (!email) {
        return res.status(400).json({
          data: null,
          message: "El email es obligatorio",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await Usuario.findOne({ email: normalizedEmail });

      if (user) {
        const temporaryPassword = generateTemporaryPassword();
        user.password = await hashPassword(temporaryPassword);
        await user.save();

        await sendMail({
          to: user.email,
          subject: "Nueva contrasena temporal de SIGEPA",
          html: passwordRecoveryEmail({
            temporaryPassword,
            userName: `${user.name} ${user.lastName}`.trim(),
          }),
        });
      }

      return res.status(200).json({
        data: null,
        message: "Si el email existe, enviamos instrucciones para recuperar la contraseña",
      });
    } catch (error) {
      logError("UsuarioController.forgotPassword");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static getMe = async (req: Request, res: Response) => {
    try {
      const { _id } = req.user;
      const usuario = await Usuario.findById(_id, USER_PUBLIC_PROJECTION).lean();

      if (!usuario) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        data: usuario,
        message: "Usuario autenticado",
      });
    } catch (error) {
      logError("UsuarioController.getMe");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static updateMe = async (req: Request, res: Response) => {
    try {
      const { _id } = req.user;
      const {
        email,
        telefono,
        licenciaFAP,
        direccion,
        nacionalidad,
        fechaNacimiento,
        fechaVencimientoCMA,
        fechaVencimientoLicencia,
        contactoEmergencia,
        grupoSanguineo,
        obraSocial,
      } = req.body;

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Usuario.findOne({
        email: normalizedEmail,
        _id: { $ne: _id },
      }).lean();

      if (existingUser) {
        return res.status(400).json({
          data: null,
          message: "El email ya está registrado",
        });
      }

      const usuarioActualizado = await Usuario.findByIdAndUpdate(
        _id,
        {
          email: normalizedEmail,
          telefono,
          licenciaFAP,
          direccion,
          nacionalidad,
          fechaNacimiento,
          fechaVencimientoCMA,
          fechaVencimientoLicencia,
          contactoEmergencia,
          grupoSanguineo,
          obraSocial,
        },
        { new: true, projection: USER_PUBLIC_PROJECTION },
      ).lean();

      if (!usuarioActualizado) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        data: usuarioActualizado,
        message: "Perfil actualizado correctamente",
      });
    } catch (error) {
      logError("UsuarioController.updateMe");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };

  static updateMyPassword = async (req: Request, res: Response) => {
    try {
      const { _id } = req.user;
      const { newPassword } = req.body;

      const usuario = await Usuario.findById(_id);

      if (!usuario) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      usuario.password = await hashPassword(newPassword);
      await usuario.save();

      return res.status(200).json({
        data: null,
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      logError("UsuarioController.updateMyPassword");
      console.error(error);
      return res.status(500).json({
        data: null,
        message: "Error del servidor",
      });
    }
  };
}

export const usuarioRoles = ["admin", "secretaria", "instructor", "paracaidista", "socio", "piloto", "contable"] as const;

export type UsuarioRole = (typeof usuarioRoles)[number];

export type Usuario = {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  dni: number;
  telefono: string;
  licenciaFAP: string;
  direccion: string;
  nacionalidad: string;
  fechaNacimiento: string;
  fechaVencimientoCMA: string;
  fechaVencimientoLicencia: string;
  contactoEmergencia: string;
  grupoSanguineo: string;
  obraSocial: string;
  enable: boolean;
  role: UsuarioRole[];
  createdAt?: string;
  updatedAt?: string;
};

export type UsuarioFormData = {
  name: string;
  lastName: string;
  email: string;
  dni: number | "";
  telefono: string;
  licenciaFAP: string;
  direccion: string;
  nacionalidad: string;
  fechaNacimiento: string;
  fechaVencimientoCMA: string;
  fechaVencimientoLicencia: string;
  contactoEmergencia: string;
  grupoSanguineo: string;
  obraSocial: string;
  role: UsuarioRole[];
  enable: boolean;
};

export type UpdateMyProfileFormData = {
  email: string;
  telefono: string;
  licenciaFAP: string;
  direccion: string;
  nacionalidad: string;
  fechaNacimiento: string;
  fechaVencimientoCMA: string;
  fechaVencimientoLicencia: string;
  contactoEmergencia: string;
  grupoSanguineo: string;
  obraSocial: string;
};

export type UsuarioListResponse = {
  data: Usuario[];
};

export type UsuarioResponse = {
  data: Usuario;
  message?: string;
};

export type UsuarioMutationResponse = {
  data: Usuario | null;
  message: string;
};

export type AuthenticatedUser = Usuario;

export type AuthenticatedUserResponse = {
  data: AuthenticatedUser;
  message: string;
};

export type UpdateUsuarioByIdParams = {
  idUsuario: string;
  formData: UsuarioFormData;
};

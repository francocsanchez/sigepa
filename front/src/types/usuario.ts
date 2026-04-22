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
  profileImage?: {
    fileId: string;
    url: string;
    thumbnailUrl?: string;
    filePath?: string;
    uploadedAt?: string;
  } | null;
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

export type Dashboard360 = {
  perfil: {
    name: string;
    lastName: string;
    email: string;
    dni: number;
    licenciaFAP: string;
    fechaVencimientoLicencia: string;
    fechaVencimientoCMA: string;
    role: UsuarioRole[];
    profileImage?: Usuario["profileImage"];
  };
  cuentaCorriente: {
    deudaTotal: number;
    deudaCuotas: number;
    deudaVuelos: number;
    cuotaDelMes: {
      mes: number;
      ano: number;
      monto: number;
      estado: "PENDIENTE" | "PAGADA";
    } | null;
    cuotasAtrasadas: number;
  };
  saltos: {
    cantidadMes: number;
    cantidadAno: number;
    cantidadTotal: number;
    porMes: Array<{
      month: string;
      monthIndex: number;
      saltos: number;
    }>;
    porTipo: Array<{
      tipo: string;
      cantidad: number;
    }>;
  };
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

export type Dashboard360Response = {
  data: Dashboard360;
  message?: string;
};

export type ImageKitAuthResponse = {
  data: {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
  };
  message?: string;
};

export type UpdateUsuarioByIdParams = {
  idUsuario: string;
  formData: UsuarioFormData;
};

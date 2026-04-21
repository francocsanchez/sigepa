export const categoriaContableTipos = ["INGRESO", "EGRESO", "AMBAS"] as const;

export type CategoriaContableTipo = (typeof categoriaContableTipos)[number];

export type CategoriaContable = {
  _id: string;
  nombre: string;
  tipo: CategoriaContableTipo;
  enable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoriaContableFormData = {
  nombre: string;
  tipo: CategoriaContableTipo | "";
  enable: boolean;
};

export type CategoriaContableListResponse = {
  data: CategoriaContable[];
};

export type CategoriaContableResponse = {
  data: CategoriaContable;
  message?: string;
};

export type CategoriaContableMutationResponse = {
  data: CategoriaContable | null;
  message: string;
};

export type UpdateCategoriaContableByIdParams = {
  idCategoriaContable: string;
  formData: CategoriaContableFormData;
};

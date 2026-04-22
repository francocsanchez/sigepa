import CategoriaContable, { categoriaContableTipo } from "../models/CategoriaContable";

export const systemCategoriaKey = {
  CUOTA_SOCIAL: "CUOTA_SOCIAL",
  ALQUILER_EQUIPO: "ALQUILER_EQUIPO",
  SALTO_PARACAIDAS: "SALTO_PARACAIDAS",
  AJUSTE: "AJUSTE",
} as const;

export const ensureSystemCategorias = async () => {
  const categorias = [
    {
      key: systemCategoriaKey.CUOTA_SOCIAL,
      nombre: "Cuota social",
      tipo: categoriaContableTipo.INGRESO,
    },
    {
      key: systemCategoriaKey.ALQUILER_EQUIPO,
      nombre: "Alquiler equipo",
      tipo: categoriaContableTipo.INGRESO,
    },
    {
      key: systemCategoriaKey.SALTO_PARACAIDAS,
      nombre: "Salto de paracaídas",
      tipo: categoriaContableTipo.INGRESO,
    },
    {
      key: systemCategoriaKey.AJUSTE,
      nombre: "Ajuste",
      tipo: categoriaContableTipo.AMBAS,
    },
  ];

  await Promise.all(
    categorias.map((categoria) =>
      CategoriaContable.findOneAndUpdate(
        { key: categoria.key },
        {
          $set: {
            nombre: categoria.nombre,
            tipo: categoria.tipo,
            enable: true,
            isSystem: true,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ),
    ),
  );
};

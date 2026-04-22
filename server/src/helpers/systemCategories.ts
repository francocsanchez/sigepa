import CategoriaContable, { categoriaContableTipo } from "../models/CategoriaContable";

export const systemCategoriaKey = {
  CUOTA_SOCIAL: "CUOTA_SOCIAL",
} as const;

export const ensureSystemCategorias = async () => {
  const categorias = [
    {
      key: systemCategoriaKey.CUOTA_SOCIAL,
      nombre: "Cuota social",
      tipo: categoriaContableTipo.INGRESO,
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

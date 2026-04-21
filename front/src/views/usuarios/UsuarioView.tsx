import { getUsuarioByID } from "@/api/usuarioAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

const readValue = (value?: string | number | boolean | null) => {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (value === undefined || value === null || value === "") {
    return "No informado";
  }

  return value;
};

type DetailItemProps = {
  label: string;
  value: string | number | boolean | null | undefined;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1 rounded-xl border border-secondary-dark/50 bg-secondary/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-light">{label}</p>
      <p className="text-sm font-medium text-neutral-dark">{readValue(value)}</p>
    </div>
  );
}

export default function UsuarioView() {
  const params = useParams();
  const idUsuario = params.idUsuario!;

  const {
    data: usuario,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["usuario", idUsuario],
    queryFn: () => getUsuarioByID(idUsuario),
    retry: false,
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando ficha del usuario..." />;
  }

  if (isError || !usuario) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Ocurrió un error al cargar la ficha del usuario.
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Usuarios</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Ficha de usuario</h2>
        </div>

        <Link
          to="/config/usuarios"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-secondary/40"
        >
          Volver al listado
        </Link>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Información principal</h3>
            <p className="text-sm text-slate-500">Datos básicos y estado actual del usuario.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Nombre" value={usuario.name} />
            <DetailItem label="Apellido" value={usuario.lastName} />
            <DetailItem label="Email" value={usuario.email} />
            <DetailItem label="DNI" value={usuario.dni} />
            <DetailItem label="Estado" value={usuario.enable ? "Habilitado" : "Deshabilitado"} />
            <DetailItem label="Roles" value={usuario.role.join(", ")} />
          </div>
        </section>

        <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Contacto y documentación</h3>
            <p className="text-sm text-slate-500">Información complementaria del perfil del usuario.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Teléfono" value={usuario.telefono} />
            <DetailItem label="Dirección" value={usuario.direccion} />
            <DetailItem label="Nacionalidad" value={usuario.nacionalidad} />
            <DetailItem label="Licencia FAP" value={usuario.licenciaFAP} />
            <DetailItem label="Fecha de nacimiento" value={usuario.fechaNacimiento} />
            <DetailItem label="Vencimiento CMA" value={usuario.fechaVencimientoCMA} />
            <DetailItem label="Vencimiento licencia" value={usuario.fechaVencimientoLicencia} />
            <DetailItem label="Grupo sanguíneo" value={usuario.grupoSanguineo} />
            <DetailItem label="Obra social" value={usuario.obraSocial} />
            <DetailItem label="Contacto de emergencia" value={usuario.contactoEmergencia} />
          </div>
        </section>
      </div>
    </>
  );
}

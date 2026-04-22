import { getMyDashboard } from "@/api/usuarioAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, CalendarClock, CreditCard, FileText, IdCard, Plane, ShieldAlert, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Link, Navigate } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const pieColors = ["#d97706", "#2563eb", "#059669", "#dc2626"];

const formatDate = (value?: string) => {
  if (!value) return "Sin cargar";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin cargar";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const getDaysUntil = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const diff = parsed.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getExpiryTone = (days: number | null) => {
  if (days === null) return "text-slate-500";
  if (days < 0) return "text-red-600";
  if (days <= 30) return "text-amber-600";
  return "text-emerald-600";
};

function DashboardAvatar() {
  const { user } = useAuth();

  if (user?.profileImage?.url) {
    return <img src={user.profileImage.url} alt="Perfil" className="h-20 w-20 rounded-3xl object-cover shadow-sm" />;
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-white/80 text-[#d97706] shadow-sm backdrop-blur">
      <IdCard className="h-8 w-8" />
    </div>
  );
}

export default function DashboardView() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "me"],
    queryFn: getMyDashboard,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  if (authLoading) {
    return <LoadingSpinner label="Cargando dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner label="Cargando dashboard..." />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error instanceof Error ? error.message : "No se pudo cargar el dashboard."}
      </div>
    );
  }

  const licenciaDays = getDaysUntil(data.perfil.fechaVencimientoLicencia);
  const cmaDays = getDaysUntil(data.perfil.fechaVencimientoCMA);
  const cuotaMesPagada = data.cuentaCorriente.cuotaDelMes?.estado === "PAGADA";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-[#e9ddd1] bg-[radial-gradient(circle_at_top_left,_rgba(196,138,94,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(180,154,130,0.12),_transparent_20%),linear-gradient(135deg,#fcfaf7_0%,#f5efe8_52%,#efe7de_100%)] p-6 text-slate-900 shadow-[0_28px_80px_-60px_rgba(88,63,43,0.2)]">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <DashboardAvatar />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8f725f]">Vista 360</p>
                <h1 className="mt-2 text-3xl font-black tracking-[0.04em] text-[#2c1e15]">
                  {data.perfil.name} {data.perfil.lastName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[#6a5a4f]">
                  Resumen operativo del usuario: documentación, estado de cuenta y actividad de saltos.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/80 bg-white/66 p-4 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7463]">Licencia FAP</p>
                <p className="mt-2 text-xl font-semibold text-[#2c1e15]">{data.perfil.licenciaFAP || "Sin cargar"}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/66 p-4 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7463]">DNI</p>
                <p className="mt-2 text-xl font-semibold text-[#2c1e15]">{data.perfil.dni}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/66 p-4 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7463]">Vencimiento licencia</p>
                <p className="mt-2 text-xl font-semibold text-[#2c1e15]">{formatDate(data.perfil.fechaVencimientoLicencia)}</p>
                <p className={`mt-1 text-xs font-semibold ${getExpiryTone(licenciaDays)}`}>
                  {licenciaDays === null ? "Sin fecha cargada" : licenciaDays < 0 ? "Vencida" : `${licenciaDays} días restantes`}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/66 p-4 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7463]">Vencimiento CMA</p>
                <p className="mt-2 text-xl font-semibold text-[#2c1e15]">{formatDate(data.perfil.fechaVencimientoCMA)}</p>
                <p className={`mt-1 text-xs font-semibold ${getExpiryTone(cmaDays)}`}>
                  {cmaDays === null ? "Sin fecha cargada" : cmaDays < 0 ? "Vencido" : `${cmaDays} días restantes`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/80 bg-white/72 p-5 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
              <div className="inline-flex rounded-2xl bg-[#f5ece3] p-3 text-[#9a6337]">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-[#7a695e]">Deuda total</p>
              <p className={`mt-1 text-3xl font-semibold ${data.cuentaCorriente.deudaTotal > 0 ? "text-[#9f4f1f]" : "text-emerald-700"}`}>
                {currencyFormatter.format(data.cuentaCorriente.deudaTotal)}
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/72 p-5 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
              <div className="inline-flex rounded-2xl bg-[#eef4f6] p-3 text-[#5e7990]">
                <CreditCard className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-[#7a695e]">Cuota del mes</p>
              <p className={`mt-1 text-2xl font-semibold ${cuotaMesPagada ? "text-emerald-700" : "text-[#a36b2c]"}`}>
                {data.cuentaCorriente.cuotaDelMes ? (cuotaMesPagada ? "Abonada" : "Pendiente") : "Sin generar"}
              </p>
              {data.cuentaCorriente.cuotaDelMes ? (
                <p className="mt-1 text-xs text-[#7a695e]">{currencyFormatter.format(data.cuentaCorriente.cuotaDelMes.monto)}</p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/72 p-5 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
              <div className="inline-flex rounded-2xl bg-[#f7f0e7] p-3 text-[#9d7441]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-[#7a695e]">Cuotas atrasadas</p>
              <p className="mt-1 text-3xl font-semibold text-[#2c1e15]">{data.cuentaCorriente.cuotasAtrasadas}</p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/72 p-5 shadow-[0_12px_30px_-24px_rgba(88,63,43,0.14)] backdrop-blur">
              <div className="inline-flex rounded-2xl bg-[#edf5ef] p-3 text-[#4f7a5a]">
                <Plane className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-[#7a695e]">Saltos totales</p>
              <p className="mt-1 text-3xl font-semibold text-[#2c1e15]">{data.saltos.cantidadTotal}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Actividad</p>
              <h2 className="text-xl font-semibold text-slate-900">Saltos por mes</h2>
            </div>
            <div className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Año actual
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.saltos.porMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ddd6" vertical={false} />
                <XAxis dataKey="month" stroke="#7a6457" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#7a6457" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="saltos" radius={[10, 10, 0, 0]} fill="#ff8a1c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-medium text-primary">Distribución</p>
            <h2 className="text-xl font-semibold text-slate-900">Tipos de salto</h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.saltos.porTipo} dataKey="cantidad" nameKey="tipo" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {data.saltos.porTipo.map((entry, index) => (
                    <Cell key={`${entry.tipo}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid gap-2">
            {data.saltos.porTipo.map((item, index) => (
              <div key={item.tipo} className="flex items-center justify-between rounded-2xl bg-secondary/10 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  {item.tipo}
                </div>
                <span className="font-semibold text-slate-900">{item.cantidad}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Plane className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Saltos del mes</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.saltos.cantidadMes}</p>
        </article>

        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Saltos del año</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.saltos.cantidadAno}</p>
        </article>

        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
            <FileText className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Acciones rápidas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/profile" className="rounded-xl border border-secondary-dark/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/10">
              Mi perfil
            </Link>
            <Link
              to="/profile/cuenta-corriente"
              className="rounded-xl border border-secondary-dark/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/10"
            >
              Cuenta corriente
            </Link>
            <Link to="/profile/vuelos" className="rounded-xl border border-secondary-dark/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/10">
              Mis vuelos
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Estado documental</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-secondary/10 p-4">
              <p className="text-sm text-slate-500">Licencia</p>
              <p className="mt-1 font-semibold text-slate-900">{formatDate(data.perfil.fechaVencimientoLicencia)}</p>
            </div>
            <div className="rounded-2xl bg-secondary/10 p-4">
              <p className="text-sm text-slate-500">CMA</p>
              <p className="mt-1 font-semibold text-slate-900">{formatDate(data.perfil.fechaVencimientoCMA)}</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-secondary-dark/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h2 className="text-lg font-semibold text-slate-900">Estado contable</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-secondary/10 p-4">
              <p className="text-sm text-slate-500">Deuda por cuotas</p>
              <p className="mt-1 font-semibold text-slate-900">{currencyFormatter.format(data.cuentaCorriente.deudaCuotas)}</p>
            </div>
            <div className="rounded-2xl bg-secondary/10 p-4">
              <p className="text-sm text-slate-500">Deuda por vuelos</p>
              <p className="mt-1 font-semibold text-slate-900">{currencyFormatter.format(data.cuentaCorriente.deudaVuelos)}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

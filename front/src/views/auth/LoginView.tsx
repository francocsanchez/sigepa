import { authenticateUser } from "@/api/authAPI";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginView() {
  const navigate = useNavigate();

  const initialValues: LoginFormData = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: initialValues });

  const loginMutation = useMutation({
    mutationFn: authenticateUser,
    onSuccess: () => {
      navigate("/", { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al iniciar sesión");
    },
  });

  const onSubmit = (formData: LoginFormData) => {
    loginMutation.mutate({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-secondary px-4 py-10 text-neutral-dark sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-primary-light bg-surface shadow-[0_30px_80px_-50px_rgba(255,122,0,0.28)]">
          <div className="border-b border-primary-light bg-neutral-darker px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-light">Sistema de Gestion</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.18em] text-surface">
              SI<span className="text-primary">.</span>GE<span className="text-primary">.</span>PA<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-primary-light">
              Acceso interno para la administracion y operacion del club.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-dark">
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", {
                  required: "El email es obligatorio",
                })}
                className="w-full rounded-xl border border-primary-light bg-secondary-light px-3 py-3 text-sm text-neutral-darker outline-none transition placeholder:text-neutral-light focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ingrese su email"
              />

              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-dark">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                className="w-full rounded-xl border border-primary-light bg-secondary-light px-3 py-3 text-sm text-neutral-darker outline-none transition placeholder:text-neutral-light focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ingrese su contraseña"
              />

              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { updateMyPassword, updateMyProfile, updateMyProfileImage } from "@/api/authAPI";
import { getProfileImageAuth } from "@/api/usuarioAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { UpdateMyProfileFormData, UsuarioMutationResponse } from "@/types/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, IdCard } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ChangePasswordFormData = {
  password: string;
  repeatPassword: string;
};

const inputClassName =
  "w-full rounded-xl border border-secondary-dark/60 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20";

const readOnlyInputClassName =
  "w-full rounded-xl border border-secondary-dark/50 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none";

const PROFILE_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_IMAGE_MIN_DIMENSION = 256;
const PROFILE_IMAGE_OUTPUT_SIZE = 1024;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("No se pudo leer la imagen seleccionada"));
    };

    image.src = imageUrl;
  });

const cropProfileImageToSquare = async (file: File) => {
  const image = await loadImage(file);

  if (image.width < PROFILE_IMAGE_MIN_DIMENSION || image.height < PROFILE_IMAGE_MIN_DIMENSION) {
    throw new Error(`La imagen debe tener al menos ${PROFILE_IMAGE_MIN_DIMENSION}x${PROFILE_IMAGE_MIN_DIMENSION} px`);
  }

  const sourceSize = Math.min(image.width, image.height);
  const sourceX = (image.width - sourceSize) / 2;
  const sourceY = (image.height - sourceSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = PROFILE_IMAGE_OUTPUT_SIZE;
  canvas.height = PROFILE_IMAGE_OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar el recorte de la imagen");
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    PROFILE_IMAGE_OUTPUT_SIZE,
    PROFILE_IMAGE_OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((generatedBlob) => resolve(generatedBlob), "image/jpeg", 0.9);
  });

  if (!blob) {
    throw new Error("No se pudo procesar la imagen");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "perfil"}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

export default function MiPerfilView() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateMyProfileFormData>({
    values: {
      email: user?.email || "",
      telefono: user?.telefono || "",
      licenciaFAP: user?.licenciaFAP || "",
      direccion: user?.direccion || "",
      nacionalidad: user?.nacionalidad || "",
      fechaNacimiento: user?.fechaNacimiento || "",
      fechaVencimientoCMA: user?.fechaVencimientoCMA || "",
      fechaVencimientoLicencia: user?.fechaVencimientoLicencia || "",
      contactoEmergencia: user?.contactoEmergencia || "",
      grupoSanguineo: user?.grupoSanguineo || "",
      obraSocial: user?.obraSocial || "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
  });

  const password = watch("password");

  const profileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response: UsuarioMutationResponse) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "me"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const profileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const auth = await getProfileImageAuth();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `perfil-${user?._id}-${Date.now()}-${file.name}`);
      formData.append("folder", "/sigepa/profile-images");
      formData.append("useUniqueFileName", "true");
      formData.append("publicKey", auth.publicKey);
      formData.append("signature", auth.signature);
      formData.append("expire", String(auth.expire));
      formData.append("token", auth.token);

      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Error al subir la imagen: ${errorText}`);
      }

      const uploadData = await uploadResponse.json();

      return updateMyProfileImage({
        fileId: uploadData.fileId,
        url: uploadData.url,
        thumbnailUrl: uploadData.thumbnailUrl,
        filePath: uploadData.filePath,
      });
    },
    onSuccess: (response: UsuarioMutationResponse) => {
      toast.success(response.message || "Foto de perfil actualizada");
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "me"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir la foto de perfil");
    },
  });

  const mutation = useMutation({
    mutationFn: updateMyPassword,
    onSuccess: (response: { message: string }) => {
      toast.success(response.message);
      reset();
      localStorage.removeItem("AUTH_TOKEN");
      queryClient.removeQueries({ queryKey: ["auth-user"] });
      navigate("/login", { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <LoadingSpinner label="Cargando perfil..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = (formData: ChangePasswordFormData) => {
    mutation.mutate({
      newPassword: formData.password,
    });
  };

  const onSubmitProfile = (formData: UpdateMyProfileFormData) => {
    profileMutation.mutate(formData);
  };

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!PROFILE_IMAGE_ALLOWED_TYPES.includes(file.type)) {
      toast.error("La foto de perfil debe ser JPG, PNG o WEBP");
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE_BYTES) {
      toast.error("La foto de perfil no puede superar los 5 MB");
      event.target.value = "";
      return;
    }

    try {
      const croppedFile = await cropProfileImageToSquare(file);
      profileImageMutation.mutate(croppedFile);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo preparar la imagen");
    }

    event.target.value = "";
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Mi perfil</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Datos de tu cuenta</h2>
        </div>

        <Link
          to="/profile/cuenta-corriente"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Cuenta corriente
        </Link>
        <Link
          to="/profile/vuelos"
          className="inline-flex items-center justify-center rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/10"
        >
          Mis vuelos
        </Link>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 border-b border-secondary-dark/40 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user.profileImage?.url ? (
                <img src={user.profileImage.url} alt="Foto de perfil" className="h-24 w-24 rounded-3xl object-cover shadow-sm" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary/30 text-primary">
                  <IdCard className="h-10 w-10" />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-slate-900">Foto de perfil</h3>
                <p className="text-sm text-slate-500">
                  Solo el propio usuario puede cargarla. Se recorta al centro en formato cuadrado y una nueva reemplaza la anterior.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
              <button
                type="button"
                onClick={triggerFileDialog}
                disabled={profileImageMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary-dark/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
                {profileImageMutation.isPending ? "Subiendo..." : "Cambiar foto"}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Información personal</h3>
            <p className="text-sm text-slate-500">Nombre, apellido, DNI y rol no pueden ser modificados por el usuario.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input value={user.name} readOnly className={readOnlyInputClassName} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Apellido</label>
              <input value={user.lastName} readOnly className={readOnlyInputClassName} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input value={user.email} readOnly className={readOnlyInputClassName} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">DNI</label>
              <input value={user.dni} readOnly className={readOnlyInputClassName} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <input value={user.role.join(", ")} readOnly className={readOnlyInputClassName} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Completar perfil</h3>
            <p className="text-sm text-slate-500">Estos datos sí pueden ser actualizados por el propio usuario.</p>
          </div>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className={inputClassName}
                  {...registerProfile("email", { required: "El email es obligatorio" })}
                />
                {profileErrors.email && <p className="text-sm text-red-600">{profileErrors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <input type="text" className={inputClassName} {...registerProfile("telefono")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Licencia FAP</label>
                <input type="text" className={inputClassName} {...registerProfile("licenciaFAP")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nacionalidad</label>
                <input type="text" className={inputClassName} {...registerProfile("nacionalidad")} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Dirección</label>
                <input type="text" className={inputClassName} {...registerProfile("direccion")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Fecha de nacimiento</label>
                <input type="date" className={inputClassName} {...registerProfile("fechaNacimiento")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Vencimiento CMA</label>
                <input type="date" className={inputClassName} {...registerProfile("fechaVencimientoCMA")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Vencimiento licencia</label>
                <input type="date" className={inputClassName} {...registerProfile("fechaVencimientoLicencia")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Grupo sanguíneo</label>
                <input type="text" className={inputClassName} {...registerProfile("grupoSanguineo")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Obra social</label>
                <input type="text" className={inputClassName} {...registerProfile("obraSocial")} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Contacto de emergencia</label>
                <input type="text" className={inputClassName} {...registerProfile("contactoEmergencia")} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileMutation.isPending ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-secondary-dark/60 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Cambiar contraseña</h3>
            <p className="text-sm text-slate-500">Cuando actualices la contraseña se cerrará la sesión actual.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa una nueva contraseña"
                  className={inputClassName}
                  {...register("password", {
                    validate: (value) => {
                      if (!value && !watch("repeatPassword")) return true;
                      return value.length >= 6 || "La contraseña debe tener al menos 6 caracteres";
                    },
                  })}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="repeatPassword" className="text-sm font-medium text-slate-700">
                  Repetir contraseña
                </label>
                <input
                  id="repeatPassword"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  className={inputClassName}
                  {...register("repeatPassword", {
                    validate: (value) => {
                      if (!password && !value) return true;
                      return value === password || "Las contraseñas no coinciden";
                    },
                  })}
                />
                {errors.repeatPassword && <p className="text-sm text-red-600">{errors.repeatPassword.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

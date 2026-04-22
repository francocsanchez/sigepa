import crypto from "crypto";

type ImageKitAuthenticationParams = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable de entorno ${name} no está configurada`);
  }

  return value;
};

const getBasicAuthHeader = () => {
  const privateKey = getRequiredEnv("IMAGEKIT_PRIVATE_KEY");
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
};

export const getImageKitAuthenticationParams = (): ImageKitAuthenticationParams => {
  const privateKey = getRequiredEnv("IMAGEKIT_PRIVATE_KEY");
  const publicKey = getRequiredEnv("IMAGEKIT_PUBLIC_KEY");
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 30;
  const signature = crypto.createHmac("sha1", privateKey).update(`${token}${expire}`).digest("hex");

  return {
    token,
    expire,
    signature,
    publicKey,
  };
};

export const deleteImageKitFile = async (fileId: string) => {
  if (!fileId) return;

  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: getBasicAuthHeader(),
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`No se pudo eliminar el archivo anterior en ImageKit: ${response.status} ${errorText}`);
  }
};

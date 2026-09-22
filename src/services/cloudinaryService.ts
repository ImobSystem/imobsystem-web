/**
 * Upload de imagens direto pro Cloudinary (unsigned upload).
 *
 * NÃO usa o axios `api` central: essa chamada não vai pro nosso backend, vai
 * direto pro Cloudinary, então não deve levar o header `Authorization` nem a
 * `baseURL` da nossa API.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadResponse {
  secure_url: string;
}

export const cloudinaryService = {
  /**
   * Envia o arquivo pro Cloudinary e devolve a `secure_url` (HTTPS) da
   * imagem hospedada — é essa URL que vai pro backend salvar.
   */
  async upload(file: File): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Configuração do Cloudinary ausente. Verifique as variáveis de ambiente.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      throw new Error("Não foi possível enviar a imagem. Tente novamente.");
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    return data.secure_url;
  },
};

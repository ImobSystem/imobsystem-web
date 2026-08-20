/**
 * Regras de validação e utilidades das fotos de imóvel.
 *
 * Ficam fora do componente pelos mesmos motivos de `lib/logo.ts`: reuso,
 * testabilidade e manter a UI focada só na apresentação.
 */

/** Limite de tamanho por foto. */
export const FOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Rótulo do limite usado nas mensagens da UI. */
export const FOTO_MAX_LABEL = "5MB";

/** Máximo de fotos por imóvel (já existentes + novas). */
export const FOTO_MAX_QUANTIDADE = 15;

const MIME_ACEITOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/** Extensões aceitas — plano B quando o browser não informa `file.type`. */
const EXTENSOES_ACEITAS = [".jpg", ".jpeg", ".png", ".webp"];

/** Texto de apoio exibido abaixo do botão de upload. */
export const FOTO_FORMATOS_LABEL = "JPG, PNG ou WEBP";

/**
 * Valida o arquivo escolhido ANTES de enviar pro Cloudinary.
 *
 * @returns a mensagem de erro a exibir, ou `null` se o arquivo está ok.
 */
export function validarArquivoFoto(file: File): string | null {
  const tipoOk = MIME_ACEITOS.includes(file.type.toLowerCase());
  const nome = file.name.toLowerCase();
  const extensaoOk = EXTENSOES_ACEITAS.some((ext) => nome.endsWith(ext));

  if (!tipoOk && !(file.type === "" && extensaoOk)) {
    return `Formato não suportado. Envie uma imagem ${FOTO_FORMATOS_LABEL}.`;
  }

  if (file.size > FOTO_MAX_BYTES) {
    return `Cada foto deve ter no máximo ${FOTO_MAX_LABEL}.`;
  }

  return null;
}

/**
 * Monta a URL de miniatura a partir da URL original do Cloudinary, inserindo
 * a transformação `c_thumb,w,h` logo após `/upload/`. Economiza banda nas
 * listagens em vez de baixar a imagem em tamanho original.
 */
export function buildThumbUrl(
  url: string,
  width = 200,
  height = 150,
): string {
  const marcador = "/upload/";
  const indice = url.indexOf(marcador);
  if (indice === -1) return url;

  const inicio = indice + marcador.length;
  return `${url.slice(0, inicio)}c_thumb,w_${width},h_${height}/${url.slice(inicio)}`;
}

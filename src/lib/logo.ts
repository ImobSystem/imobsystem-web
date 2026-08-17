/**
 * Regras de validação e leitura da logo da imobiliária.
 *
 * Ficam fora do componente para poderem ser testadas/reaproveitadas e para
 * manter a tela de Configurações focada só na UI.
 */

/** Limite aceito pela API (~500KB). */
export const LOGO_MAX_BYTES = 500 * 1024;

/** Rótulo do limite usado nas mensagens da UI. */
export const LOGO_MAX_LABEL = "500KB";

/** Formatos aceitos, por MIME type. */
const MIME_ACEITOS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];

/**
 * Extensões aceitas — usadas como plano B quando o browser não consegue
 * inferir o MIME type do arquivo (`file.type` vem string vazia).
 */
const EXTENSOES_ACEITAS = [".png", ".jpg", ".jpeg", ".svg", ".webp"];

/** Texto de apoio exibido abaixo do botão de upload. */
export const LOGO_FORMATOS_LABEL = "PNG, JPG, SVG ou WEBP";

/**
 * Valida o arquivo escolhido ANTES de ler/enviar.
 *
 * @returns a mensagem de erro a exibir, ou `null` se o arquivo está ok.
 */
export function validarArquivoLogo(file: File): string | null {
  const tipoOk = MIME_ACEITOS.includes(file.type.toLowerCase());
  const nome = file.name.toLowerCase();
  const extensaoOk = EXTENSOES_ACEITAS.some((ext) => nome.endsWith(ext));

  // Só caímos na extensão quando o browser não informou o MIME type.
  if (!tipoOk && !(file.type === "" && extensaoOk)) {
    return `Formato não suportado. Envie uma imagem ${LOGO_FORMATOS_LABEL}.`;
  }

  if (file.size > LOGO_MAX_BYTES) {
    return `A imagem deve ter no máximo ${LOGO_MAX_LABEL}.`;
  }

  return null;
}

/**
 * Valida a data URL já codificada.
 *
 * Necessário porque Base64 infla o conteúdo em ~33%: um arquivo de 450KB vira
 * uma string de ~600KB e seria recusado pela API mesmo passando na checagem de
 * tamanho do arquivo. Na prática, o teto real de arquivo fica em ~375KB.
 *
 * @returns a mensagem de erro a exibir, ou `null` se a string cabe no limite.
 */
export function validarDataUrlLogo(dataUrl: string): string | null {
  // A data URL é ASCII, então 1 caractere = 1 byte.
  if (dataUrl.length > LOGO_MAX_BYTES) {
    return `Convertida, a imagem passou de ${LOGO_MAX_LABEL}. Escolha uma imagem menor (até ~350KB) ou comprima antes de enviar.`;
  }
  return null;
}

/**
 * Lê o arquivo e devolve seu conteúdo como data URL
 * (`data:image/png;base64,...`) — exatamente o formato que a API espera.
 */
export function lerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // readAsDataURL sempre produz string; a checagem evita um cast e cobre
      // o caso teórico de result vir null/ArrayBuffer.
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Conteúdo do arquivo em formato inesperado."));
      }
    };

    reader.onerror = () =>
      reject(new Error("Não foi possível ler o arquivo selecionado."));

    reader.readAsDataURL(file);
  });
}

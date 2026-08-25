/**
 * Máscaras de input reutilizáveis. Cada função recebe o valor cru do campo
 * (já digitado/colado, com ou sem formatação) e devolve a string formatada.
 * Funcionam tanto para digitação quanto para paste, pois sempre extraem só
 * os dígitos antes de reaplicar a máscara.
 */

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** "12345678900" -> "123.456.789-00" (máx. 11 dígitos). */
export function maskCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** "12345678000190" -> "12.345.678/0001-90" (máx. 14 dígitos). */
export function maskCNPJ(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/**
 * "81999998888" -> "(81) 99999-8888" (celular, máx. 11 dígitos).
 * Com 10 dígitos formata como fixo: "(81) 9999-8888".
 */
export function maskTelefone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\(\d{2}\) )(\d{4})(\d)/, "$1$2-$3");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\(\d{2}\) )(\d{5})(\d)/, "$1$2-$3");
}

/** "50000000" -> "50000-000" (máx. 8 dígitos). */
export function maskCEP(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

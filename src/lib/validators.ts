import { onlyDigits } from "./masks";

/**
 * Validador de campo: recebe o valor atual e (opcionalmente) o resto do
 * formulário — necessário para regras que comparam campos entre si, como
 * "e-mail do admin diferente do e-mail da imobiliária" ou "data fim depois
 * da data início". Devolve a mensagem de erro em português, ou `undefined`
 * quando o valor é válido.
 */
export type Validator<T, V = object> = (
  value: T,
  values: V,
) => string | undefined;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Encadeia validadores: para no primeiro que devolver erro. */
export function compose<T, V = object>(
  ...validators: Validator<T, V>[]
): Validator<T, V> {
  return (value, values) => {
    for (const validator of validators) {
      const message = validator(value, values);
      if (message) return message;
    }
    return undefined;
  };
}

export function required(message = "Campo obrigatório."): Validator<string> {
  return (value) => (value.trim() ? undefined : message);
}

export function minLength(min: number, message?: string): Validator<string> {
  return (value) =>
    value.trim().length < min
      ? (message ?? `Mínimo de ${min} caracteres.`)
      : undefined;
}

export function email(message = "Digite um e-mail válido."): Validator<string> {
  return (value) => (EMAIL_REGEX.test(value) ? undefined : message);
}

/** Compara com outro campo do mesmo formulário e exige que sejam diferentes. */
export function differentFrom<V extends object>(
  otherField: keyof V,
  message = "Deve ser diferente do outro e-mail informado.",
): Validator<string, V> {
  return (value, values) =>
    value && value === values[otherField] ? message : undefined;
}

/** Compara com outro campo do mesmo formulário e exige que sejam iguais. */
export function matches<V extends object>(
  otherField: keyof V,
  message = "Os valores não coincidem.",
): Validator<string, V> {
  return (value, values) =>
    value !== values[otherField] ? message : undefined;
}

export function cpfValido(
  message = "CPF deve ter 11 dígitos.",
): Validator<string> {
  return (value) => (onlyDigits(value).length === 11 ? undefined : message);
}

export function cnpjValido(
  message = "CNPJ deve ter 14 dígitos.",
): Validator<string> {
  return (value) => (onlyDigits(value).length === 14 ? undefined : message);
}

export function telefoneValido(
  message = "Telefone deve ter ao menos 10 dígitos.",
): Validator<string> {
  return (value) => (onlyDigits(value).length >= 10 ? undefined : message);
}

export function cepValido(
  message = "CEP deve ter o formato 00000-000.",
): Validator<string> {
  return (value) => (onlyDigits(value).length === 8 ? undefined : message);
}

/** Para campos numéricos (inputs type="number", guardados como number). */
export function positiveNumber(
  message = "Deve ser um número maior que zero.",
): Validator<number> {
  return (value) =>
    Number.isFinite(value) && value > 0 ? undefined : message;
}

/** Como `positiveNumber`, mas para inputs type="number" guardados como string. */
export function positiveNumberString(
  message = "Deve ser um número maior que zero.",
): Validator<string> {
  return (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? undefined : message;
  };
}

/** Para <select>: valor vazio ("") é considerado não selecionado. */
export function selectRequired(
  message = "Selecione uma opção.",
): Validator<string> {
  return (value) => (value ? undefined : message);
}

export function validDate(
  message = "Digite uma data válida.",
): Validator<string> {
  return (value) => (Number.isNaN(Date.parse(value)) ? message : undefined);
}

/**
 * Data opcional que, quando preenchida, precisa ser posterior à data de
 * outro campo (ex.: dataFim > dataInicio).
 */
export function optionalDateAfter<V extends object>(
  otherField: keyof V,
  message = "Deve ser posterior à data de início.",
): Validator<string, V> {
  return (value, values) => {
    if (!value) return undefined;
    const other = values[otherField];
    if (typeof other !== "string" || !other) return undefined;
    return Date.parse(value) > Date.parse(other) ? undefined : message;
  };
}

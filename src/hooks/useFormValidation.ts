import { useCallback, useState } from "react";
import type { Validator } from "@/lib/validators";

/** Uma regra de validação por campo do formulário `T`. */
export type ValidationRules<T extends object> = {
  [K in keyof T]?: Validator<T[K], T>;
};

type FieldErrors<T extends object> = Partial<
  Record<keyof T, string>
>;

type Touched<T extends object> = Partial<
  Record<keyof T, boolean>
>;

/**
 * Hook de validação inline para formulários controlados por `useState` no
 * componente (não gerencia os valores em si, só valida contra as regras).
 *
 * Regra de UX: o erro de um campo só aparece após ele perder o foco
 * (`handleBlur`) ou após uma tentativa de submit (`validateAll`). Depois
 * disso, o campo passa a validar em tempo real (`handleChange`).
 */
export function useFormValidation<T extends object>(
  rules: ValidationRules<T>,
) {
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Touched<T>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const runValidator = useCallback(
    <K extends keyof T>(field: K, value: T[K], values: T): string | undefined => {
      const validator = rules[field];
      return validator ? validator(value, values) : undefined;
    },
    [rules],
  );

  const validate = useCallback(
    <K extends keyof T>(field: K, value: T[K], values: T) => {
      const message = runValidator(field, value, values);
      setErrors((prev) => ({ ...prev, [field]: message }));
      return message;
    },
    [runValidator],
  );

  /** Chamar no onBlur do campo. */
  const handleBlur = useCallback(
    <K extends keyof T>(field: K, value: T[K], values: T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validate(field, value, values);
    },
    [validate],
  );

  /** Chamar no onChange do campo — só revalida se ele já foi tocado. */
  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K], values: T) => {
      if (touched[field] || submitAttempted) {
        validate(field, value, values);
      }
    },
    [touched, submitAttempted, validate],
  );

  /** Chamar no submit: valida tudo, marca todos os campos como tocados. */
  const validateAll = useCallback(
    (values: T): boolean => {
      const nextErrors: FieldErrors<T> = {};
      (Object.keys(rules) as (keyof T)[]).forEach((field) => {
        const message = runValidator(field, values[field], values);
        if (message) nextErrors[field] = message;
      });
      setErrors(nextErrors);
      setTouched((prev) => {
        const next = { ...prev };
        (Object.keys(rules) as (keyof T)[]).forEach((field) => {
          next[field] = true;
        });
        return next;
      });
      setSubmitAttempted(true);
      return Object.keys(nextErrors).length === 0;
    },
    [rules, runValidator],
  );

  const getError = useCallback(
    (field: keyof T): string | undefined =>
      touched[field] ? errors[field] : undefined,
    [touched, errors],
  );

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  /** Injeta um erro vindo do backend (ex.: e-mail já cadastrado). */
  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  }, []);

  // Botão de submit só fica desabilitado depois da primeira tentativa —
  // antes disso o usuário não teria como saber por que está desabilitado.
  const hasVisibleErrors =
    submitAttempted && Object.values(errors).some((message) => Boolean(message));

  return {
    getError,
    handleBlur,
    handleChange,
    validateAll,
    clearError,
    setFieldError,
    reset,
    submitAttempted,
    isSubmitDisabled: hasVisibleErrors,
  };
}

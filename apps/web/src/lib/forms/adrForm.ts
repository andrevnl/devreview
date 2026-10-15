import { FIELD_LIMITS, tooLongError } from "@/lib/validation";
import type { AdrInput } from "@/store/slices/adrsSlice";
import { Adr, AdrStatus } from "@/types";

export interface AdrFormValues {
  title: string;
  context: string;
  decision: string;
  status: AdrStatus;
}

export type AdrFormErrors = Partial<Record<keyof AdrFormValues, string>>;

/** Valores iniciais do formulário de nova ADR. */
export function emptyAdrForm(): AdrFormValues {
  return { title: "", context: "", decision: "", status: "proposed" };
}

/** Preenche o formulário com uma ADR existente. */
export function adrToForm(adr: Adr): AdrFormValues {
  return {
    title: adr.title,
    context: adr.context,
    decision: adr.decision,
    status: adr.status,
  };
}

/** Erros de campos preenchidos com valor inválido (campo vazio não conta). */
export function getAdrFormErrors(values: AdrFormValues): AdrFormErrors {
  const errors: AdrFormErrors = {};
  const checks: [keyof AdrFormValues, string, number][] = [
    ["title", values.title, FIELD_LIMITS.adrTitle],
    ["context", values.context, FIELD_LIMITS.adrContext],
    ["decision", values.decision, FIELD_LIMITS.adrDecision],
  ];
  for (const [field, value, max] of checks) {
    const error = tooLongError(value.trim(), max);
    if (error) errors[field] = error;
  }
  return errors;
}

/** Converte o formulário no que é gravado, ou null se incompleto/inválido. */
export function toAdrInput(values: AdrFormValues): AdrInput | null {
  const input = {
    title: values.title.trim(),
    context: values.context.trim(),
    decision: values.decision.trim(),
    status: values.status,
  };
  if (!input.title || !input.context || !input.decision) return null;
  if (Object.keys(getAdrFormErrors(values)).length) return null;
  return input;
}

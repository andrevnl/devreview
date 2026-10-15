/**
 * Limites de tamanho dos campos de texto gravados pelo web app.
 * Espelham as check constraints da migration write_input_constraints.
 */
export const FIELD_LIMITS = {
  ruleText: 500,
  adrTitle: 200,
  adrContext: 4000,
  adrDecision: 4000,
  reviewRepo: 200,
  reviewPrUrl: 500,
  reviewSummary: 4000,
} as const;

/** Mensagem de erro para texto acima do limite, ou null se couber. */
export function tooLongError(value: string, max: number): string | null {
  return value.length > max ? `Máximo de ${max} caracteres.` : null;
}

/** True se a URL é absoluta e usa http ou https. */
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * URL segura para usar em href: só http(s). Qualquer outra coisa
 * (javascript:, data:, texto solto) vira undefined e o link não é renderizado.
 */
export function safeHref(value: string): string | undefined {
  return isHttpUrl(value) ? value : undefined;
}

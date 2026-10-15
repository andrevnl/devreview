import { FIELD_LIMITS, isHttpUrl, tooLongError } from "@/lib/validation";
import type { ReviewInput } from "@/store/slices/historySlice";
import { ReviewHistory } from "@/types";

/** Campos do formulário como digitados (inputs numéricos chegam como texto). */
export interface ReviewFormValues {
  repo: string;
  prNumber: string;
  prUrl: string;
  issues: string;
  summary: string;
  /** Data local no formato do <input type="date"> (YYYY-MM-DD). */
  date: string;
}

export type ReviewFormErrors = Partial<Record<keyof ReviewFormValues, string>>;

const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

/** Data local no formato do <input type="date"> (YYYY-MM-DD). */
export function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** URL do PR no GitHub montada a partir do repositório e do número. */
export function defaultPrUrl(repo: string, prNumber: string): string {
  return `https://github.com/${repo}/pull/${prNumber}`;
}

/** Valores iniciais do formulário de novo review (data de hoje). */
export function emptyReviewForm(now = new Date()): ReviewFormValues {
  return {
    repo: "",
    prNumber: "",
    prUrl: "",
    issues: "0",
    summary: "",
    date: toDateInput(now),
  };
}

/** Preenche o formulário com um review existente. */
export function reviewToForm(review: ReviewHistory): ReviewFormValues {
  return {
    repo: review.repo,
    prNumber: String(review.pr_number),
    prUrl: review.pr_url,
    issues: String(review.issues_found),
    summary: review.review_summary ?? "",
    date: toDateInput(new Date(review.reviewed_at)),
  };
}

// Maior valor de uma coluna int do Postgres.
const PG_INT_MAX = 2_147_483_647;

function isIntegerAtLeast(value: string, min: number): boolean {
  const n = Number(value);
  return /^\d+$/.test(value.trim()) && n >= min && n <= PG_INT_MAX;
}

/** Erros de campos preenchidos com valor inválido (campo vazio não conta). */
export function getReviewFormErrors(values: ReviewFormValues): ReviewFormErrors {
  const errors: ReviewFormErrors = {};
  const repo = values.repo.trim();
  const prUrl = values.prUrl.trim();

  if (repo) {
    errors.repo =
      tooLongError(repo, FIELD_LIMITS.reviewRepo) ??
      (REPO_PATTERN.test(repo) ? undefined : "Use o formato dono/repositório.");
  }
  if (values.prNumber.trim() && !isIntegerAtLeast(values.prNumber, 1)) {
    errors.prNumber = "Número inteiro positivo.";
  }
  if (prUrl) {
    errors.prUrl =
      tooLongError(prUrl, FIELD_LIMITS.reviewPrUrl) ??
      (isHttpUrl(prUrl) ? undefined : "A URL deve começar com http:// ou https://.");
  }
  if (values.issues.trim() && !isIntegerAtLeast(values.issues, 0)) {
    errors.issues = "Número inteiro, zero ou maior.";
  }
  const summaryError = tooLongError(values.summary.trim(), FIELD_LIMITS.reviewSummary);
  if (summaryError) errors.summary = summaryError;

  for (const key of Object.keys(errors) as (keyof ReviewFormErrors)[]) {
    if (!errors[key]) delete errors[key];
  }
  return errors;
}

/**
 * Data/hora gravada em reviewed_at. Na edição, mantém o horário original se a
 * data não mudou; num review novo de hoje, usa o horário atual. Nos outros
 * casos usa meio-dia local, para o dia não trocar por causa do fuso.
 */
export function reviewedAtFromForm(
  date: string,
  original?: ReviewHistory | null,
  now = new Date()
): string {
  if (original) {
    if (date === toDateInput(new Date(original.reviewed_at))) {
      return original.reviewed_at;
    }
  } else if (date === toDateInput(now)) {
    return now.toISOString();
  }
  return new Date(`${date}T12:00:00`).toISOString();
}

/**
 * Converte o formulário no que é gravado, ou null se incompleto/inválido.
 * Sem URL, ela é montada a partir do repositório e do número do PR.
 */
export function toReviewInput(
  values: ReviewFormValues,
  original?: ReviewHistory | null,
  now = new Date()
): ReviewInput | null {
  const repo = values.repo.trim();
  const prNumber = values.prNumber.trim();
  if (!repo || !prNumber || !values.issues.trim() || !values.date) return null;
  if (Object.keys(getReviewFormErrors(values)).length) return null;

  return {
    repo,
    pr_number: Number(prNumber),
    pr_url: values.prUrl.trim() || defaultPrUrl(repo, prNumber),
    issues_found: Number(values.issues),
    review_summary: values.summary.trim() || null,
    reviewed_at: reviewedAtFromForm(values.date, original, now),
  };
}

import { FIELD_LIMITS, tooLongError } from "@/lib/validation";
import type { RuleInput } from "@/store/slices/rulesSlice";
import { ReviewRule, RuleCategory, RuleSeverity } from "@/types";

export interface RuleFormValues {
  rule: string;
  category: RuleCategory;
  severity: RuleSeverity;
  active: boolean;
}

export type RuleFormErrors = Partial<Record<keyof RuleFormValues, string>>;

/** Valores iniciais do formulário de nova regra. */
export function emptyRuleForm(): RuleFormValues {
  return { rule: "", category: "style", severity: "warning", active: true };
}

/** Preenche o formulário com uma regra existente. */
export function ruleToForm(rule: ReviewRule): RuleFormValues {
  return {
    rule: rule.rule,
    category: rule.category,
    severity: rule.severity,
    active: rule.active,
  };
}

/** Erros de campos preenchidos com valor inválido (campo vazio não conta). */
export function getRuleFormErrors(values: RuleFormValues): RuleFormErrors {
  const errors: RuleFormErrors = {};
  const ruleError = tooLongError(values.rule.trim(), FIELD_LIMITS.ruleText);
  if (ruleError) errors.rule = ruleError;
  return errors;
}

/** Converte o formulário no que é gravado, ou null se incompleto/inválido. */
export function toRuleInput(values: RuleFormValues): RuleInput | null {
  const rule = values.rule.trim();
  if (!rule || Object.keys(getRuleFormErrors(values)).length) return null;
  return {
    rule,
    category: values.category,
    severity: values.severity,
    active: values.active,
  };
}

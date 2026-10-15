-- Validação no banco dos campos que o web app grava com a chave publishable.
-- Vale também para quem chama a API REST direto, sem passar pela tela.
-- Os limites ficam espelhados em apps/web/src/lib/validation.ts (FIELD_LIMITS).

alter table review_rules
  add constraint review_rules_rule_length
    check (char_length(rule) between 1 and 500);

alter table adrs
  add constraint adrs_title_length
    check (char_length(title) between 1 and 200),
  add constraint adrs_context_length
    check (char_length(context) between 1 and 4000),
  add constraint adrs_decision_length
    check (char_length(decision) between 1 and 4000);

-- pr_url vira href no web app: só http(s), para bloquear javascript: e afins.
alter table review_history
  add constraint review_history_pr_url_http
    check (pr_url ~* '^https?://[^\s]+$'),
  add constraint review_history_pr_url_length
    check (char_length(pr_url) <= 500),
  add constraint review_history_repo_length
    check (char_length(repo) between 1 and 200),
  add constraint review_history_summary_length
    check (review_summary is null or char_length(review_summary) <= 4000),
  add constraint review_history_pr_number_positive
    check (pr_number > 0),
  add constraint review_history_issues_found_non_negative
    check (issues_found >= 0);

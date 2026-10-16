-- Um review por PR: a record_review do mcp-server faz upsert nessa chave, então
-- repetir a chamada (retry do cliente, modelo chamando duas vezes) atualiza a
-- linha em vez de duplicar e inflar as métricas de get_review_metrics.

alter table review_history
  add constraint review_history_team_repo_pr_unique
    unique (team_id, repo, pr_number);

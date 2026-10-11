-- RLS em todas as tabelas. Sem login no app: anon/authenticated só leem.
-- Escrita fica bloqueada para a chave publishable (sem policies de insert/update/delete).

alter table teams enable row level security;
alter table review_rules enable row level security;
alter table review_history enable row level security;
alter table adrs enable row level security;

-- Leitura pública das tabelas usadas pelo web app e pelo mcp-server.
-- `teams` fica sem policy (ninguém lê hoje).
create policy "Leitura pública de review_rules"
  on review_rules for select
  to anon, authenticated
  using (true);

create policy "Leitura pública de review_history"
  on review_history for select
  to anon, authenticated
  using (true);

create policy "Leitura pública de adrs"
  on adrs for select
  to anon, authenticated
  using (true);

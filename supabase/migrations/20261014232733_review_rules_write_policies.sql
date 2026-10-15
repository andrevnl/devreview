-- Escrita em review_rules pelo web app (sem login, chave publishable).
-- Limitada ao time demo do seed: as outras tabelas continuam só leitura.

create policy "Inserção de review_rules do time demo"
  on review_rules for insert
  to anon, authenticated
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Edição de review_rules do time demo"
  on review_rules for update
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111')
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Exclusão de review_rules do time demo"
  on review_rules for delete
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111');

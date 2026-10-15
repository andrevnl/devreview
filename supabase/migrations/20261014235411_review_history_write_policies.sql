-- Escrita em review_history pelo web app (sem login, chave publishable).
-- Limitada ao time demo do seed, como em review_rules e adrs.

create policy "Inserção de review_history do time demo"
  on review_history for insert
  to anon, authenticated
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Edição de review_history do time demo"
  on review_history for update
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111')
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Exclusão de review_history do time demo"
  on review_history for delete
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111');

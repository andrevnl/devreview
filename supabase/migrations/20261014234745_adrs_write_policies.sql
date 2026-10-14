-- Escrita em adrs pelo web app (sem login, chave publishable).
-- Limitada ao time demo do seed, como em review_rules.

create policy "Inserção de adrs do time demo"
  on adrs for insert
  to anon, authenticated
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Edição de adrs do time demo"
  on adrs for update
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111')
  with check (team_id = '11111111-1111-1111-1111-111111111111');

create policy "Exclusão de adrs do time demo"
  on adrs for delete
  to anon, authenticated
  using (team_id = '11111111-1111-1111-1111-111111111111');

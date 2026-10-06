import { TEAM_ID } from "../constants.js";
import type { ReviewRule } from "../schemas.js";

// Espelha as regras de supabase/seed.sql (mesma ordem). Os IDs são fixos aqui
// porque no seed eles são gerados aleatoriamente.
export const mockReviewRules: readonly ReviewRule[] = [
  { id: "00000000-0000-4000-8000-000000000001", team_id: TEAM_ID, category: "security",     severity: "error",   active: true,  rule: "Nunca expor chaves de API ou tokens em código-fonte" },
  { id: "00000000-0000-4000-8000-000000000002", team_id: TEAM_ID, category: "architecture", severity: "error",   active: true,  rule: "Separar lógica de negócio da camada de apresentação" },
  { id: "00000000-0000-4000-8000-000000000003", team_id: TEAM_ID, category: "performance",  severity: "warning", active: true,  rule: "Evitar renderizações desnecessárias em componentes React" },
  { id: "00000000-0000-4000-8000-000000000004", team_id: TEAM_ID, category: "style",        severity: "warning", active: true,  rule: "Usar nomenclatura camelCase para variáveis e funções" },
  { id: "00000000-0000-4000-8000-000000000005", team_id: TEAM_ID, category: "architecture", severity: "warning", active: false, rule: "Evitar dependências circulares entre módulos" },
  { id: "00000000-0000-4000-8000-000000000006", team_id: TEAM_ID, category: "style",        severity: "info",    active: true,  rule: "Documentar funções públicas com JSDoc" },
  { id: "00000000-0000-4000-8000-000000000007", team_id: TEAM_ID, category: "performance",  severity: "info",    active: true,  rule: "Utilizar lazy loading para rotas secundárias" },
  { id: "00000000-0000-4000-8000-000000000008", team_id: TEAM_ID, category: "security",     severity: "warning", active: true,  rule: "Validar e sanitizar todos os inputs do usuário" },
];

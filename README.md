# DevReview

Ferramenta de code review assistida por IA — projeto base do Curso 5: MCP, Conectando o Agent ao Mundo Real.

## Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Redux Toolkit
- **Backend (construído durante o curso):** Node.js, @modelcontextprotocol/sdk, Zod
- **Banco de dados:** Supabase (PostgreSQL)

## Pré-requisitos

- Node.js 20+
- npm 10+
- Supabase CLI (`npm install -g supabase`), usado para aplicar migrations no projeto na nuvem

## Banco de dados

O projeto usa somente o Supabase na nuvem (`https://mxhyhdqktujfwtgydjte.supabase.co`, ref `mxhyhdqktujfwtgydjte`). Não há banco local.

O RLS deixa a chave publishable só ler, com uma exceção: o web app pode criar, editar e excluir `review_rules`, `adrs` e `review_history` do time demo (`11111111-1111-1111-1111-111111111111`). Como a chave fica exposta no navegador, qualquer pessoa com ela pode alterar esses dados.

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente (já apontam para o projeto na nuvem)
cp apps/web/.env.example apps/web/.env

# 3. Iniciar o frontend
npm run dev
```

O app abre em `http://localhost:5173`.

## MCP no Claude Code

O `.mcp.json` não é versionado, porque vai guardar tokens (GitHub MCP, chave de escrita do Supabase). Cada pessoa mantém o seu na raiz do projeto.

O servidor `supabase` usa `mcp.supabase.com` e pede login no Supabase (OAuth) na primeira conexão.

## MCP Server

Pré-requisito: Node.js 22.19+ (exigido pelo MCP Inspector v2).

```bash
cp apps/mcp-server/.env.example apps/mcp-server/.env
npm run mcp:inspector
```

Abra a URL completa impressa no terminal (`http://127.0.0.1:6274?MCP_INSPECTOR_API_TOKEN=...`). O Inspector carrega `apps/mcp-server/inspector.config.json` com o servidor **devreview** (STDIO, `node --env-file=.env build/index.js`), que expõe as tools `get_team_review_rules`, `search_team_adrs` e `get_review_metrics`, o resource `review://schema` e o prompt `code-review`. As tools leem do Supabase na nuvem com a chave publishable (sujeita ao RLS; o mcp-server só faz leitura). Time demo: `11111111-1111-1111-1111-111111111111`.

Pela linha de comando:

```bash
npm run mcp:inspector:cli -- --server devreview --method tools/list
```

## Estrutura

```
devreview/
├── apps/
│   ├── web/          # Frontend React
│   └── mcp-server/   # MCP Server (construído durante o curso)
├── supabase/         # Configuração, migrations e seed data
└── docs/             # Documentação do curso (gitignored)
```

# DevReview

Ferramenta de code review assistida por IA — projeto base do Curso 5: MCP, Conectando o Agent ao Mundo Real.

## Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Redux Toolkit
- **Backend (construído durante o curso):** Node.js, @modelcontextprotocol/sdk, Zod
- **Banco de dados:** Supabase (PostgreSQL)

## Pré-requisitos

- Node.js 20+
- npm 10+
- Supabase CLI (`npm install -g supabase`)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o Supabase local
npx supabase start

# 3. Aplicar migrations e seed data
npx supabase db reset

# 4. Copiar variáveis de ambiente
cp apps/web/.env.example apps/web/.env

# 5. Iniciar o frontend
npm run dev
```

O app abre em `http://localhost:5173`.
O Supabase Studio fica em `http://localhost:54323`.

## MCP Server

Pré-requisito: Node.js 22.19+ (exigido pelo MCP Inspector v2).

```bash
cp apps/mcp-server/.env.example apps/mcp-server/.env
npm run mcp:inspector
```

Abra a URL completa impressa no terminal (`http://127.0.0.1:6274?MCP_INSPECTOR_API_TOKEN=...`). O Inspector carrega `apps/mcp-server/inspector.config.json` com o servidor **devreview** (STDIO, `node --env-file=.env build/index.js`), que expõe a tool `get_team_review_rules`. Nesta fase os dados são mock, espelhando `supabase/seed.sql` (time demo `11111111-1111-1111-1111-111111111111`).

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

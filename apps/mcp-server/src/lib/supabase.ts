import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// O .env é carregado pelo Node (`node --env-file=.env build/index.js`).
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
});

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase lazy: o servidor sobe mesmo sem `.env`.
 * Ainda não é usado pelas tools (dados mock nesta fase).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const env = envSchema.safeParse(process.env);
  if (!env.success) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios. " +
        "Copie apps/mcp-server/.env.example para apps/mcp-server/.env."
    );
  }
  client = createClient(env.data.SUPABASE_URL, env.data.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

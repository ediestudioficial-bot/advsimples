import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_VERSION } from "@/lib/version";

function sanitize(value: string) {
  return value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]").replace(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g, "[telefone]").slice(0, 2500);
}

export async function reportServerError(supabase: SupabaseClient, operation: string, route: string, error: unknown) {
  const message = sanitize(error instanceof Error ? error.message : String((error as { message?: string })?.message || error || "Erro desconhecido"));
  console.error(`[ADV Simples ${APP_VERSION}] ${operation}: ${message}`);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("beta_reports").insert({ usuario_id: user.id, tipo: "erro", categoria: "operacao_servidor", mensagem: message, rota: route, app_version: APP_VERSION, metadata: { operation } });
  } catch {}
}

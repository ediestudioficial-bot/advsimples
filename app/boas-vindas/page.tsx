import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WelcomeOnboarding from "./welcome-onboarding";

export default async function BoasVindasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome,onboarding")
    .eq("id", user.id)
    .maybeSingle();

  const onboarding = (perfil?.onboarding ?? {}) as Record<string, boolean>;
  if (onboarding.welcome) redirect("/hoje");

  const nome = perfil?.nome || user.user_metadata?.nome || user.user_metadata?.full_name || user.email?.split("@")[0] || "Advogado";

  return <WelcomeOnboarding nome={nome} onboarding={onboarding} />;
}

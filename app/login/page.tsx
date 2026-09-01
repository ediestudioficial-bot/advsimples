"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/hoje");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm card border border-outline-variant rounded-xl p-8 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            gavel
          </span>
          <h1 className="font-heading text-2xl font-bold text-secondary">ADV Simples</h1>
          <p className="text-on-surface-variant text-sm">Você advoga. A gente organiza.</p>
        </div>

        {erro && (
          <div className="text-sm text-error bg-error-container/20 border border-error rounded-md px-3 py-2">
            {erro}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-surface-container-lowest border border-outline-variant px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-secondary text-on-secondary disabled:opacity-50 font-heading font-semibold rounded-full py-2.5 hover:opacity-90 transition"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

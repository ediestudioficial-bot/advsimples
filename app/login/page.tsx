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
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-5">
      <form
        onSubmit={handleLogin}
        className="card border border-outline-variant rounded-2xl shadow-2xl"
        style={{
          width: "min(100%, 420px)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className="flex items-center justify-center rounded-2xl bg-primary-container border border-outline-variant"
            style={{ width: 64, height: 64 }}
          >
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: 34 }}
            >
              gavel
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-secondary mt-2">ADV Simples</h1>
          <p className="text-on-surface-variant text-sm">Você advoga. A gente organiza.</p>
        </div>

        {erro && (
          <div className="text-sm text-error bg-error-container/20 border border-error rounded-lg px-4 py-3">
            {erro}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
            style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
            style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-secondary text-on-secondary disabled:opacity-50 font-heading font-semibold rounded-xl hover:opacity-90 transition"
          style={{ minHeight: 48, fontSize: 16 }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

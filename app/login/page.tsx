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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#08111f] px-5 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#b7832f]/15 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-80 w-80 rounded-full bg-[#16345f]/30 blur-3xl" />
        <div className="absolute left-[-80px] top-1/3 h-64 w-64 rounded-full bg-[#0d2342]/35 blur-3xl" />
      </div>

      <section className="relative w-full max-w-[460px]">
        <div className="absolute inset-0 translate-y-5 scale-[0.96] rounded-[32px] bg-black/40 blur-2xl" />

        <form
          onSubmit={handleLogin}
          className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#101b2c]/95 p-7 sm:p-9 shadow-[0_28px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e1b35c]/70 to-transparent" />

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-[122px] w-[150px] items-center justify-center rounded-[26px] border border-white/8 bg-gradient-to-b from-white/[0.045] to-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_35px_rgba(0,0,0,0.28)]">
              <img
                src="/adv-simples-mark.svg"
                alt="ADV Simples"
                className="h-[112px] w-[136px] object-contain"
              />
            </div>

            <h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] text-white">
              ADV <span className="text-[#d7a54d]">SIMPLES</span>
            </h1>
            <p className="mt-1.5 text-sm tracking-[0.01em] text-slate-400">
              Você advoga. A gente organiza.
            </p>
          </div>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9963d] shadow-[0_0_12px_rgba(201,150,61,0.7)]" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {erro && (
            <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-inner">
              {erro}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[54px] w-full rounded-2xl border border-white/10 bg-[#0a1423] px-4 text-[15px] text-white outline-none placeholder:text-slate-600 shadow-[inset_0_1px_8px_rgba(0,0,0,0.28)] transition focus:border-[#d7a54d]/60 focus:ring-4 focus:ring-[#d7a54d]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[54px] w-full rounded-2xl border border-white/10 bg-[#0a1423] px-4 text-[15px] text-white outline-none placeholder:text-slate-600 shadow-[inset_0_1px_8px_rgba(0,0,0,0.28)] transition focus:border-[#d7a54d]/60 focus:ring-4 focus:ring-[#d7a54d]/10"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-6 h-[54px] w-full rounded-2xl border border-[#efc36e]/35 bg-gradient-to-b from-[#e1b35c] to-[#b77c25] font-heading text-[15px] font-bold tracking-[0.02em] text-[#172033] shadow-[0_12px_26px_rgba(183,124,37,0.28),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <p className="mt-5 text-center text-[11px] uppercase tracking-[0.18em] text-slate-600">
            Gestão jurídica simples e segura
          </p>
        </form>
      </section>
    </main>
  );
}

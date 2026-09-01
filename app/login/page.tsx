"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "../theme-toggle";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [erro,setErro]=useState<string|null>(null);
  const [carregando,setCarregando]=useState(false);
  const [carregandoGoogle,setCarregandoGoogle]=useState(false);
  const router=useRouter();

  async function handleLogin(e:React.FormEvent){
    e.preventDefault();setErro(null);setCarregando(true);
    const supabase=createClient();
    const{error}=await supabase.auth.signInWithPassword({email,password});
    setCarregando(false);
    if(error){setErro("E-mail ou senha inválidos.");return}
    router.push("/hoje");router.refresh();
  }

  async function handleGoogleLogin(){
    setErro(null);setCarregandoGoogle(true);
    const supabase=createClient();
    const{error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:`${window.location.origin}/auth/callback`}
    });
    if(error){setCarregandoGoogle(false);setErro("Não foi possível entrar com o Google. Tente novamente.");}
  }

  return <main className="auth-shell relative min-h-screen w-full overflow-hidden px-5 py-10 flex items-center justify-center">
    <div className="absolute right-5 top-5 z-30"><ThemeToggle/></div>
    <div className="pointer-events-none absolute inset-0"><div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#b7832f]/12 blur-3xl"/><div className="absolute bottom-[-120px] right-[-60px] h-80 w-80 rounded-full bg-[#5f78a3]/10 blur-3xl"/></div>
    <section className="relative w-full max-w-[460px]">
      <div className="absolute inset-0 translate-y-5 scale-[.96] rounded-[32px] bg-black/20 blur-2xl"/>
      <form onSubmit={handleLogin} className="auth-panel relative overflow-hidden rounded-[30px] border p-7 sm:p-9 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="auth-logo-wrap mb-4 flex h-[112px] w-[112px] items-center justify-center rounded-[28px] border shadow-xl"><img src="/icon.svg" alt="ADV Simples" className="h-[94px] w-[94px]"/></div>
          <h1 className="auth-title font-heading text-[30px] font-bold">ADV <span className="text-[#c98b27]">SIMPLES</span></h1>
          <p className="auth-muted mt-1.5 text-sm">Você advoga. A gente organiza.</p>
        </div>
        <div className="my-7 h-px bg-slate-400/20"/>
        {erro&&<div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-600">{erro}</div>}
        <div className="space-y-4">
          <label className="block"><span className="auth-muted mb-2 block text-xs font-semibold uppercase tracking-[.16em]">E-mail</span><input type="email" required autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={e=>setEmail(e.target.value)} className="auth-input h-[54px] w-full rounded-2xl px-4 outline-none"/></label>
          <label className="block"><span className="auth-muted mb-2 block text-xs font-semibold uppercase tracking-[.16em]">Senha</span><input type="password" required autoComplete="current-password" placeholder="Sua senha" value={password} onChange={e=>setPassword(e.target.value)} className="auth-input h-[54px] w-full rounded-2xl px-4 outline-none"/></label>
        </div>
        <a href="/recuperar-senha" className="auth-muted mt-3 block text-right text-xs hover:text-[#b77e1f]">Esqueci minha senha</a>
        <button type="submit" disabled={carregando||carregandoGoogle} className="mt-5 h-[54px] w-full rounded-2xl bg-gradient-to-b from-[#e8b74f] to-[#bd8127] font-heading font-bold text-[#172033] shadow-xl disabled:opacity-50">{carregando?"Entrando...":"Entrar"}</button>
        <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-slate-400/20"/><span className="auth-muted text-[11px] uppercase tracking-[.16em]">ou</span><div className="h-px flex-1 bg-slate-400/20"/></div>
        <button type="button" onClick={handleGoogleLogin} disabled={carregando||carregandoGoogle} className="auth-input flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl px-4 font-semibold transition hover:opacity-90 disabled:opacity-50" aria-label="Continuar com Google">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z"/><path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"/></svg>
          {carregandoGoogle?"Abrindo Google...":"Continuar com Google"}
        </button>
        <a href="/cadastro" className="auth-muted mt-4 block text-center text-sm hover:text-[#b77e1f]">Primeiro acesso? <strong>Criar conta</strong></a>
        <p className="auth-muted mt-5 text-center text-[11px] uppercase tracking-[.18em] opacity-60">Gestão jurídica simples e segura</p>
      </form>
    </section>
  </main>;
}

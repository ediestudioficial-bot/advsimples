"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RedefinirSenhaPage(){
  const [senha,setSenha]=useState(""); const [confirmar,setConfirmar]=useState(""); const [msg,setMsg]=useState<string|null>(null); const [loading,setLoading]=useState(false); const router=useRouter();
  async function salvar(e:React.FormEvent){e.preventDefault();if(senha!==confirmar){setMsg("As senhas não coincidem.");return;}setLoading(true);const supabase=createClient();const {error}=await supabase.auth.updateUser({password:senha});setLoading(false);if(error){setMsg("Não foi possível atualizar a senha. Solicite um novo link.");return;}router.push("/hoje");router.refresh();}
  return <main className="min-h-screen bg-[#08111f] px-5 py-10 flex items-center justify-center"><section className="w-full max-w-[460px] card p-7 sm:p-9"><div className="text-center mb-7"><img src="/icon.svg" alt="ADV Simples" className="w-20 h-20 mx-auto mb-4"/><p className="text-secondary text-[10px] uppercase tracking-[.24em] font-semibold">Segurança</p><h1 className="font-heading text-3xl font-bold text-white mt-2">Nova senha</h1></div>{msg&&<div className="mb-4 rounded-xl border border-secondary/20 bg-secondary/5 p-3 text-sm text-on-surface">{msg}</div>}<form onSubmit={salvar} className="space-y-3"><input value={senha} onChange={e=>setSenha(e.target.value)} type="password" required minLength={8} placeholder="Nova senha"/><input value={confirmar} onChange={e=>setConfirmar(e.target.value)} type="password" required minLength={8} placeholder="Confirmar nova senha"/><button disabled={loading} className="w-full bg-secondary text-on-secondary font-heading font-bold py-3">{loading?"Salvando...":"Salvar nova senha"}</button></form></section></main>;
}

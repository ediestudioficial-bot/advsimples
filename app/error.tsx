"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";

function scrub(text: string) {
  return text.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]").replace(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g, "[telefone]").slice(0, 5000);
}

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const log = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("beta_reports").insert({ usuario_id: user.id, tipo: "erro", categoria: "render", mensagem: scrub(error.message || "Falha de renderização"), stack: error.stack ? scrub(error.stack) : null, rota: window.location.pathname, app_version: APP_VERSION, user_agent: navigator.userAgent.slice(0, 700), display_mode: window.matchMedia?.("(display-mode: standalone)").matches ? "pwa" : "browser", online: navigator.onLine, tema: document.documentElement.dataset.theme || "dark", metadata: { digest: error.digest || null } });
      } catch {}
    };
    void log();
  }, [error]);

  return <main className="min-h-screen flex items-center justify-center px-5"><section className="card w-full max-w-md p-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error"><span className="material-symbols-outlined text-3xl">error</span></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[.2em] text-secondary">Beta {APP_VERSION}</p><h1 className="mt-2 font-heading text-2xl font-bold text-on-surface">Algo não carregou como deveria</h1><p className="mt-2 text-sm text-on-surface-variant">O erro técnico foi registrado automaticamente, sem enviar conteúdo jurídico.</p><button onClick={reset} className="mt-6 w-full bg-secondary py-3 font-heading font-bold text-on-secondary">Tentar novamente</button></section></main>;
}

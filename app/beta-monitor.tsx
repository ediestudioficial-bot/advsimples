"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";

type ReportType = "erro" | "feedback";

function sanitize(value: unknown, max = 3500) {
  const raw = typeof value === "string" ? value : value instanceof Error ? `${value.name}: ${value.message}` : String(value ?? "");
  return raw.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]").replace(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g, "[telefone]").slice(0, max);
}

function deviceContext(pathname: string) {
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { rota: pathname, app_version: APP_VERSION, user_agent: navigator.userAgent.slice(0, 700), display_mode: standalone ? "pwa" : "browser", online: navigator.onLine, tema: document.documentElement.dataset.theme || "dark", metadata: { language: navigator.language, platform: navigator.platform, viewport: `${window.innerWidth}x${window.innerHeight}` } };
}

async function persistReport(type: ReportType, pathname: string, payload: { categoria?: string; mensagem?: string; stack?: string; metadata?: Record<string, unknown> }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const context = deviceContext(pathname);
    await supabase.from("beta_reports").insert({ usuario_id: user.id, tipo: type, categoria: payload.categoria || null, mensagem: payload.mensagem ? sanitize(payload.mensagem) : null, stack: payload.stack ? sanitize(payload.stack, 6000) : null, ...context, metadata: { ...context.metadata, ...(payload.metadata || {}) } });
  } catch {}
}

export default function BetaMonitor() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("problema");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user))).catch(() => setAuthenticated(false)); }, [supabase, pathname]);

  useEffect(() => {
    if (!authenticated) return;
    const onError = (event: ErrorEvent) => void persistReport("erro", pathname, { categoria: "javascript", mensagem: event.message || "Erro de JavaScript", stack: event.error?.stack, metadata: { source: event.filename?.split("/").pop(), line: event.lineno, column: event.colno } });
    const onRejection = (event: PromiseRejectionEvent) => { const reason = event.reason; void persistReport("erro", pathname, { categoria: "promise", mensagem: reason instanceof Error ? reason.message : sanitize(reason), stack: reason instanceof Error ? reason.stack : undefined }); };
    window.addEventListener("error", onError); window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, [authenticated, pathname]);

  if (!authenticated) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!message.trim()) return; setSending(true);
    await persistReport("feedback", pathname, { categoria: category, mensagem: message.trim() });
    setSending(false); setSent(true); setMessage(""); window.setTimeout(() => { setSent(false); setOpen(false); }, 900);
  }

  return <><button type="button" onClick={() => setOpen(true)} aria-label="Enviar feedback beta" title="Reportar problema ou sugestão" className="fixed right-4 z-[65] flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/40 bg-surface-container-low/90 text-secondary shadow-xl backdrop-blur-xl" style={{ bottom: "calc(88px + env(safe-area-inset-bottom))" }}><span className="material-symbols-outlined text-[21px]">bug_report</span></button>{open && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-3 sm:items-center" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}><form onSubmit={submit} className="card w-full max-w-md p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-secondary">Beta {APP_VERSION}</p><h2 className="mt-1 font-heading text-xl font-bold text-on-surface">Conte o que aconteceu</h2><p className="mt-1 text-xs text-on-surface-variant">A tela e os dados técnicos do aparelho serão anexados automaticamente. Nenhum dado jurídico é enviado.</p></div><button type="button" onClick={() => setOpen(false)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button></div><label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Tipo</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 px-3"><option value="problema">Algo não funcionou</option><option value="confuso">Achei algo confuso</option><option value="sugestao">Tenho uma sugestão</option></select><label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">O que você percebeu?</label><textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1200} placeholder="Ex.: toquei em Cobrar e o WhatsApp não abriu." className="mt-2 p-3"/><div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-on-surface-variant"><span>{pathname}</span><span>{message.length}/1200</span></div><button disabled={sending || sent} className="mt-4 w-full bg-secondary py-3 font-heading font-bold text-on-secondary">{sent ? "Feedback enviado" : sending ? "Enviando..." : "Enviar feedback"}</button></form></div>}</>;
}

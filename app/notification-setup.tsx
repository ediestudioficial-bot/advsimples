"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = "BLdTfpi-0RhBu9Mhz0A8chVttVhB_kx8QNo8KjheuAE5xjlDQyWLWfcdzgLBQQio9YzUrLuDtphFUwQsmBMe6v4";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function NotificationSetup() {
  const [state, setState] = useState<"loading"|"unsupported"|"blocked"|"inactive"|"active">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported"); return;
      }
      if (Notification.permission === "denied") { setState("blocked"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "active" : "inactive");
    }
    check().catch(() => setState("inactive"));
  }, []);

  async function ativar() {
    try {
      setBusy(true);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState(permission === "denied" ? "blocked" : "inactive"); return; }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
      }
      const json = sub.toJSON();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error("Assinatura inválida");
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Belem";
      const { error } = await supabase.from("push_subscriptions").upsert({
        usuario_id: user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth_key: json.keys.auth,
        timezone,
      }, { onConflict: "usuario_id,endpoint" });
      if (error) throw error;
      setState("active");
      await reg.showNotification("ADV Simples", { body: "Alertas ativados. Você será avisado sobre prazos e audiências.", icon: "/icon.svg", badge: "/icon.svg", tag: "adv-simples-ativado" });
    } finally { setBusy(false); }
  }

  if (state === "loading" || state === "active") return state === "active" ? (
    <div className="card px-4 py-3 flex items-center gap-3 border-emerald-500/20">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-emerald-400 text-[20px]">notifications_active</span></div>
      <div className="min-w-0"><p className="text-sm font-semibold text-on-surface">Alertas ativos</p><p className="text-[11px] text-on-surface-variant">Prazos e audiências podem aparecer na tela de bloqueio.</p></div>
    </div>
  ) : null;

  if (state === "unsupported") return (
    <div className="card px-4 py-3 text-xs text-on-surface-variant">Este navegador não oferece Web Push neste dispositivo.</div>
  );

  if (state === "blocked") return (
    <div className="card px-4 py-3 border-error/20"><p className="text-sm font-semibold text-on-surface">Notificações bloqueadas</p><p className="text-xs text-on-surface-variant mt-1">Libere as notificações do ADV Simples nas configurações do navegador/celular.</p></div>
  );

  return (
    <button type="button" onClick={ativar} disabled={busy} className="card w-full px-4 py-4 flex items-center gap-3 text-left hover:border-secondary/30 transition">
      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><span className="material-symbols-outlined text-secondary">notifications</span></div>
      <div className="flex-1"><p className="text-sm font-bold text-on-surface">Ativar alertas importantes</p><p className="text-xs text-on-surface-variant mt-0.5">Receba prazos e audiências mesmo com o app fechado.</p></div>
      <span className="text-xs font-semibold text-secondary">{busy ? "Ativando..." : "Ativar"}</span>
    </button>
  );
}

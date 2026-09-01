"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "../theme-toggle";

const steps = [
  {
    icon: "waving_hand",
    eyebrow: "Bem-vindo ao ADV Simples",
    title: "Seu escritório, sem ruído.",
    text: "Aqui você não precisa ficar procurando o que fazer. O app organiza clientes, casos, prazos, documentos e cobranças para mostrar o que realmente exige sua atenção.",
    points: ["Comece sempre pela tela Hoje", "Cadastre o cliente antes do caso", "Deixe prazos e audiências com o app"],
  },
  {
    icon: "route",
    eyebrow: "Fluxo recomendado",
    title: "Use nesta ordem.",
    text: "O ADV Simples foi pensado para seguir o fluxo natural do escritório. Fazendo nessa sequência, tudo fica conectado e os alertas passam a trabalhar por você.",
    points: ["1. Cliente", "2. Caso", "3. Prazo ou audiência", "4. Documentos e cobranças"],
  },
  {
    icon: "notifications_active",
    eyebrow: "Você não precisa decorar tudo",
    title: "O app chama sua atenção.",
    text: "Prazos, audiências e cobranças importantes ganham destaque. Quando você permitir notificações, o ADV Simples também envia lembretes no momento certo.",
    points: ["Urgências aparecem primeiro", "Audiências recebem destaque", "Cada módulo terá dicas rápidas na primeira visita"],
  },
];

export default function WelcomeOnboarding({ nome, onboarding }: { nome: string; onboarding: Record<string, boolean> }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const current = steps[step];

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    await supabase.from("perfis").update({ onboarding: { ...onboarding, welcome: true } }).eq("id", user.id);
    router.replace("/hoje");
    router.refresh();
  }

  return <main className="relative min-h-screen overflow-hidden bg-background px-5 py-7 flex items-center justify-center">
    <div className="absolute right-5 top-5 z-20"><ThemeToggle /></div>
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
    </div>

    <section className="relative w-full max-w-[560px] rounded-[32px] border border-outline-variant/30 bg-surface-container-low/90 p-6 sm:p-9 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="ADV Simples" className="h-14 w-14 rounded-2xl" />
          <div><p className="font-heading text-lg font-bold text-on-surface">ADV <span className="text-secondary">Simples</span></p><p className="text-[10px] uppercase tracking-[.2em] text-on-surface-variant">Primeiros passos</p></div>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-[10px] font-semibold text-secondary">{step + 1} de {steps.length}</span>
      </div>

      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 shadow-lg">
        <span className="material-symbols-outlined text-[34px] text-secondary">{current.icon}</span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-secondary">{current.eyebrow}</p>
      <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-bold leading-tight text-on-surface">{step === 0 ? `Olá, ${nome.split(" ")[0]}. ` : ""}{current.title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-on-surface-variant">{current.text}</p>

      <div className="mt-6 grid gap-3">
        {current.points.map((point) => <div key={point} className="flex items-center gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container p-3.5">
          <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
          <span className="text-sm font-medium text-on-surface">{point}</span>
        </div>)}
      </div>

      <div className="mt-7 flex gap-2">{steps.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-secondary" : "bg-outline-variant/30"}`} />)}</div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button type="button" onClick={() => step > 0 ? setStep(step - 1) : void finish()} disabled={saving} className="px-3 py-3 text-sm font-semibold text-on-surface-variant disabled:opacity-50">{step > 0 ? "Voltar" : "Pular apresentação"}</button>
        <button type="button" onClick={() => step === steps.length - 1 ? void finish() : setStep(step + 1)} disabled={saving} className="rounded-2xl bg-gradient-to-b from-[#e8b74f] to-[#bd8127] px-5 py-3.5 font-heading font-bold text-[#172033] shadow-lg disabled:opacity-50">{saving ? "Preparando..." : step === steps.length - 1 ? "Começar a usar" : "Continuar"}</button>
      </div>
    </section>
  </main>;
}

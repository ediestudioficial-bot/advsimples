"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TourStep = { title: string; text: string; selector: string; icon: string };

const tours: Record<string, TourStep[]> = {
  hoje: [
    { title: "Seu centro de controle", text: "Comece sempre por aqui. O ADV Simples reúne o que exige sua atenção agora, sem você precisar procurar em várias telas.", selector: "main header", icon: "dashboard" },
    { title: "Visão rápida do dia", text: "Estes indicadores resumem pendências, urgências e audiências. Um olhar já mostra onde concentrar sua energia.", selector: "main section.grid", icon: "monitoring" },
    { title: "Prioridades em ordem", text: "Prazos e audiências aparecem organizados pela urgência. Datas críticas ganham destaque automaticamente.", selector: "main section.flex.flex-col", icon: "priority_high" },
    { title: "Tudo a um toque", text: "Use a barra inferior para navegar entre clientes, casos, prazos, finanças e documentos.", selector: ".premium-bottom-nav", icon: "touch_app" },
  ],
  clientes: [
    { title: "Cadastre o essencial", text: "Inclua o cliente com os dados básicos. Você pode começar rápido e organizar o restante conforme o atendimento evolui.", selector: "main section.card", icon: "person_add" },
    { title: "WhatsApp direto", text: "Quando houver telefone, toque no contato do cliente para abrir uma conversa no WhatsApp sem copiar número nenhum.", selector: "main section.space-y-3", icon: "chat" },
    { title: "Clientes organizados", text: "A lista concentra seus contatos e serve de base para casos, documentos e cobranças.", selector: "main header", icon: "groups" },
  ],
  casos: [
    { title: "Cada demanda no lugar certo", text: "Crie um caso e vincule ao cliente correto. Isso conecta prazos, documentos e financeiro à mesma demanda.", selector: "main section.card", icon: "work" },
    { title: "Carteira organizada", text: "Aqui você acompanha os casos já cadastrados sem misturar informações entre clientes.", selector: "main section.space-y-3", icon: "folder_open" },
  ],
  prazos: [
    { title: "Registre antes de esquecer", text: "Cadastre prazo ou audiência, escolha o caso, data e horário. O ADV Simples passa a acompanhar isso por você.", selector: "main section.card", icon: "add_alarm" },
    { title: "Alertas progressivos", text: "O sistema prepara lembretes antes do vencimento e reforça compromissos próximos. Audiências com horário recebem atenção extra.", selector: "main header", icon: "notifications_active" },
    { title: "Concluiu? Marque aqui", text: "Ao finalizar um prazo, marque como concluído. Ele deixa de aparecer como pendência no Hoje.", selector: "main section.space-y-3", icon: "task_alt" },
  ],
  financeiro: [
    { title: "Dinheiro sem planilha", text: "Veja rapidamente o que entrou no mês, o que vence nos próximos 30 dias e o que está atrasado.", selector: "main section.grid", icon: "account_balance_wallet" },
    { title: "Cadastre honorários e parcelas", text: "Crie uma cobrança, vincule ao cliente e, se quiser, ao caso. Informe valor e vencimento e deixe o app acompanhar.", selector: "main section.card", icon: "payments" },
    { title: "Cobrança prática", text: "Nas pendências você pode abrir o WhatsApp com a mensagem pronta ou marcar o valor como recebido em um toque.", selector: "main section.space-y-3", icon: "send" },
  ],
  documentos: [
    { title: "Controle o que está faltando", text: "Registre o documento solicitado e associe ao caso. Assim você não precisa voltar à conversa para lembrar o que pediu.", selector: "main section.card", icon: "note_add" },
    { title: "Pendências visíveis", text: "Marque cada documento quando chegar. O app mostra claramente o que foi recebido e o que ainda falta.", selector: "main section.space-y-4", icon: "inventory_2" },
    { title: "Peça pelo WhatsApp", text: "Quando houver documentos pendentes e telefone cadastrado, envie a lista ao cliente diretamente pelo WhatsApp.", selector: "main header", icon: "chat" },
  ],
};

export default function ModuleTour({ module }: { module: string }) {
  const steps = tours[module] ?? [];
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive || !user) return;
      setUserId(user.id);
      const { data } = await supabase.from("perfis").select("onboarding").eq("id", user.id).maybeSingle();
      const seen = (data?.onboarding ?? {}) as Record<string, boolean>;
      if (!alive) return;
      setOnboarding(seen);
      if (steps.length && !seen[module]) {
        window.setTimeout(() => { if (alive) { setStep(0); setOpen(true); } }, 650);
      }
    }
    void load();
    return () => { alive = false; };
  }, [module, steps.length, supabase]);

  useEffect(() => {
    if (!open || !steps[step]) return;
    const el = document.querySelector(steps[step].selector) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el.classList.add("tour-highlight"), 180);
    return () => el.classList.remove("tour-highlight");
  }, [open, step, steps]);

  async function finish() {
    setOpen(false);
    if (!userId) return;
    const next = { ...onboarding, [module]: true };
    setOnboarding(next);
    await supabase.from("perfis").update({ onboarding: next }).eq("id", userId);
  }

  function replay() { setStep(0); setOpen(true); }
  if (!steps.length) return null;
  const current = steps[step];

  return <>
    <button type="button" onClick={replay} title="Ver dicas deste módulo" aria-label="Ver dicas deste módulo" className="tour-help-button">
      <span className="material-symbols-outlined">help</span>
    </button>
    {open && <div className="tour-layer" role="dialog" aria-modal="true" aria-label={`Guia de ${module}`}>
      <div className="tour-card">
        <div className="tour-card-top">
          <div className="tour-icon"><span className="material-symbols-outlined">{current.icon}</span></div>
          <div className="min-w-0 flex-1"><p className="tour-kicker">Guia rápido · {step + 1} de {steps.length}</p><h2>{current.title}</h2></div>
          <button type="button" onClick={finish} className="tour-close" aria-label="Fechar guia"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="tour-text">{current.text}</p>
        <div className="tour-progress">{steps.map((_,i)=><span key={i} className={i===step?"active":""}/>)}</div>
        <div className="tour-actions">
          <button type="button" onClick={finish} className="tour-skip">Pular dicas</button>
          <div className="flex gap-2">
            {step>0&&<button type="button" onClick={()=>setStep(s=>s-1)} className="tour-secondary">Voltar</button>}
            <button type="button" onClick={()=>step===steps.length-1?void finish():setStep(s=>s+1)} className="tour-primary">{step===steps.length-1?"Entendi":"Próximo"}</button>
          </div>
        </div>
      </div>
    </div>}
  </>;
}

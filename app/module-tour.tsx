"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TourStep = {
  title: string;
  text: string;
  action: string;
  selector: string;
  icon: string;
};

const tours: Record<string, TourStep[]> = {
  hoje: [
    {
      title: "Esta é a sua tela principal",
      text: "Sempre que abrir o ADV Simples, comece pelo Hoje. Aqui ficam reunidas as coisas que precisam da sua atenção primeiro.",
      action: "Use esta tela para decidir o que fazer antes de abrir os outros módulos.",
      selector: "main header",
      icon: "dashboard",
    },
    {
      title: "Veja o que está urgente",
      text: "Estes três números mostram quantas pendências existem, quantas já são urgentes e quantas são audiências.",
      action: "Se o número de urgentes subir, abra Prazos e resolva os itens críticos primeiro.",
      selector: "main section.grid",
      icon: "monitoring",
    },
    {
      title: "As prioridades aparecem aqui",
      text: "Prazos, audiências e cobranças importantes aparecem organizados para você não depender da memória.",
      action: "Leia esta área antes de começar o dia e conclua os itens conforme forem resolvidos.",
      selector: "main section.flex.flex-col",
      icon: "priority_high",
    },
    {
      title: "Navegue por aqui",
      text: "A barra inferior leva aos seis módulos principais: Hoje, Clientes, Casos, Prazos, Finanças e Documentos.",
      action: "O fluxo recomendado é: Cliente → Caso → Prazo/Documento/Finança.",
      selector: ".premium-bottom-nav",
      icon: "touch_app",
    },
  ],
  clientes: [
    {
      title: "Comece cadastrando o cliente",
      text: "Antes de criar caso, prazo, documento ou cobrança, cadastre a pessoa atendida aqui.",
      action: "Informe pelo menos o nome. WhatsApp e e-mail podem ser adicionados quando você tiver esses dados.",
      selector: "main section.card",
      icon: "person_add",
    },
    {
      title: "Sua carteira fica nesta lista",
      text: "Cada cliente cadastrado aparece aqui. O telefone, quando informado, vira um atalho direto para o WhatsApp.",
      action: "Depois de cadastrar o cliente, vá para Casos e crie a demanda ligada a ele.",
      selector: "main section.space-y-3",
      icon: "groups",
    },
    {
      title: "Regra simples para não se perder",
      text: "Cliente é a pessoa. Caso é a demanda jurídica. Não misture os dois: um mesmo cliente pode ter vários casos.",
      action: "Cadastre o cliente uma vez e reutilize esse cadastro nos próximos atendimentos.",
      selector: "main header",
      icon: "account_tree",
    },
  ],
  casos: [
    {
      title: "Crie uma demanda para o cliente",
      text: "Aqui você transforma o atendimento em um caso organizado. Primeiro escolha o cliente e depois dê um nome claro à demanda.",
      action: "Exemplo: João da Silva → Ação de Cobrança. Evite títulos genéricos como apenas 'Processo'.",
      selector: "main section.card",
      icon: "work",
    },
    {
      title: "Os casos ativos ficam aqui",
      text: "Esta lista mostra cada demanda separada e o cliente a quem ela pertence.",
      action: "Depois de criar o caso, use Prazos, Documentos e Finanças sempre vinculando ao caso correto.",
      selector: "main section.space-y-3",
      icon: "folder_open",
    },
  ],
  prazos: [
    {
      title: "Cadastre o compromisso assim que souber dele",
      text: "Escolha o caso, informe se é prazo ou audiência e registre data e horário quando houver.",
      action: "Não deixe para depois: é este cadastro que alimenta o Hoje e os alertas automáticos.",
      selector: "main section.card",
      icon: "add_alarm",
    },
    {
      title: "O ADV Simples passa a lembrar por você",
      text: "Os alertas são progressivos antes do vencimento. Audiências com horário recebem atenção adicional perto do compromisso.",
      action: "Mantenha as notificações do navegador/PWA ativadas para receber esses avisos.",
      selector: "main header",
      icon: "notifications_active",
    },
    {
      title: "Concluiu? Tire da fila",
      text: "Os prazos cadastrados aparecem nesta área. Quando resolver um deles, use o botão Concluir.",
      action: "Ao concluir, o item deixa de contar como pendência no Hoje e sua tela principal fica limpa.",
      selector: "main section.space-y-3",
      icon: "task_alt",
    },
  ],
  financeiro: [
    {
      title: "Veja sua situação financeira de relance",
      text: "Os três cartões mostram o que entrou no mês, o que vence nos próximos 30 dias e o que já está atrasado.",
      action: "Use o valor em atraso como sua lista imediata de cobrança.",
      selector: "main section.grid",
      icon: "account_balance_wallet",
    },
    {
      title: "Cadastre cada valor a receber",
      text: "Crie a cobrança, escolha o cliente, vincule ao caso quando fizer sentido e informe descrição, valor e vencimento.",
      action: "Cadastre parcelas separadamente para que cada vencimento gere acompanhamento próprio.",
      selector: "main section.card",
      icon: "payments",
    },
    {
      title: "Acompanhe até o recebimento",
      text: "As cobranças pendentes ficam nesta lista. Você pode cobrar pelo WhatsApp ou marcar o valor como pago.",
      action: "Só marque como pago depois de confirmar o recebimento. Assim o resumo mensal permanece confiável.",
      selector: "main section.space-y-3",
      icon: "check_circle",
    },
  ],
  documentos: [
    {
      title: "Registre o documento que está faltando",
      text: "Escolha o caso e escreva o nome do documento solicitado. Isso cria uma pendência visível no app.",
      action: "Exemplos: RG, comprovante de residência, procuração, contrato ou extrato bancário.",
      selector: "main section.card",
      icon: "note_add",
    },
    {
      title: "Confira o que chegou e o que falta",
      text: "Os documentos ficam agrupados por caso. Cada item mostra claramente se ainda está pendente ou já foi recebido.",
      action: "Quando o cliente enviar o documento, toque em Recebido para limpar a pendência.",
      selector: "main section.space-y-4",
      icon: "inventory_2",
    },
    {
      title: "Não procure mensagens antigas",
      text: "Quando houver pendências e telefone cadastrado, o ADV Simples prepara a solicitação para enviar pelo WhatsApp.",
      action: "Use esse recurso para cobrar todos os documentos pendentes daquele caso de uma só vez.",
      selector: "main header",
      icon: "chat",
    },
  ],
};

export default function ModuleTour({ module }: { module: string }) {
  const steps = tours[module] ?? [];
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [targetFound, setTargetFound] = useState(true);
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
        window.setTimeout(() => {
          if (alive) {
            setStep(0);
            setOpen(true);
          }
        }, 700);
      }
    }
    void load();
    return () => { alive = false; };
  }, [module, steps.length, supabase]);

  useEffect(() => {
    if (!open || !steps[step]) return;
    const el = document.querySelector(steps[step].selector) as HTMLElement | null;
    setTargetFound(Boolean(el));
    if (!el) {
      setPlacement("bottom");
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setPlacement(rect.top + rect.height / 2 > window.innerHeight * 0.52 ? "top" : "bottom");
      el.classList.add("tour-highlight");
    }, 260);

    return () => {
      window.clearTimeout(timer);
      el.classList.remove("tour-highlight");
    };
  }, [open, step, steps]);

  async function finish() {
    setOpen(false);
    if (!userId) return;
    const next = { ...onboarding, [module]: true };
    setOnboarding(next);
    await supabase.from("perfis").update({ onboarding: next }).eq("id", userId);
  }

  function next() {
    if (step >= steps.length - 1) {
      void finish();
      return;
    }
    setStep((s) => s + 1);
  }

  function replay() {
    setStep(0);
    setOpen(true);
  }

  if (!steps.length) return null;
  const current = steps[step];

  return <>
    <button type="button" onClick={replay} title="Ver dicas deste módulo" aria-label="Ver dicas deste módulo" className="tour-help-button">
      <span className="material-symbols-outlined">help</span>
    </button>

    {open && <div
      className="tour-layer"
      role="dialog"
      aria-modal="true"
      aria-label={`Guia de ${module}`}
      onClick={next}
    >
      <div className={`tour-card tour-card-${placement}`} onClick={(e) => e.stopPropagation()}>
        <div className="tour-card-top">
          <div className="tour-icon"><span className="material-symbols-outlined">{current.icon}</span></div>
          <div className="min-w-0 flex-1">
            <p className="tour-kicker">Passo {step + 1} de {steps.length}</p>
            <h2>{current.title}</h2>
          </div>
          <button type="button" onClick={() => void finish()} className="tour-close" aria-label="Fechar guia">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="tour-text">{current.text}</p>
        <div className="tour-do">
          <span className="material-symbols-outlined">touch_app</span>
          <p><strong>O que fazer:</strong> {current.action}</p>
        </div>
        {!targetFound && <p className="tour-fallback">Esta área ainda está vazia. Ela aparecerá assim que você fizer o primeiro cadastro.</p>}

        <div className="tour-progress">{steps.map((_, i) => <span key={i} className={i === step ? "active" : i < step ? "done" : ""} />)}</div>
        <p className="tour-tap-hint">Você também pode tocar fora deste cartão para continuar.</p>

        <div className="tour-actions">
          <button type="button" onClick={() => void finish()} className="tour-skip">Encerrar guia</button>
          <div className="flex gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)} className="tour-secondary">Voltar</button>}
            <button type="button" onClick={next} className="tour-primary">{step === steps.length - 1 ? "Concluir" : "Próximo"}</button>
          </div>
        </div>
      </div>
    </div>}
  </>;
}

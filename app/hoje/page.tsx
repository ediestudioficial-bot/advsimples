import { createClient } from "@/lib/supabase/server";
import Nav from "../nav";

type Prazo = {
  id: string;
  tipo: string;
  descricao: string | null;
  data_limite: string;
  concluido: boolean;
  casos: {
    titulo: string;
    clientes: {
      nome: string;
    } | null;
  } | null;
};

function classificarUrgencia(dataLimite: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataLimite + "T00:00:00");
  const diffDias = Math.round(
    (data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDias < 0)
    return {
      label: "Atrasado",
      urgencyClass: "urgency-overdue",
      badgeClass: "bg-error-container text-on-error-container",
      valueClass: "text-error",
    };
  if (diffDias === 0)
    return {
      label: "Hoje",
      urgencyClass: "urgency-today",
      badgeClass: "bg-secondary text-on-secondary",
      valueClass: "text-secondary",
    };
  if (diffDias === 1)
    return {
      label: "Amanhã",
      urgencyClass: "urgency-tomorrow",
      badgeClass: "bg-secondary-container text-on-secondary-container",
      valueClass: "text-secondary-fixed-dim",
    };
  return {
    label: `Em ${diffDias} dias`,
    urgencyClass: "urgency-upcoming",
    badgeClass: "bg-surface-container-high text-on-surface-variant",
    valueClass: "text-on-surface-variant",
    peso: 3,
  };
}

function peso(dataLimite: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataLimite + "T00:00:00");
  const diffDias = Math.round((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 0;
  if (diffDias === 0) return 1;
  if (diffDias === 1) return 2;
  return 3;
}

export default async function HojePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prazos")
    .select(
      `id, tipo, descricao, data_limite, concluido,
       casos ( titulo, clientes ( nome ) )`
    )
    .eq("concluido", false)
    .order("data_limite", { ascending: true })
    .returns<Prazo[]>();

  const prazos = (data ?? []).sort(
    (a, b) => peso(a.data_limite) - peso(b.data_limite) || a.data_limite.localeCompare(b.data_limite)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Nav active="hoje" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-on-surface">Visão Geral</h1>
        </header>

        {error && (
          <div className="text-error bg-error-container/20 border border-error rounded-lg p-4">
            Erro ao carregar prazos: {error.message}
          </div>
        )}

        {!error && prazos.length === 0 && (
          <div className="text-center text-on-surface-variant py-16">
            <span className="material-symbols-outlined text-4xl mb-2 block">celebration</span>
            <p className="text-lg font-heading">Nenhum prazo pendente.</p>
            <p className="text-sm mt-1">Cadastre um cliente e um caso para começar.</p>
          </div>
        )}

        <section className="flex flex-col gap-md">
          {prazos.map((prazo) => {
            const u = classificarUrgencia(prazo.data_limite);
            const dataFormatada = new Date(prazo.data_limite + "T00:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            });
            return (
              <article
                key={prazo.id}
                className={`card border border-l-4 ${u.urgencyClass} rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`${u.badgeClass} font-heading text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider`}>
                      {u.label}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {prazo.tipo === "audiencia" ? "Audiência" : "Prazo"}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-on-surface mt-1">
                    {prazo.casos?.titulo ?? "Caso"}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    {prazo.casos?.clientes?.nome ?? "Cliente"}
                  </p>
                  {prazo.descricao && (
                    <p className="text-sm text-on-surface-variant mt-1">{prazo.descricao}</p>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-outline-variant pt-2 sm:pt-0 sm:pl-4 mt-1 sm:mt-0">
                  <div className={`${u.valueClass} flex flex-col items-start sm:items-end`}>
                    <span className="text-[11px] uppercase tracking-wide opacity-80">Data</span>
                    <span className="font-heading text-xl font-bold">{dataFormatada}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

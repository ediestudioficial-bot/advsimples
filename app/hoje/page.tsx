import { createClient } from "@/lib/supabase/server";
import Nav from "../nav";
import NotificationSetup from "../notification-setup";

type Prazo = {
  id: string;
  tipo: string;
  descricao: string | null;
  data_limite: string;
  concluido: boolean;
  casos: { titulo: string; clientes: { nome: string } | null } | null;
};

function classificarUrgencia(dataLimite: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataLimite + "T00:00:00");
  const diffDias = Math.round((data.getTime() - hoje.getTime()) / 86400000);
  if (diffDias < 0) return { label: "Atrasado", urgencyClass: "urgency-overdue", badgeClass: "bg-error/10 text-error border-error/20", valueClass: "text-error" };
  if (diffDias === 0) return { label: "Hoje", urgencyClass: "urgency-today", badgeClass: "bg-secondary/12 text-secondary border-secondary/20", valueClass: "text-secondary" };
  if (diffDias === 1) return { label: "Amanhã", urgencyClass: "urgency-tomorrow", badgeClass: "bg-secondary/8 text-secondary-fixed-dim border-secondary/15", valueClass: "text-secondary-fixed-dim" };
  return { label: `Em ${diffDias} dias`, urgencyClass: "urgency-upcoming", badgeClass: "bg-surface-container-high text-on-surface-variant border-outline-variant/30", valueClass: "text-on-surface-variant" };
}

function peso(dataLimite: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataLimite + "T00:00:00");
  const diffDias = Math.round((data.getTime() - hoje.getTime()) / 86400000);
  if (diffDias < 0) return 0;
  if (diffDias === 0) return 1;
  if (diffDias === 1) return 2;
  return 3;
}

export default async function HojePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("prazos").select(`id, tipo, descricao, data_limite, concluido, casos ( titulo, clientes ( nome ) )`).eq("concluido", false).order("data_limite", { ascending: true }).returns<Prazo[]>();
  const prazos = (data ?? []).sort((a, b) => peso(a.data_limite) - peso(b.data_limite) || a.data_limite.localeCompare(b.data_limite));
  const urgentes = prazos.filter((p) => peso(p.data_limite) <= 1).length;
  const audiencias = prazos.filter((p) => p.tipo === "audiencia").length;

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-28">
      <Nav active="hoje" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header>
          <p className="text-secondary text-[11px] uppercase tracking-[.24em] font-semibold mb-2">Centro de controle</p>
          <h1 className="font-heading text-4xl font-bold text-on-surface">Hoje</h1>
          <p className="text-on-surface-variant text-sm mt-2">O que precisa da sua atenção, sem ruído.</p>
        </header>

        <NotificationSetup />

        <section className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center"><p className="text-2xl font-heading font-bold text-on-surface">{prazos.length}</p><p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Pendentes</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-heading font-bold text-secondary">{urgentes}</p><p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Urgentes</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-heading font-bold text-primary">{audiencias}</p><p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Audiências</p></div>
        </section>

        {error && <div className="card text-error border-error/30 p-4">Erro ao carregar prazos: {error.message}</div>}

        {!error && prazos.length === 0 && (
          <div className="card text-center text-on-surface-variant py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-3 shadow-lg"><span className="material-symbols-outlined text-secondary text-3xl">done_all</span></div>
            <p className="text-lg font-heading font-bold text-on-surface">Tudo sob controle.</p>
            <p className="text-sm mt-1">Nenhum prazo pendente agora.</p>
          </div>
        )}

        <section className="flex flex-col gap-4">
          {prazos.map((prazo) => {
            const u = classificarUrgencia(prazo.data_limite);
            const dataFormatada = new Date(prazo.data_limite + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            return (
              <article key={prazo.id} className={`card border-l-[3px] ${u.urgencyClass} p-5 flex items-center justify-between gap-4`}>
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shadow-lg">
                    <span className={`material-symbols-outlined ${prazo.tipo === "audiencia" ? "text-error" : "text-secondary"}`}>{prazo.tipo === "audiencia" ? "gavel" : "schedule"}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`${u.badgeClass} border font-heading text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider`}>{u.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{prazo.tipo === "audiencia" ? "Audiência" : "Prazo"}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-on-surface mt-2 truncate">{prazo.casos?.titulo ?? "Caso"}</h3>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1 truncate"><span className="material-symbols-outlined text-[16px]">person</span>{prazo.casos?.clientes?.nome ?? "Cliente"}</p>
                    {prazo.descricao && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{prazo.descricao}</p>}
                  </div>
                </div>
                <div className={`${u.valueClass} shrink-0 text-right pl-3 border-l border-outline-variant/25`}>
                  <span className="text-[9px] uppercase tracking-[.16em] opacity-70 block">Data</span>
                  <span className="font-heading text-xl font-bold capitalize">{dataFormatada}</span>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

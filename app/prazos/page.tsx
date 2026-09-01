import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";
import PremiumSelect from "../premium-select";

async function criarPrazo(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const caso_id = formData.get("caso_id") as string;
  const tipo = formData.get("tipo") as string;
  const descricao = formData.get("descricao") as string;
  const data_limite = formData.get("data_limite") as string;
  const hora_limite = formData.get("hora_limite") as string;
  await supabase.from("prazos").insert({ caso_id, tipo, descricao: descricao || null, data_limite, hora_limite: hora_limite || null });
  revalidatePath("/prazos");
  revalidatePath("/hoje");
}

async function marcarConcluido(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("prazos").update({ concluido: true }).eq("id", id);
  revalidatePath("/prazos");
  revalidatePath("/hoje");
}

export default async function PrazosPage() {
  const supabase = await createClient();
  const [{ data: casos }, { data: prazos }] = await Promise.all([
    supabase.from("casos").select("id, titulo, clientes ( nome )").order("titulo"),
    supabase.from("prazos").select("id, tipo, descricao, data_limite, hora_limite, concluido, casos ( titulo, clientes ( nome ) )").order("data_limite", { ascending: true }),
  ]);
  const opcoesCasos = (casos ?? []).map((c) => ({ value: c.id, label: `${(c.clientes as unknown as { nome: string } | null)?.nome ?? "Cliente"} — ${c.titulo}` }));

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-28">
      <Nav active="prazos" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header>
          <p className="text-secondary text-[11px] uppercase tracking-[.24em] font-semibold mb-2">Prioridades</p>
          <h1 className="font-heading text-4xl font-bold text-on-surface">Prazos</h1>
          <p className="text-on-surface-variant text-sm mt-2">O que não pode passar despercebido.</p>
        </header>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20"><span className="material-symbols-outlined text-secondary">add_alarm</span></div>
            <div><h2 className="font-heading text-lg font-semibold text-on-surface">Novo prazo ou audiência</h2><p className="text-xs text-on-surface-variant">Registre agora para não depender da memória.</p></div>
          </div>
          {opcoesCasos.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Cadastre um caso primeiro.</p>
          ) : (
            <form action={criarPrazo} className="space-y-3">
              <PremiumSelect name="caso_id" placeholder="Selecione o caso" options={opcoesCasos} />
              <PremiumSelect name="tipo" defaultValue="prazo" options={[{ value: "prazo", label: "Prazo" }, { value: "audiencia", label: "Audiência" }]} />
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="mb-1.5 block text-[10px] uppercase tracking-[.14em] text-on-surface-variant">Data</span><input name="data_limite" type="date" required className="px-4 py-3 text-on-surface" /></label>
                <label className="block"><span className="mb-1.5 block text-[10px] uppercase tracking-[.14em] text-on-surface-variant">Horário</span><input name="hora_limite" type="time" className="px-4 py-3 text-on-surface" /></label>
              </div>
              <input name="descricao" placeholder="Descrição (opcional)" className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant" />
              <div className="rounded-xl border border-secondary/15 bg-secondary/5 px-3 py-2.5 flex gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">notifications_active</span><p className="text-[11px] text-on-surface-variant">Alertas progressivos: 7 dias, 3 dias, amanhã e no dia. Audiências com horário também recebem alerta próximo do compromisso.</p></div>
              <button type="submit" className="w-full bg-secondary text-on-secondary font-heading font-bold py-3 hover:brightness-110 transition">Cadastrar</button>
            </form>
          )}
        </section>

        <section className="space-y-3">
          {(prazos ?? []).length === 0 && <div className="card p-7 text-center text-on-surface-variant">Nenhum prazo ainda.</div>}
          {(prazos ?? []).map((p) => {
            const caso = p.casos as unknown as { clientes: { nome: string } | null; titulo: string } | null;
            return (
              <article key={p.id} className={`card p-5 flex items-center justify-between gap-4 ${p.concluido ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center border shadow-lg ${p.tipo === "audiencia" ? "bg-error/8 border-error/20 text-error" : "bg-secondary/10 border-secondary/20 text-secondary"}`}>
                    <span className="material-symbols-outlined">{p.tipo === "audiencia" ? "gavel" : "schedule"}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1"><span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{p.tipo === "audiencia" ? "Audiência" : "Prazo"}</span></div>
                    <h3 className="font-heading font-bold text-on-surface truncate">{caso?.clientes?.nome ?? "Cliente"} — {caso?.titulo}</h3>
                    <p className="text-sm text-secondary-fixed-dim mt-1 font-semibold">{new Date(p.data_limite + "T00:00:00").toLocaleDateString("pt-BR")}{p.hora_limite ? ` · ${String(p.hora_limite).slice(0,5)}` : ""}</p>
                    {p.descricao && <p className="text-xs text-on-surface-variant mt-1">{p.descricao}</p>}
                  </div>
                </div>
                {!p.concluido && (
                  <form action={marcarConcluido} className="shrink-0">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="!min-h-0 text-[11px] text-secondary border border-secondary/35 bg-secondary/5 rounded-lg px-3 py-2">Concluir</button>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

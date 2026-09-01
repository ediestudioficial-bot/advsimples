import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Nav from "../nav";
import PremiumSelect from "../premium-select";

function limparTelefone(telefone: string | null) {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

async function adicionarDocumento(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const caso_id = formData.get("caso_id") as string;
  const nome_documento = formData.get("nome_documento") as string;
  await supabase.from("documentos").insert({ caso_id, nome_documento });
  revalidatePath("/documentos");
}

async function marcarRecebido(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("documentos").update({ recebido: true }).eq("id", id);
  revalidatePath("/documentos");
}

type CasoComDocs = {
  id: string;
  titulo: string;
  clientes: { nome: string; telefone: string | null } | null;
  documentos: { id: string; nome_documento: string; recebido: boolean }[];
};

export default async function DocumentosPage() {
  const supabase = await createClient();
  const [{ data: casos }, { data: casosComDocs }] = await Promise.all([
    supabase.from("casos").select("id, titulo, clientes ( nome )").order("titulo"),
    supabase.from("casos").select("id, titulo, clientes ( nome, telefone ), documentos ( id, nome_documento, recebido )").order("titulo").returns<CasoComDocs[]>(),
  ]);

  const casosComPendencias = (casosComDocs ?? []).filter((c) => c.documentos && c.documentos.length > 0);
  const opcoesCasos = (casos ?? []).map((c) => ({
    value: c.id,
    label: `${(c.clientes as unknown as { nome: string } | null)?.nome ?? "Cliente"} — ${c.titulo}`,
  }));

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-28">
      <Nav active="documentos" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile py-xl flex flex-col gap-xl">
        <header>
          <p className="text-secondary text-[11px] uppercase tracking-[.24em] font-semibold mb-2">Organização</p>
          <h1 className="font-heading text-4xl font-bold text-on-surface">Documentos</h1>
          <p className="text-on-surface-variant text-sm mt-2">Pendências e arquivos essenciais de cada caso.</p>
        </header>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shadow-lg">
              <span className="material-symbols-outlined text-secondary">note_add</span>
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">Solicitar documento</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Associe a pendência ao caso correto.</p>
            </div>
          </div>

          {opcoesCasos.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Cadastre um caso primeiro.</p>
          ) : (
            <form action={adicionarDocumento} className="space-y-3">
              <PremiumSelect name="caso_id" placeholder="Selecione o caso" options={opcoesCasos} />
              <input
                name="nome_documento"
                required
                placeholder="Nome do documento (ex: RG)"
                className="px-4 py-3 text-on-surface placeholder:text-on-surface-variant"
              />
              <button type="submit" className="w-full bg-secondary text-on-secondary font-heading font-bold py-3 hover:brightness-110 transition">
                Adicionar à lista
              </button>
            </form>
          )}
        </section>

        <section className="space-y-4">
          {casosComPendencias.length === 0 && (
            <div className="card p-7 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-secondary/70 mb-2">inventory_2</span>
              <p className="font-heading font-semibold text-on-surface">Tudo organizado por aqui.</p>
              <p className="text-sm mt-1">Nenhum documento cadastrado ainda.</p>
            </div>
          )}

          {casosComPendencias.map((caso) => {
            const pendentes = caso.documentos.filter((d) => !d.recebido);
            const recebidos = caso.documentos.length - pendentes.length;
            const telefone = limparTelefone(caso.clientes?.telefone ?? null);
            const mensagem = pendentes.length > 0
              ? `Olá, ${caso.clientes?.nome ?? ""}! Ainda precisamos dos seguintes documentos para prosseguir com "${caso.titulo}": ${pendentes.map((d) => d.nome_documento).join(", ")}.`
              : "";
            const linkWhatsApp = telefone ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}` : null;

            return (
              <article key={caso.id} className="card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 border border-secondary/15 rounded-full px-2.5 py-1">
                        {pendentes.length} pendente{pendentes.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">{recebidos}/{caso.documentos.length} recebidos</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-on-surface truncate">{caso.clientes?.nome ?? "Cliente"}</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5 truncate">{caso.titulo}</p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-secondary">folder_open</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {caso.documentos.map((doc) => (
                    <div key={doc.id} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 border ${doc.recebido ? "bg-surface-container-low/35 border-outline-variant/20" : "bg-surface-container-low border-outline-variant/35 shadow-md"}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`material-symbols-outlined text-[19px] ${doc.recebido ? "text-emerald-400" : "text-secondary"}`}>
                          {doc.recebido ? "check_circle" : "pending_actions"}
                        </span>
                        <span className={`text-sm truncate ${doc.recebido ? "text-on-surface-variant line-through" : "text-on-surface font-medium"}`}>{doc.nome_documento}</span>
                      </div>
                      {!doc.recebido && (
                        <form action={marcarRecebido} className="shrink-0">
                          <input type="hidden" name="id" value={doc.id} />
                          <button type="submit" className="!min-h-0 text-[11px] text-secondary border border-secondary/35 bg-secondary/5 rounded-lg px-3 py-1.5 hover:bg-secondary/10">
                            Recebido
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>

                {pendentes.length > 0 && linkWhatsApp && (
                  <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-500/25 bg-emerald-500/8 text-emerald-300 py-3 text-sm font-semibold shadow-lg hover:bg-emerald-500/12 transition">
                    <span className="material-symbols-outlined text-[19px]">chat</span>
                    Solicitar pelo WhatsApp
                  </a>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
